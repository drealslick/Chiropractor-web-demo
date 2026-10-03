"use strict";
/**
 * Phase 3: Authoritative Server Booking & Scheduling Lifecycle
 *
 * Implements:
 * 3.1. Single atomic server booking operation (clinic, branch, service, practitioner, price authority)
 * 3.2. Server-generated IDs & client request key for retry idempotency
 * 3.3. Concurrency-safe interval model serialized through practitioner-day schedule docs
 * 3.4. Canonical UTC instants with clinic timezone, opening hours, holidays, lead times, visit duration
 * 3.5. Expiring checkout holds with idempotent cleanup coordinated with payment completion
 * 3.6. Atomic rescheduling (acquire new + release old) and cancellation with policy enforcement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointmentSlot = exports.rescheduleAppointmentSlot = exports.confirmAppointmentHold = exports.bookAppointment = exports.DEFAULT_SERVICE_CATALOG = void 0;
exports.executeAuthoritativeBooking = executeAuthoritativeBooking;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const scheduleUtils_1 = require("./scheduleUtils");
function getDb(customDb) {
    if (customDb)
        return customDb;
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return admin.firestore();
}
// Fallback trusted catalog if clinic document does not specify services
exports.DEFAULT_SERVICE_CATALOG = {
    'initial-consultation': {
        title: 'Initial Consultation & Examination',
        price: 49,
        deposit: 25,
        duration: 45,
    },
    'followup-adjustment': {
        title: 'Follow-Up Adjustment Session',
        price: 45,
        deposit: 20,
        duration: 20,
    },
    're-exam': {
        title: 'Comprehensive Re-Assessment & Progress Exam',
        price: 65,
        deposit: 25,
        duration: 30,
    },
    'hourly-session': {
        title: 'Extended Comprehensive Session',
        price: 110,
        deposit: 35,
        duration: 60,
    },
    'hour-consultation': {
        title: 'Extended Comprehensive Session',
        price: 110,
        deposit: 35,
        duration: 60,
    },
};
const DEFAULT_PRACTITIONERS = [
    { id: 'dr-alistair-vance', name: 'Dr. Alistair Vance', active: true },
    { id: 'dr-elena-rostova', name: 'Dr. Elena Rostova', active: true },
];
/**
 * 3.1 & 3.2: Transactional Core Booking Engine
 * Atomic booking with idempotency, interval locking, and price authority
 */
async function executeAuthoritativeBooking(data, context, firestoreDb) {
    const activeDb = firestoreDb || admin.firestore();
    const { clinicId, branchId = 'main', serviceId = 'initial-consultation', serviceTitle: requestedServiceTitle, practitionerId: requestedPractitionerId, date, time, patientName, patientEmail, patientPhone, notes, condition, clientRequestId, isHold = false, } = data || {};
    // 1. Validate required fields
    if (!clinicId || !date || !time || !patientName || !patientEmail) {
        throw new functions.https.HttpsError('invalid-argument', 'clinicId, date, time, patientName, and patientEmail are required.');
    }
    // Idempotency key requirement
    const cleanClientRequestId = (clientRequestId || '').trim();
    if (!cleanClientRequestId) {
        throw new functions.https.HttpsError('invalid-argument', 'A unique clientRequestId is required for booking idempotency.');
    }
    const sanitizedClinicId = clinicId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const sanitizedDate = date.trim();
    const sanitizedTime = time.trim();
    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sanitizedDate)) {
        throw new functions.https.HttpsError('invalid-argument', 'Date must be formatted as YYYY-MM-DD.');
    }
    // 2. Retry Idempotency: Check if clientRequestId has already been booked
    const idempotencyKey = `${sanitizedClinicId}_${cleanClientRequestId}`;
    const idempotencyRef = activeDb.collection('idempotency_keys').doc(idempotencyKey);
    const existingKeySnap = await idempotencyRef.get();
    if (existingKeySnap.exists) {
        const existingData = existingKeySnap.data();
        const existingApptSnap = await activeDb.collection('appointments').doc(existingData.appointmentId).get();
        if (existingApptSnap.exists) {
            functions.logger.info(`Idempotent booking hit for key ${idempotencyKey}`);
            return {
                success: true,
                idempotent: true,
                appointmentId: existingApptSnap.id,
                appointment: existingApptSnap.data(),
            };
        }
    }
    // 3. Resolve Clinic & Authoritative Settings
    const clinicRef = activeDb.collection('clinics').doc(sanitizedClinicId);
    const clinicSnap = await clinicRef.get();
    const clinicData = clinicSnap.exists ? clinicSnap.data() : {};
    const timezone = clinicData.schedulingRules?.timezone || clinicData.timezone || 'Europe/London';
    const currency = clinicData.currencySymbol || '£';
    const holidays = clinicData.holidays || clinicData.schedulingRules?.holidays || [];
    // Check holiday closure
    if (holidays.includes(sanitizedDate)) {
        throw new functions.https.HttpsError('failed-precondition', `The clinic is closed on ${sanitizedDate} for an observed holiday.`);
    }
    // 4. Resolve Trusted Price, Deposit, Duration, and Service
    let trustedPrice = 85;
    let trustedDeposit = 25;
    let trustedDuration = 45;
    let canonicalServiceTitle = requestedServiceTitle || 'Initial Diagnostic Consultation & Assessment';
    const clinicServices = clinicData.services || [];
    const matchedService = clinicServices.find((s) => s.id === serviceId || s.title?.toLowerCase() === requestedServiceTitle?.toLowerCase());
    if (matchedService) {
        trustedPrice = typeof matchedService.price === 'number' ? matchedService.price : 85;
        trustedDeposit = typeof matchedService.deposit === 'number' ? matchedService.deposit : 25;
        trustedDuration = typeof matchedService.duration === 'number' ? matchedService.duration : 45;
        canonicalServiceTitle = matchedService.title || canonicalServiceTitle;
    }
    else if (exports.DEFAULT_SERVICE_CATALOG[serviceId]) {
        const defaultItem = exports.DEFAULT_SERVICE_CATALOG[serviceId];
        trustedPrice = defaultItem.price;
        trustedDeposit = defaultItem.deposit;
        trustedDuration = defaultItem.duration;
        canonicalServiceTitle = defaultItem.title;
    }
    // 5. Calculate Canonical UTC Instants & Validate Time Boundaries
    const startMinutes = (0, scheduleUtils_1.parseTimeToMinutes)(sanitizedTime);
    const endMinutes = startMinutes + trustedDuration;
    const startInstant = (0, scheduleUtils_1.getUtcInstantForTimezone)(sanitizedDate, sanitizedTime, timezone);
    const endInstant = new Date(new Date(startInstant).getTime() + trustedDuration * 60 * 1000).toISOString();
    // Validate lead time: must not be in past
    const nowMs = Date.now();
    const bookingStartMs = new Date(startInstant).getTime();
    const minLeadMinutes = clinicData.schedulingRules?.minimumNoticeHours ? clinicData.schedulingRules.minimumNoticeHours * 60 : 30;
    if (bookingStartMs < nowMs) {
        throw new functions.https.HttpsError('invalid-argument', 'Cannot book appointments in the past.');
    }
    if (bookingStartMs - nowMs < minLeadMinutes * 60 * 1000) {
        throw new functions.https.HttpsError('failed-precondition', `Appointments must be booked at least ${minLeadMinutes} minutes in advance.`);
    }
    // Validate Opening Hours
    const dateObj = new Date(`${sanitizedDate}T12:00:00Z`);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }).toLowerCase();
    const operatingHours = clinicData.schedulingRules?.operatingHours || {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '09:30', close: '13:00' },
        sunday: { open: '00:00', close: '00:00', closed: true },
    };
    const dayConfig = operatingHours[dayOfWeek] || { open: '09:00', close: '17:00', closed: dayOfWeek === 'sunday' };
    const hoursValidation = (0, scheduleUtils_1.validateOperatingHours)(startMinutes, endMinutes, dayConfig);
    if (!hoursValidation.valid) {
        throw new functions.https.HttpsError('failed-precondition', hoursValidation.reason || 'Outside opening hours.');
    }
    // 6. Resolve Practitioner (Specific vs "First Available")
    const clinicPractitioners = clinicData.practitioners || DEFAULT_PRACTITIONERS;
    let candidatePractitioners = [];
    if (requestedPractitionerId && requestedPractitionerId !== 'first_available' && requestedPractitionerId !== 'unassigned') {
        const specific = clinicPractitioners.find((p) => p.id === requestedPractitionerId);
        if (!specific) {
            throw new functions.https.HttpsError('not-found', `Practitioner with ID '${requestedPractitionerId}' is not registered with this clinic.`);
        }
        candidatePractitioners = [specific];
    }
    else {
        // "First available" evaluates all active practitioners for this clinic
        candidatePractitioners = clinicPractitioners.filter((p) => p.active !== false);
        if (candidatePractitioners.length === 0) {
            throw new functions.https.HttpsError('failed-precondition', 'No active practitioners configured for this clinic.');
        }
    }
    // 7. Transactionally Acquire Capacity via Practitioner-Day Schedule Document
    const apptRef = activeDb.collection('appointments').doc();
    const appointmentId = apptRef.id;
    const bookingReference = (0, scheduleUtils_1.generateBookingReference)(sanitizedClinicId.slice(0, 3).toUpperCase());
    const patientUid = context?.auth ? context.auth.uid : null;
    const holdExpiryInstant = isHold ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    let assignedPractitioner = null;
    await activeDb.runTransaction(async (transaction) => {
        // Re-verify idempotency inside transaction
        const txKeySnap = await transaction.get(idempotencyRef);
        if (txKeySnap.exists) {
            return;
        }
        let allocated = false;
        for (const practitioner of candidatePractitioners) {
            const scheduleDocId = `${sanitizedClinicId}_${practitioner.id}_${sanitizedDate}`;
            const scheduleRef = activeDb.collection('schedules').doc(scheduleDocId);
            const scheduleSnap = await transaction.get(scheduleRef);
            const existingIntervals = scheduleSnap.exists ? scheduleSnap.data()?.intervals || [] : [];
            // Filter out holds that have expired
            const nowEpoch = Date.now();
            const activeIntervals = existingIntervals.filter((interval) => {
                if (interval.status === 'hold' && interval.expiresAt) {
                    return new Date(interval.expiresAt).getTime() > nowEpoch;
                }
                return true;
            });
            // Check overlap
            const hasConflict = activeIntervals.some((existing) => (0, scheduleUtils_1.intervalsOverlap)(startMinutes, endMinutes, existing.startMinutes, existing.endMinutes));
            if (!hasConflict) {
                // Free slot found for this practitioner
                assignedPractitioner = practitioner;
                const newInterval = {
                    reservationId: `res_${appointmentId}`,
                    appointmentId,
                    branchId,
                    startInstant,
                    endInstant,
                    startTime: sanitizedTime,
                    endTime: (0, scheduleUtils_1.formatMinutesToTime)(endMinutes),
                    startMinutes,
                    endMinutes,
                    status: isHold ? 'hold' : 'confirmed',
                    expiresAt: holdExpiryInstant,
                    clientRequestId: cleanClientRequestId,
                };
                transaction.set(scheduleRef, {
                    clinicId: sanitizedClinicId,
                    practitionerId: practitioner.id,
                    date: sanitizedDate,
                    intervals: [...activeIntervals, newInterval],
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
                allocated = true;
                break;
            }
        }
        if (!allocated) {
            throw new functions.https.HttpsError('already-exists', candidatePractitioners.length === 1
                ? `The requested practitioner is already booked or on hold for this time interval (${sanitizedTime} - ${(0, scheduleUtils_1.formatMinutesToTime)(endMinutes)}). Please select another time.`
                : `No practitioners are available for this time interval (${sanitizedTime} - ${(0, scheduleUtils_1.formatMinutesToTime)(endMinutes)}). Please select another slot.`);
        }
        // Persist appointment document
        transaction.set(apptRef, {
            id: appointmentId,
            bookingReference,
            clinicId: sanitizedClinicId,
            branchId,
            serviceId,
            serviceTitle: canonicalServiceTitle,
            practitionerId: assignedPractitioner.id,
            practitionerName: assignedPractitioner.name,
            date: sanitizedDate,
            time: sanitizedTime,
            durationMinutes: trustedDuration,
            startInstant,
            endInstant,
            timezone,
            priceAmount: trustedPrice,
            depositAmount: trustedDeposit,
            currency,
            patientName: patientName.trim(),
            patientEmail: patientEmail.trim().toLowerCase(),
            patientPhone: patientPhone?.trim() || '',
            patientId: patientUid,
            clientRequestId: cleanClientRequestId,
            notes: notes?.trim() || '',
            condition: condition || canonicalServiceTitle,
            status: isHold ? 'pending_payment' : 'confirmed',
            paymentStatus: 'unpaid',
            holdExpiresAt: holdExpiryInstant,
            rescheduleHistory: [],
            createdAt: new Date().toISOString(),
        });
        // Persist idempotency mapping
        transaction.set(idempotencyRef, {
            appointmentId,
            clinicId: sanitizedClinicId,
            clientRequestId: cleanClientRequestId,
            createdAt: new Date().toISOString(),
        });
        // Also persist legacy reservations record for backward compatibility
        const legacyResRef = activeDb.collection('reservations').doc(appointmentId);
        transaction.set(legacyResRef, {
            appointmentId,
            clinicId: sanitizedClinicId,
            practitionerId: assignedPractitioner.id,
            date: sanitizedDate,
            time: sanitizedTime,
            status: isHold ? 'hold' : 'active',
            createdAt: new Date().toISOString(),
        });
    });
    return {
        success: true,
        appointmentId,
        bookingReference,
        practitionerId: assignedPractitioner?.id,
        practitionerName: assignedPractitioner?.name,
        date: sanitizedDate,
        time: sanitizedTime,
        durationMinutes: trustedDuration,
        startInstant,
        endInstant,
        priceAmount: trustedPrice,
        depositAmount: trustedDeposit,
        currency,
        status: isHold ? 'pending_payment' : 'confirmed',
    };
}
exports.bookAppointment = functions.https.onCall(async (data, context) => {
    return executeAuthoritativeBooking(data, context, getDb());
});
/**
 * 3.5: Callable Function: confirmAppointmentHold
 * Idempotently upgrades hold reservation to confirmed upon verified payment completion
 */
exports.confirmAppointmentHold = functions.https.onCall(async (data, context) => {
    const { appointmentId, paymentIntentId, paymentChoice = 'full' } = data || {};
    if (!appointmentId || !paymentIntentId) {
        throw new functions.https.HttpsError('invalid-argument', 'appointmentId and paymentIntentId are required.');
    }
    const activeDb = getDb();
    const apptRef = activeDb.collection('appointments').doc(appointmentId);
    await activeDb.runTransaction(async (transaction) => {
        const apptSnap = await transaction.get(apptRef);
        if (!apptSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Appointment not found.');
        }
        const appt = apptSnap.data();
        // Idempotent: If already confirmed with same transaction, return early
        if (appt.status === 'confirmed' && appt.transactionId === paymentIntentId) {
            return;
        }
        const scheduleDocId = `${appt.clinicId}_${appt.practitionerId}_${appt.date}`;
        const scheduleRef = activeDb.collection('schedules').doc(scheduleDocId);
        const scheduleSnap = await transaction.get(scheduleRef);
        if (!scheduleSnap.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'Schedule document missing for hold verification.');
        }
        const intervals = scheduleSnap.data()?.intervals || [];
        const targetIntervalIndex = intervals.findIndex((i) => i.appointmentId === appointmentId);
        if (targetIntervalIndex === -1) {
            // The hold expired and was pruned or claimed by another user
            throw new functions.https.HttpsError('deadline-exceeded', 'Your reservation hold has expired and the slot is no longer available. A refund will be issued.');
        }
        const targetInterval = intervals[targetIntervalIndex];
        // Check if expired
        if (targetInterval.status === 'hold' && targetInterval.expiresAt) {
            if (new Date(targetInterval.expiresAt).getTime() < Date.now()) {
                throw new functions.https.HttpsError('deadline-exceeded', 'Checkout hold expired before payment was confirmed. Slot cannot be confirmed.');
            }
        }
        // Upgrade interval to confirmed
        intervals[targetIntervalIndex] = {
            ...targetInterval,
            status: 'confirmed',
            expiresAt: null,
        };
        transaction.update(scheduleRef, {
            intervals,
            updatedAt: new Date().toISOString(),
        });
        const paymentStatus = paymentChoice === 'full' ? 'paid_full' : 'deposit_paid';
        const amountPaid = paymentChoice === 'full' ? appt.priceAmount : appt.depositAmount;
        transaction.update(apptRef, {
            status: 'confirmed',
            paymentStatus,
            amountPaid,
            transactionId: paymentIntentId,
            holdExpiresAt: null,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    });
    return { success: true, appointmentId, status: 'confirmed' };
});
/**
 * 3.6: Callable Function: rescheduleAppointmentSlot
 * Atomically releases old reservation and acquires new capacity
 */
exports.rescheduleAppointmentSlot = functions.https.onCall(async (data, context) => {
    const { appointmentId, newDate, newTime, newPractitionerId, reason } = data || {};
    if (!appointmentId || !newDate || !newTime) {
        throw new functions.https.HttpsError('invalid-argument', 'appointmentId, newDate, and newTime are required.');
    }
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to reschedule.');
    }
    const activeDb = getDb();
    const apptRef = activeDb.collection('appointments').doc(appointmentId);
    await activeDb.runTransaction(async (transaction) => {
        const apptSnap = await transaction.get(apptRef);
        if (!apptSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Appointment not found.');
        }
        const appt = apptSnap.data();
        // Authorization: Must be owner or clinic staff
        const isOwner = appt.patientId === context.auth.uid;
        const isStaff = context.auth.token?.clinicId === appt.clinicId &&
            ['staff', 'admin', 'practitioner'].includes(context.auth.token?.role);
        const isSuperAdmin = context.auth.token?.superAdmin === true;
        if (!isOwner && !isStaff && !isSuperAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Unauthorized to reschedule this appointment.');
        }
        if (appt.status === 'cancelled') {
            throw new functions.https.HttpsError('failed-precondition', 'Cannot reschedule a cancelled appointment.');
        }
        const oldPractitionerId = appt.practitionerId;
        const oldDate = appt.date;
        const targetPractitionerId = newPractitionerId || oldPractitionerId;
        const durationMinutes = appt.durationMinutes || 45;
        const newStartMinutes = (0, scheduleUtils_1.parseTimeToMinutes)(newTime);
        const newEndMinutes = newStartMinutes + durationMinutes;
        const oldScheduleRef = activeDb.collection('schedules').doc(`${appt.clinicId}_${oldPractitionerId}_${oldDate}`);
        const newScheduleRef = activeDb.collection('schedules').doc(`${appt.clinicId}_${targetPractitionerId}_${newDate}`);
        const oldScheduleSnap = await transaction.get(oldScheduleRef);
        const newScheduleSnap = oldScheduleRef.id === newScheduleRef.id ? oldScheduleSnap : await transaction.get(newScheduleRef);
        // Check conflict on new schedule
        const newIntervals = newScheduleSnap.exists ? newScheduleSnap.data()?.intervals || [] : [];
        const activeNew = newIntervals.filter((i) => {
            // Exclude the current appointment's own interval if on same schedule
            if (i.appointmentId === appointmentId)
                return false;
            if (i.status === 'hold' && i.expiresAt && new Date(i.expiresAt).getTime() < Date.now())
                return false;
            return true;
        });
        const hasConflict = activeNew.some((existing) => (0, scheduleUtils_1.intervalsOverlap)(newStartMinutes, newEndMinutes, existing.startMinutes, existing.endMinutes));
        if (hasConflict) {
            throw new functions.https.HttpsError('already-exists', `The selected practitioner already has a booking during this interval (${newTime} - ${(0, scheduleUtils_1.formatMinutesToTime)(newEndMinutes)}).`);
        }
        // Release from old schedule
        if (oldScheduleSnap.exists) {
            const oldIntervals = oldScheduleSnap.data()?.intervals || [];
            const updatedOld = oldIntervals.filter((i) => i.appointmentId !== appointmentId);
            transaction.update(oldScheduleRef, {
                intervals: updatedOld,
                updatedAt: new Date().toISOString(),
            });
        }
        // Add to new schedule
        const startInstant = (0, scheduleUtils_1.getUtcInstantForTimezone)(newDate, newTime, appt.timezone || 'Europe/London');
        const endInstant = new Date(new Date(startInstant).getTime() + durationMinutes * 60 * 1000).toISOString();
        const newIntervalItem = {
            reservationId: `res_${appointmentId}`,
            appointmentId,
            branchId: appt.branchId || 'main',
            startInstant,
            endInstant,
            startTime: newTime,
            endTime: (0, scheduleUtils_1.formatMinutesToTime)(newEndMinutes),
            startMinutes: newStartMinutes,
            endMinutes: newEndMinutes,
            status: 'confirmed',
            expiresAt: null,
        };
        transaction.set(newScheduleRef, {
            clinicId: appt.clinicId,
            practitionerId: targetPractitionerId,
            date: newDate,
            intervals: [...activeNew, newIntervalItem],
            updatedAt: new Date().toISOString(),
        }, { merge: true });
        // Update appointment document
        const historyEntry = {
            rescheduledAt: new Date().toISOString(),
            rescheduledBy: context.auth.uid,
            previousSlot: { date: oldDate, time: appt.time, practitionerId: oldPractitionerId },
            newSlot: { date: newDate, time: newTime, practitionerId: targetPractitionerId },
            reason: reason || 'Patient/staff requested reschedule',
        };
        transaction.update(apptRef, {
            date: newDate,
            time: newTime,
            practitionerId: targetPractitionerId,
            startInstant,
            endInstant,
            rescheduleHistory: [...(appt.rescheduleHistory || []), historyEntry],
            updatedAt: new Date().toISOString(),
        });
    });
    return { success: true, appointmentId, newDate, newTime };
});
/**
 * 3.6: Callable Function: cancelAppointmentSlot (Phase 3 Upgrade)
 * Releases schedule interval and updates appointment status while preserving history
 */
exports.cancelAppointmentSlot = functions.https.onCall(async (data, context) => {
    const { appointmentId, reason } = data || {};
    if (!appointmentId) {
        throw new functions.https.HttpsError('invalid-argument', 'Valid appointmentId is required.');
    }
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to cancel an appointment.');
    }
    const activeDb = getDb();
    const apptRef = activeDb.collection('appointments').doc(appointmentId);
    await activeDb.runTransaction(async (transaction) => {
        const apptSnap = await transaction.get(apptRef);
        if (!apptSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Appointment not found.');
        }
        const appt = apptSnap.data();
        // Idempotent: If already cancelled, exit safely
        if (appt.status === 'cancelled') {
            return;
        }
        const isOwner = appt.patientId === context.auth.uid;
        const isStaff = context.auth.token?.clinicId === appt.clinicId &&
            ['staff', 'admin', 'practitioner'].includes(context.auth.token?.role);
        const isSuperAdmin = context.auth.token?.superAdmin === true;
        if (!isOwner && !isStaff && !isSuperAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Unauthorized to cancel this appointment.');
        }
        // Release interval from schedule document
        const scheduleDocId = `${appt.clinicId}_${appt.practitionerId}_${appt.date}`;
        const scheduleRef = activeDb.collection('schedules').doc(scheduleDocId);
        const scheduleSnap = await transaction.get(scheduleRef);
        if (scheduleSnap.exists) {
            const intervals = scheduleSnap.data()?.intervals || [];
            const updatedIntervals = intervals.filter((i) => i.appointmentId !== appointmentId);
            transaction.update(scheduleRef, {
                intervals: updatedIntervals,
                updatedAt: new Date().toISOString(),
            });
        }
        // Update appointment document
        transaction.update(apptRef, {
            status: 'cancelled',
            cancellationReason: reason || 'Cancelled by user',
            cancelledAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    });
    return { success: true, appointmentId, cancelled: true };
});
//# sourceMappingURL=booking.js.map