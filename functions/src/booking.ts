import * as functions from 'firebase-functions/v1';
import type { Firestore } from 'firebase-admin/firestore';

export function minutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i.exec(time || '');
  if (!m) throw new functions.https.HttpsError('invalid-argument', 'A valid appointment time is required.');
  let h = Number(m[1]); const min = Number(m[2]);
  if (min > 59 || h > (m[3] ? 12 : 23) || (m[3] && h < 1)) throw new functions.https.HttpsError('invalid-argument', 'Invalid time.');
  if (m[3]) h = h % 12 + (m[3].toUpperCase() === 'PM' ? 12 : 0);
  return h * 60 + min;
}
export function moneyMinor(value: unknown): number {
  const n = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(n) || n <= 0 || n > 10000) throw new functions.https.HttpsError('failed-precondition', 'Configure a valid service fee.');
  return Math.round(n * 100);
}
export function overlap(a: {start:number;end:number}, b: {start:number;end:number}) { return a.start < b.end && b.start < a.end; }
const active = (a: any) => a.source === 'booking' && a.date && a.time && !['cancelled','archived','waitlist'].includes(a.status);
const safeId = (s: unknown) => typeof s === 'string' && /^[\w-]{1,100}$/.test(s);
const fields = ['name','email','phone','condition','serviceType','serviceId','serviceTitle','practitionerId','practitionerName','date','time','locationId','notes','preferredTimeWindow','status','cancellationReason','intakeForm'];

export function bookingHandlers(db: Firestore) {
  return {
    mutate: async (data: any, context: functions.https.CallableContext) => {
      if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in to save an appointment.');
      if (!safeId(data.id) || !safeId(data.clinicId)) throw new functions.https.HttpsError('invalid-argument', 'Valid clinic and appointment IDs required.');
      if (!data.patch || JSON.stringify(data.patch).length > 500000) throw new functions.https.HttpsError('invalid-argument', 'Invalid appointment data.');
      const uid = context.auth.uid;
      const staff = context.auth.token.clinicId === data.clinicId && ['admin','staff'].includes(context.auth.token.role);
      const ref = db.doc(`appointments/${data.id}`);
      return db.runTransaction(async tx => {
        const snap = await tx.get(ref); const old = snap.data();
        const clinic = (await tx.get(db.doc(`clinics/${data.clinicId}`))).data();
        const limits = db.doc(`booking_limits/${uid}`); const rate = (await tx.get(limits)).data();
        if (!clinic) throw new functions.https.HttpsError('failed-precondition', 'Clinic configuration is unavailable.');
        if (old && (old.clinicId !== data.clinicId || (!staff && old.patientId !== uid))) throw new functions.https.HttpsError('permission-denied', 'Appointment access denied.');
        if (!old && data.action === 'delete') throw new functions.https.HttpsError('not-found', 'Appointment not found.');
        if (data.action === 'delete' && !staff) throw new functions.https.HttpsError('permission-denied', 'Staff access required.');
        const patch: Record<string, any> = {};
        for (const key of fields) if (data.patch[key] !== undefined) patch[key] = data.patch[key];
        if (!staff && old && Object.keys(patch).some(k => !['date','time','notes','cancellationReason','intakeForm','status'].includes(k) && JSON.stringify(patch[k]) !== JSON.stringify(old[k]))) throw new functions.https.HttpsError('permission-denied', 'Contact the clinic to change these details.');
        if (!staff && patch.status && !['new','cancelled'].includes(patch.status)) throw new functions.https.HttpsError('permission-denied', 'This status is managed by the clinic.');
        if (patch.intakeForm && (!patch.intakeForm.informedConsentAgreed || !/^data:image\/(png|jpeg);base64,/.test(patch.intakeForm.signatureDataUrl || ''))) throw new functions.https.HttpsError('invalid-argument', 'Consent and a signature are required.');
        const next: any = { ...(old || { id: data.id, clinicId: data.clinicId, patientId: uid, createdAt: new Date().toISOString(), paymentStatus: 'unpaid', amountPaid: 0, status: 'new', source: data.patch.source === 'contact' ? 'contact' : 'booking' }), ...patch };
        if (!next.name || (!next.phone && !next.email)) throw new functions.https.HttpsError('invalid-argument', 'Name and contact details are required.');
        for (const k of ['name','email','phone','condition','notes']) if (next[k] && (typeof next[k] !== 'string' || next[k].length > 5000)) throw new functions.https.HttpsError('invalid-argument', 'Invalid contact details.');
        if (old?.stripePaymentIntentId && ['serviceType','serviceId'].some(k => patch[k] && patch[k] !== old[k])) throw new functions.https.HttpsError('failed-precondition', 'Contact the clinic before changing a payment-linked service.');
        if (next.source === 'booking' && !['waitlist','cancelled','archived'].includes(next.status) && data.action !== 'delete') {
          const team = clinic.publicTeamMembers || [];
          const clinician = team.find((p:any) => p.id === next.practitionerId || p.name === next.practitionerName) || (!next.practitionerId ? team.find((p:any)=>p.showOnWebsite!==false) : null);
          if (!clinician) throw new functions.https.HttpsError('failed-precondition', 'Choose a configured clinician.');
          next.practitionerId = clinician.id; next.practitionerName = clinician.name;
          const service = next.serviceType === 'custom' ? clinic.customFeeItems?.find((p:any)=>p.id===next.serviceId || p.title===next.serviceTitle) : null;
          if (next.serviceType === 'custom' && !service) throw new functions.https.HttpsError('invalid-argument', 'Unknown service.');
          next.durationMinutes = service?.durationMinutes || (next.serviceType === 'custom' ? 35 : next.serviceType === 'followup' ? 20 : clinic.schedulingRules?.slotDurationMinutes || 45);
          next.priceMinor = (old && !['serviceType','serviceId'].some(k => patch[k] && patch[k] !== old[k]) ? old.priceMinor : 0) || moneyMinor(service?.price || (next.serviceType === 'followup' ? clinic.followUpFee : clinic.examFee));
          next.depositMinor = Math.min(next.priceMinor, Math.round(Number(clinic.paymentPolicy?.depositAmount || 0)*100));
          next.currency = clinic.currencySymbol === '£' ? 'gbp' : clinic.currencySymbol === '€' ? 'eur' : 'usd';
          next.timeZone = clinic.timeZone || 'America/New_York';
          const loc = (clinic.locations || []).find((l:any)=>l.id===next.locationId) || clinic.locations?.[0];
          if (next.locationId && loc?.id !== next.locationId) throw new functions.https.HttpsError('invalid-argument', 'Unknown location.');
          if (loc) { next.locationId=loc.id; next.locationName=loc.name; next.locationAddress=loc.address; }
          if (active(next) && data.action !== 'delete') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(next.date) || !Number.isFinite(Date.parse(next.date)) || new Date(next.date).toISOString().slice(0,10) !== next.date) throw new functions.https.HttpsError('invalid-argument','Choose a valid date.');
            const start = minutes(next.time); const day = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date(next.date+'T12:00:00Z').getUTCDay()];
            const rules = clinic.schedulingRules; const hours = rules?.weeklySchedule?.[day];
            const doctor = rules?.practitionerOverrides?.find((p:any)=>p.practitionerId===next.practitionerId);
            if (!hours?.enabled || rules.clinicClosedDates?.includes(next.date) || doctor?.isOnHoliday || doctor?.holidayDates?.includes(next.date) || doctor?.weeklyOffDays?.includes(new Date(next.date+'T12:00:00Z').getUTCDay()) || start < minutes(hours.openTime) || start+next.durationMinutes > minutes(hours.closeTime) || (hours.lunchBreakEnabled && overlap({start,end:start+next.durationMinutes},{start:minutes(hours.lunchStart),end:minutes(hours.lunchEnd)}))) throw new functions.https.HttpsError('failed-precondition','The clinic or clinician is unavailable at this time.');
          }
        }
        // Lock documents serialize all reservations for a clinician/day, including across locations.
        const key = (a:any) => `${a.clinicId}_${a.practitionerId}_${a.date}`;
        const keys = [...new Set([active(old || {}) ? key(old) : '', active(next) ? key(next) : ''].filter(Boolean))];
        const calendars = await Promise.all(keys.map(k => tx.get(db.doc(`reservation_days/${k}`))));
        for (let i=0;i<keys.length;i++) {
          let reservations = (calendars[i].data()?.reservations || []).filter((r:any)=>r.id!==data.id);
          if (data.action !== 'delete' && active(next) && keys[i] === key(next)) {
            const start = minutes(next.time); const slot = {id:data.id,start,end:start+next.durationMinutes+Number(clinic.schedulingRules?.bufferTimeMinutes || 0)};
            if (reservations.some((r:any)=>overlap(r,slot))) throw new functions.https.HttpsError('already-exists','This time overlaps an existing appointment. Please choose another.');
            reservations.push(slot);
          }
          tx.set(db.doc(`reservation_days/${keys[i]}`),{reservations});
        }
        const now=Date.now(); const count=rate && now-rate.start<3600000?rate.count:0;
        if (!staff && count>=30) throw new functions.https.HttpsError('resource-exhausted','Please try again later or contact the clinic.');
        tx.set(limits,{start:count?rate!.start:now,count:count+1});
        if (data.action==='delete') {tx.delete(ref);return {deleted:true};}
        tx.set(ref,next);
        return {appointment:next};
      });
    },
    availability: async (data:any) => {
      if (![data.clinicId,data.practitionerId].every(safeId) || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new functions.https.HttpsError('invalid-argument','Invalid availability request.');
      const doc=await db.doc(`reservation_days/${data.clinicId}_${data.practitionerId}_${data.date}`).get();
      return (doc.data()?.reservations || []).map((r:any)=>({start:r.start,end:r.end}));
    },
  };
}
