import { supabase, clinicRowId } from './supabaseClient';

export interface PatientLead {
  id: string;
  source: 'booking' | 'contact';
  name: string;
  email: string;
  phone: string;
  condition?: string;
  practitionerId?: string;
  practitionerName?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'booked' | 'confirmed' | 'cancelled' | 'archived' | 'checked_in' | 'waitlist';
  clinicName?: string;
  cancellationReason?: string;
  preferredTimeWindow?: string;
  // Upfront Payment & No-Show Protection tracking
  paymentStatus?: 'paid_full' | 'deposit_paid' | 'card_hold' | 'unpaid' | 'refunded';
  paymentAmount?: string;
  paymentMethod?: 'card' | 'apple_pay' | 'google_pay' | 'clinic_cash';
  cardLast4?: string;
  cardBrand?: string;
  transactionId?: string;
  noShowProtected?: boolean;
}

export interface DispatchedNotification {
  id: string;
  type: 'clinic_alert' | 'patient_autoresponder' | 'status_update' | 'rescheduled';
  recipient: string;
  channel: 'email' | 'sms';
  subject: string;
  message: string;
  timestamp: string;
  status: 'delivered' | 'simulated';
  read?: boolean;
  priority?: 'high' | 'medium' | 'info';
}

const LEADS_STORAGE_KEY = 'agency_patient_leads_v1';
const NOTIFICATIONS_STORAGE_KEY = 'agency_dispatched_notifications_v1';

export function getDefaultSeedLeads(): PatientLead[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  return [
    // 3 Pending Online Requests
    {
      id: 'lead-pending-1',
      source: 'booking',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '(303) 555-0199',
      condition: 'Lower Back & Sciatica Pain',
      practitionerName: 'Dr. Alistair Vance',
      date: tomorrow,
      time: '12:00 PM',
      durationMinutes: 45,
      notes: 'Initial Consultation (£49). Has sharp lumbar pain radiating to left leg for 3 weeks.',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
      status: 'new',
      clinicName: 'Vance Health Practice Architecture',
      paymentStatus: 'deposit_paid',
      paymentAmount: '£25.00',
      paymentMethod: 'card',
      cardLast4: '4242',
      cardBrand: 'Visa',
      transactionId: 'pi_3P92kL2eZvKYlo2C',
      noShowProtected: true,
    },
    {
      id: 'lead-pending-2',
      source: 'booking',
      name: 'John Dow',
      email: 'johndow@example.com',
      phone: '(303) 555-0142',
      condition: 'Desk Posture & Neck Stiffness',
      practitionerName: 'Dr. Elena Rostova',
      date: inThreeDays,
      time: '1:45 PM',
      durationMinutes: 45,
      notes: 'Requested: Initial Consultation (£49). Chronic tension headaches by 3 PM daily.',
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55m ago
      status: 'new',
      clinicName: 'Vance Health Practice Architecture',
      paymentStatus: 'card_hold',
      paymentAmount: '£0.00 (Hold)',
      paymentMethod: 'apple_pay',
      cardLast4: '1984',
      cardBrand: 'Mastercard',
      transactionId: 'ch_auth_9012481',
      noShowProtected: true,
    },
    {
      id: 'lead-pending-3',
      source: 'contact',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '(303) 555-0188',
      condition: 'Sciatica / Disc Bulge Question',
      practitionerName: 'Dr. Alistair Vance',
      date: tomorrow,
      time: '3:00 PM',
      durationMinutes: 45,
      notes: 'Requested callback about insurance coverage (Aetna PPO) prior to initial exam.',
      createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(), // 2.3h ago
      status: 'new',
      clinicName: 'Vance Health Practice Architecture',
      paymentStatus: 'unpaid',
      paymentAmount: '£0.00',
      paymentMethod: 'clinic_cash',
    },

    // 8 Appointments Scheduled for Today
    {
      id: 'appt-today-1',
      source: 'booking',
      name: 'Michael Thorne',
      email: 'm.thorne@example.com',
      phone: '(303) 555-0112',
      condition: 'Spinal Decompression Follow-up',
      practitionerName: 'Dr. Alistair Vance',
      date: today,
      time: '9:00 AM',
      durationMinutes: 30,
      notes: 'Visit 4 of 6. Lumbar decompression and table adjustments.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'confirmed',
      clinicName: 'Vance Health Practice Architecture',
      paymentStatus: 'paid_full',
      paymentAmount: '£49.00',
      paymentMethod: 'card',
      cardLast4: '3004',
      cardBrand: 'Visa',
      transactionId: 'pi_3P00aa123',
    },
    {
      id: 'appt-today-2',
      source: 'booking',
      name: 'David Chen',
      email: 'dchen@example.com',
      phone: '(303) 555-0177',
      condition: 'Cervical Spine & Neck Strain',
      practitionerName: 'Dr. Elena Rostova',
      date: today,
      time: '10:00 AM',
      durationMinutes: 45,
      notes: 'Arrived at 9:55 AM. Paperwork complete. In waiting lobby.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'checked_in', // 1 Checked in patient!
      clinicName: 'Vance Health Practice Architecture',
      paymentStatus: 'deposit_paid',
      paymentAmount: '£25.00',
      paymentMethod: 'card',
      cardLast4: '5521',
      cardBrand: 'Mastercard',
      transactionId: 'pi_3M998242',
      noShowProtected: true,
    },
    {
      id: 'appt-today-3',
      source: 'booking',
      name: 'Amanda Lewis',
      email: 'alewis@example.com',
      phone: '(303) 555-0163',
      condition: 'Shoulder Impingement & Mobility',
      practitionerName: 'Dr. Alistair Vance',
      date: today,
      time: '10:30 AM',
      durationMinutes: 45,
      notes: 'Confirmed via SMS reminder yesterday.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: 'confirmed',
      clinicName: 'Vance Health Practice Architecture',
      paymentStatus: 'card_hold',
      paymentAmount: '£0.00 (Hold)',
      paymentMethod: 'card',
      cardLast4: '9812',
      cardBrand: 'Amex',
      transactionId: 'ch_hold_55812',
      noShowProtected: true,
    },
    {
      id: 'appt-today-4',
      source: 'booking',
      name: 'Robert Taylor',
      email: 'rtaylor@example.com',
      phone: '(303) 555-0129',
      condition: 'Headaches & Upper Cervical Care',
      practitionerName: 'Dr. Elena Rostova',
      date: today,
      time: '11:30 AM',
      durationMinutes: 45,
      notes: 'UNCONFIRMED: Sent automated SMS yesterday, no reply yet. Needs front desk voice call.',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      status: 'new', // 1st Unconfirmed appointment!
      clinicName: 'Vance Health Practice Architecture',
    },
    {
      id: 'appt-today-5',
      source: 'booking',
      name: 'Emily Watson',
      email: 'emily.w@example.com',
      phone: '(303) 555-0194',
      condition: 'Pelvic Alignment & Lower Back',
      practitionerName: 'Dr. Alistair Vance',
      date: today,
      time: '1:30 PM',
      durationMinutes: 45,
      notes: 'Initial Exam (£49). Returning after marathon training.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'confirmed',
      clinicName: 'Vance Health Practice Architecture',
    },
    {
      id: 'appt-today-6',
      source: 'booking',
      name: 'Lucas Vance',
      email: 'lucas.v@example.com',
      phone: '(303) 555-0138',
      condition: 'Athletic Knee & Hip Recovery',
      practitionerName: 'Dr. Elena Rostova',
      date: today,
      time: '2:30 PM',
      durationMinutes: 30,
      notes: 'Rehab exercise progression + active release technique.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: 'confirmed',
      clinicName: 'Vance Health Practice Architecture',
    },
    {
      id: 'appt-today-7',
      source: 'booking',
      name: 'Jessica Moore',
      email: 'jess.moore@example.com',
      phone: '(303) 555-0155',
      condition: 'Prenatal Webster Technique Consult',
      practitionerName: 'Dr. Elena Rostova',
      date: today,
      time: '3:30 PM',
      durationMinutes: 45,
      notes: 'UNCONFIRMED: Left voicemail this morning. Needs a follow-up call to confirm slot.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'new', // 2nd Unconfirmed appointment!
      clinicName: 'Vance Health Practice Architecture',
    },
    {
      id: 'appt-today-8',
      source: 'booking',
      name: 'William Scott',
      email: 'wscott@example.com',
      phone: '(303) 555-0171',
      condition: 'Bi-weekly Spine Maintenance',
      practitionerName: 'Dr. Alistair Vance',
      date: today,
      time: '4:30 PM',
      durationMinutes: 30,
      notes: 'Wellness adjustment package.',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      status: 'confirmed',
      clinicName: 'Vance Health Practice Architecture',
    },

    // 2 Waitlist Patients
    {
      id: 'waitlist-1',
      source: 'booking',
      name: 'Claire Thompson',
      email: 'claire.t@example.com',
      phone: '(303) 555-0182',
      condition: 'Acute Neck Spasm',
      practitionerName: 'Dr. Alistair Vance',
      preferredTimeWindow: 'Today or Tomorrow Morning (9 AM - 12 PM)',
      notes: 'Wants immediate notification if anyone cancels their morning slot.',
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      status: 'waitlist',
      clinicName: 'Vance Health Practice Architecture',
    },
    {
      id: 'waitlist-2',
      source: 'booking',
      name: 'Brian K.',
      email: 'brian.k@example.com',
      phone: '(303) 555-0196',
      condition: 'Lower Back Flare-up',
      practitionerName: 'Dr. Elena Rostova',
      preferredTimeWindow: 'Afternoons (2 PM - 5 PM)',
      notes: 'Flexible, works down the street. Can arrive within 20 minutes notice.',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      status: 'waitlist',
      clinicName: 'Vance Health Practice Architecture',
    },
  ];
}

export function getDefaultReceptionNotifications(): DispatchedNotification[] {
  return [
    {
      id: 'notif-feed-1',
      type: 'clinic_alert',
      recipient: 'Front Desk',
      channel: 'email',
      subject: 'New online request from John Doe',
      message: 'New online request from John Doe. Initial Consultation (£49) for Lower Back & Sciatica.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10m ago
      status: 'delivered',
      read: false,
      priority: 'high',
    },
    {
      id: 'notif-feed-2',
      type: 'status_update',
      recipient: 'Front Desk',
      channel: 'sms',
      subject: 'Sarah Jenkins cancelled her 3:00 PM appointment',
      message: 'Sarah Jenkins cancelled her 3:00 PM appointment with Dr. Vance. Slot is now open for waitlist fill.',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35m ago
      status: 'delivered',
      read: false,
      priority: 'medium',
    },
    {
      id: 'notif-feed-3',
      type: 'clinic_alert',
      recipient: 'Waiting Room',
      channel: 'sms',
      subject: "Dr. Vance's 2:00 PM is running 15 minutes late",
      message: "Dr. Vance's 2:00 PM is running 15 minutes late. Patient Michael notified via SMS courtesy alert.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5m ago
      status: 'delivered',
      read: false,
      priority: 'info',
    },
    {
      id: 'notif-feed-4',
      type: 'status_update',
      recipient: 'Lobby',
      channel: 'sms',
      subject: 'David Chen checked in',
      message: 'David Chen has arrived and checked in. Waiting in lobby for Dr. Rostova.',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2m ago
      status: 'delivered',
      read: true,
      priority: 'info',
    },
  ];
}

export function getStoredLeads(): PatientLead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      const seeds = getDefaultSeedLeads();
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeds = getDefaultSeedLeads();
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return parsed;
  } catch {
    return getDefaultSeedLeads();
  }
}

export function getDispatchedNotifications(): DispatchedNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      const defaultNotifs = getDefaultReceptionNotifications();
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultNotifs = getDefaultReceptionNotifications();
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    return parsed;
  } catch {
    return getDefaultReceptionNotifications();
  }
}

export function logNotification(notif: Omit<DispatchedNotification, 'id' | 'timestamp' | 'status'> & { id?: string; timestamp?: string; status?: 'delivered' | 'simulated' }): DispatchedNotification {
  const current = getDispatchedNotifications();
  const entry: DispatchedNotification = {
    id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: notif.type,
    recipient: notif.recipient,
    channel: notif.channel || 'email',
    subject: notif.subject,
    message: notif.message,
    timestamp: notif.timestamp || new Date().toISOString(),
    status: notif.status || 'delivered',
  };
  const updated = [entry, ...current].slice(0, 50); // keep last 50
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return entry;
}

export function clearDispatchedNotifications(): void {
  try {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: [] }));
  } catch {
    // Ignore
  }
}

export function saveLead(
  leadInput: Omit<PatientLead, 'id' | 'createdAt' | 'status'> & Partial<PatientLead>
): PatientLead {
  const currentLeads = getStoredLeads();
  const newLead: PatientLead = {
    id: leadInput.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    source: leadInput.source || 'booking',
    name: leadInput.name || 'Anonymous',
    email: leadInput.email || '',
    phone: leadInput.phone || '',
    condition: leadInput.condition || 'General Consultation',
    practitionerId: leadInput.practitionerId,
    practitionerName: leadInput.practitionerName || 'First Available Practitioner',
    date: leadInput.date,
    time: leadInput.time,
    durationMinutes: leadInput.durationMinutes || 45,
    notes: leadInput.notes || '',
    createdAt: leadInput.createdAt || new Date().toISOString(),
    status: leadInput.status || 'new',
    clinicName: leadInput.clinicName || 'Clinic',
    cancellationReason: leadInput.cancellationReason,
    paymentStatus: leadInput.paymentStatus || 'unpaid',
    paymentAmount: leadInput.paymentAmount,
    paymentMethod: leadInput.paymentMethod,
    cardLast4: leadInput.cardLast4,
    cardBrand: leadInput.cardBrand,
    transactionId: leadInput.transactionId,
    noShowProtected: leadInput.noShowProtected,
  };

  const updated = [newLead, ...currentLeads];
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore storage quota
  }

  // Auto-dispatch simulated notification alerts when a booking request is saved
  if (newLead.source === 'booking') {
    // 1. Alert to Clinic Front Desk
    logNotification({
      type: 'clinic_alert',
      recipient: 'reception@vancehealth.co.uk',
      channel: 'email',
      subject: `[New Appointment Request] ${newLead.name} (${newLead.condition})`,
      message: `A new appointment request was submitted by ${newLead.name} (${newLead.phone}, ${newLead.email}) for ${newLead.date} at ${newLead.time} with ${newLead.practitionerName}. Status: Pending review.`,
    });

    // 2. Auto-responder to Patient
    if (newLead.email) {
      logNotification({
        type: 'patient_autoresponder',
        recipient: newLead.email,
        channel: 'email',
        subject: `We've received your appointment request - ${newLead.clinicName}`,
        message: `Hello ${newLead.name},\n\nWe received your appointment request for ${newLead.date} at ${newLead.time} with ${newLead.practitionerName}.\n\nOur front-desk team will review your symptoms and insurance details within 24 hours to confirm your booking.`,
      });
    }

    // 3. Optional SMS receipt to Patient
    if (newLead.phone) {
      logNotification({
        type: 'patient_autoresponder',
        recipient: newLead.phone,
        channel: 'sms',
        subject: 'SMS Request Received',
        message: `${newLead.clinicName}: We received your booking request for ${newLead.date} @ ${newLead.time}. Our reception will confirm within 24h. Call us if urgent!`,
      });
    }
  }

  // Attempt non-blocking Supabase sync if table exists
  if (supabase) {
    try {
      supabase
        .from('leads')
        .insert({
          clinic_id: clinicRowId(),
          data: newLead,
          created_at: newLead.createdAt,
        })
        .then(
          () => {},
          () => {}
        );
    } catch {
      // Ignore background supabase failure
    }
  }

  return newLead;
}

export function updateLeadStatus(id: string, status: PatientLead['status'], cancellationReason?: string): PatientLead[] {
  const current = getStoredLeads();
  let updatedLead: PatientLead | undefined;
  const updated = current.map((lead) => {
    if (lead.id === id) {
      updatedLead = {
        ...lead,
        status,
        ...(cancellationReason ? { cancellationReason } : {}),
      };
      return updatedLead;
    }
    return lead;
  });
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }

  // Log status change notification
  if (updatedLead) {
    if (status === 'confirmed') {
      logNotification({
        type: 'status_update',
        recipient: updatedLead.email || updatedLead.phone,
        channel: 'email',
        subject: `Appointment Confirmed: ${updatedLead.date} at ${updatedLead.time}`,
        message: `Dear ${updatedLead.name}, your appointment with ${updatedLead.practitionerName || 'our clinic'} on ${updatedLead.date} at ${updatedLead.time} has been officially CONFIRMED. Please arrive 10 minutes early.`,
      });
    } else if (status === 'cancelled') {
      logNotification({
        type: 'status_update',
        recipient: updatedLead.email || updatedLead.phone,
        channel: 'email',
        subject: `Appointment Request Cancelled`,
        message: `Dear ${updatedLead.name}, your appointment request for ${updatedLead.date} at ${updatedLead.time} has been cancelled.${cancellationReason ? ` Reason: ${cancellationReason}` : ''} Please contact us if you need to reschedule.`,
      });
    }
  }

  return updated;
}

export function updateLeadDetails(id: string, partial: Partial<PatientLead>): PatientLead[] {
  const current = getStoredLeads();
  let modifiedLead: PatientLead | undefined;
  const updated = current.map((lead) => {
    if (lead.id === id) {
      modifiedLead = { ...lead, ...partial };
      return modifiedLead;
    }
    return lead;
  });
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }

  if (modifiedLead && (partial.date || partial.time)) {
    logNotification({
      type: 'rescheduled',
      recipient: modifiedLead.email || modifiedLead.phone,
      channel: 'email',
      subject: `Appointment Rescheduled: ${modifiedLead.date} at ${modifiedLead.time}`,
      message: `Dear ${modifiedLead.name}, your appointment has been rescheduled to ${modifiedLead.date} at ${modifiedLead.time} with ${modifiedLead.practitionerName || 'our team'}.`,
    });
  }

  return updated;
}

export function updateLeadPayment(
  id: string,
  paymentUpdate: {
    paymentStatus?: PatientLead['paymentStatus'];
    paymentAmount?: string;
    paymentMethod?: PatientLead['paymentMethod'];
    cardLast4?: string;
    cardBrand?: string;
    transactionId?: string;
    noShowProtected?: boolean;
    notesAppend?: string;
  }
): PatientLead[] {
  const current = getStoredLeads();
  let modifiedLead: PatientLead | undefined;
  const updated = current.map((lead) => {
    if (lead.id === id) {
      modifiedLead = {
        ...lead,
        ...paymentUpdate,
        notes: paymentUpdate.notesAppend
          ? `${lead.notes ? lead.notes + ' • ' : ''}[Payment Action: ${paymentUpdate.notesAppend}]`
          : lead.notes,
      };
      return modifiedLead;
    }
    return lead;
  });

  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }

  if (modifiedLead && paymentUpdate.notesAppend) {
    logNotification({
      type: 'status_update',
      recipient: modifiedLead.email || 'reception@vancehealth.co.uk',
      channel: 'email',
      subject: `Payment Record Updated: ${modifiedLead.name}`,
      message: `Payment status for ${modifiedLead.name} was updated to: ${paymentUpdate.paymentStatus || modifiedLead.paymentStatus}. Details: ${paymentUpdate.notesAppend}`,
    });
  }

  return updated;
}

export function deleteLead(id: string): PatientLead[] {
  const current = getStoredLeads();
  const updated = current.filter((lead) => lead.id !== id);
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return updated;
}

export function markNotificationAsRead(id: string): DispatchedNotification[] {
  const current = getDispatchedNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return updated;
}

export function markAllNotificationsAsRead(): DispatchedNotification[] {
  const current = getDispatchedNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return updated;
}

export function dismissNotification(id: string): DispatchedNotification[] {
  const current = getDispatchedNotifications();
  const updated = current.filter((n) => n.id !== id);
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return updated;
}

export function clearAllLeads(): void {
  try {
    localStorage.removeItem(LEADS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: [] }));
  } catch {
    // Ignore
  }
}

export function exportLeadsToCSV(leads: PatientLead[], clinicName: string = 'Clinic') {
  if (leads.length === 0) {
    alert('No leads to export yet.');
    return;
  }

  const headers = ['ID', 'Source', 'Date Created', 'Status', 'Name', 'Phone', 'Email', 'Condition/Reason', 'Requested Date', 'Requested Time', 'Notes'];
  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${l.source}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`,
    `"${l.status}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${(l.condition || '').replace(/"/g, '""')}"`,
    `"${l.date || ''}"`,
    `"${l.time || ''}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-leads-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
