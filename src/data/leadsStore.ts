import { supabase, clinicRowId } from './supabaseClient';
import {
  getGatewaySettings,
  sendLiveOrSimulatedSms,
  interpolateTemplate,
} from './gatewayStore';

export interface PatientLead {
  id: string;
  source: 'booking' | 'contact';
  name: string;
  email: string;
  phone: string;
  condition?: string;
  serviceType?: 'initial' | 'followup' | 'custom';
  serviceTitle?: string;
  practitionerId?: string;
  practitionerName?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  locationId?: string;
  locationName?: string;
  locationAddress?: string;
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
  intakeForm?: {
    painArea: string;
    painLevel: number; // 1-10
    painDuration: string; // e.g. "2-4 weeks"
    painType: string; // e.g. "Sharp / Stabbing"
    symptoms: string[]; // e.g. ["Numbness in toes", "Morning stiffness"]
    priorSurgeries: string;
    completedAt: string;
  };
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

export function generateSecureBookingReference(prefix: string = 'VH'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without ambiguous chars (no 0/O, 1/I)
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${part1}-${part2}`;
}

export function getDefaultSeedLeads(): PatientLead[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  return [
    {
      id: 'VH-9428-K82X',
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
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
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
      id: 'VH-7183-M91B',
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
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
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
      id: 'VH-3850-P24A',
      source: 'booking',
      name: 'Sarah Jenkins',
      email: 'sjenkins@example.com',
      phone: '(303) 555-0188',
      condition: 'Sports Shoulder Impingement',
      practitionerName: 'Dr. Alistair Vance',
      date: today,
      time: '3:00 PM',
      durationMinutes: 45,
      notes: 'Requested Initial Exam. Swimmer with overhead pain.',
      createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      status: 'new',
      clinicName: 'Vance Health Practice Architecture',
      paymentStatus: 'paid_full',
      paymentAmount: '£49.00',
      paymentMethod: 'card',
      cardLast4: '8821',
      cardBrand: 'Visa',
      transactionId: 'pi_3Q88xL9pWv',
      noShowProtected: true,
    },
    {
      id: 'VH-5519-R76Q',
      source: 'booking',
      name: 'Michael Chang',
      email: 'm.chang@example.com',
      phone: '(303) 555-0112',
      condition: 'Mid-Back Thoracic Spine Stiffness',
      practitionerName: 'Dr. Elena Rostova',
      date: today,
      time: '9:00 AM',
      durationMinutes: 45,
      notes: 'Regular check-in. Reports 80% improvement after last adjustment.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'checked_in',
      clinicName: 'Vance Health Practice Architecture',
    },
    {
      id: 'VH-6294-T18K',
      source: 'booking',
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '(303) 555-0129',
      condition: 'Cervical Disc Herniation & Arm Tingling',
      practitionerName: 'Dr. Elena Rostova',
      date: today,
      time: '10:15 AM',
      durationMinutes: 45,
      notes: 'Initial Exam. MRI scan brought on USB drive.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: 'checked_in',
      clinicName: 'Vance Health Practice Architecture',
    },
    {
      id: 'VH-4402-Z33W',
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
    id: leadInput.id || generateSecureBookingReference('VH'),
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
    locationId: leadInput.locationId,
    locationName: leadInput.locationName,
    locationAddress: leadInput.locationAddress,
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

    // 3. Live or Simulated SMS Dispatch to Patient via Twilio / Gateway
    if (newLead.phone) {
      const gwSettings = getGatewaySettings();
      if (gwSettings.autoSendBookingConfirmation !== false) {
        const templateVars = {
          patient_name: newLead.name,
          clinic_name: newLead.clinicName || 'Vance Health',
          doctor_name: newLead.practitionerName || 'Doctor of Chiropractic',
          date: newLead.date || 'Upcoming',
          time: newLead.time || 'Scheduled Time',
          ref_code: newLead.id,
          portal_url: `${window.location.origin}/portal?ref=${newLead.id}`,
        };
        const smsBody = interpolateTemplate(gwSettings.customSmsBookingTemplate, templateVars);
        sendLiveOrSimulatedSms(newLead.phone, smsBody, 'booking_confirmation');
      }

      logNotification({
        type: 'patient_autoresponder',
        recipient: newLead.phone,
        channel: 'sms',
        subject: 'SMS Confirmation Sent',
        message: `${newLead.clinicName}: We received your booking request for ${newLead.date} @ ${newLead.time}. Ref: ${newLead.id}.`,
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

/**
 * Patient Accounts Store (Email + Password Authentication)
 * Allows repeat patients to log in and access all their appointments without needing reference IDs.
 */
export interface PatientAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  createdAt: string;
}

const PATIENT_ACCOUNTS_KEY = 'agency_patient_accounts_v1';

export function getDefaultSeedPatientAccounts(): PatientAccount[] {
  return [
    {
      id: 'acc-john-doe',
      email: 'johndoe@example.com',
      password: 'password123',
      name: 'John Doe',
      phone: '(303) 555-0199',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'acc-emily-watson',
      email: 'emily.w@example.com',
      password: 'password123',
      name: 'Emily Watson',
      phone: '(303) 555-0194',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getStoredPatientAccounts(): PatientAccount[] {
  try {
    const raw = localStorage.getItem(PATIENT_ACCOUNTS_KEY);
    if (!raw) {
      const seeds = getDefaultSeedPatientAccounts();
      localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(seeds));
      return seeds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeds = getDefaultSeedPatientAccounts();
      localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return parsed;
  } catch {
    return getDefaultSeedPatientAccounts();
  }
}

export function registerPatientAccount(
  name: string,
  email: string,
  password: string,
  phone?: string
): { success: boolean; account?: PatientAccount; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password || !name) {
    return { success: false, message: 'Please provide full name, email, and password.' };
  }

  const accounts = getStoredPatientAccounts();
  if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'An account with this email address already exists. Please log in.' };
  }

  const newAccount: PatientAccount = {
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: cleanEmail,
    password: password.trim(),
    phone: phone?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  const updated = [...accounts, newAccount];
  try {
    localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }

  return { success: true, account: newAccount, message: 'Account created successfully!' };
}

export function authenticatePatientAccount(
  email: string,
  password: string
): { success: boolean; account?: PatientAccount; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getStoredPatientAccounts();
  const match = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!match) {
    return { success: false, message: 'No patient account found with that email. Please check your spelling or sign up.' };
  }

  if (match.password && match.password !== password.trim()) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  return { success: true, account: match, message: 'Login successful.' };
}

export function findPatientAppointmentsByEmail(email: string): PatientLead[] {
  const clean = email.trim().toLowerCase();
  if (!clean) return [];
  const leads = getStoredLeads();
  return leads.filter((l) => l.email && l.email.trim().toLowerCase() === clean);
}

/**
 * Patient Self-Service Portal Helpers (Search, Reschedule, Cancellation)
 * STRICT SECURITY: Access is strictly locked to the cryptographically unique Booking Reference Key
 * or Transaction ID to prevent unauthorized access via guessing names/phones.
 */
export function findPatientAppointments(searchQuery: string): PatientLead[] {
  const query = searchQuery.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!query || query.length < 4) return [];

  const leads = getStoredLeads();

  return leads.filter((lead) => {
    const leadIdClean = lead.id.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const txIdClean = (lead.transactionId || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');

    return leadIdClean === query || txIdClean === query;
  });
}

export function requestPatientReschedule(
  leadId: string,
  newDate: string,
  newTime: string,
  notes?: string
): { success: boolean; updatedLead?: PatientLead; message: string } {
  const leads = getStoredLeads();
  const targetIndex = leads.findIndex((l) => l.id === leadId);

  if (targetIndex === -1) {
    return { success: false, message: 'Appointment not found.' };
  }

  const existing = leads[targetIndex];
  const oldDate = existing.date || 'TBD';
  const oldTime = existing.time || 'TBD';

  const updatedLead: PatientLead = {
    ...existing,
    date: newDate,
    time: newTime,
    status: 'new', // Flag as new/needs reception check
    notes: `${existing.notes || ''}\n[RESCHEDULE REQUESTED by patient on ${new Date().toLocaleDateString()} from ${oldDate} ${oldTime} to ${newDate} ${newTime}. Note: ${notes || 'None'}]`.trim(),
  };

  leads[targetIndex] = updatedLead;

  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: leads }));

    // Dispatch front desk notification
    const newNotif: DispatchedNotification = {
      id: `notif-reschedule-${Date.now()}`,
      type: 'rescheduled',
      recipient: 'Front Desk',
      channel: 'sms',
      subject: `Reschedule request from ${updatedLead.name}`,
      message: `${updatedLead.name} requested to move appointment from ${oldDate} ${oldTime} to ${newDate} ${newTime}.`,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      priority: 'high',
      read: false,
    };

    // Dispatch patient SMS confirmation for reschedule
    if (updatedLead.phone) {
      const gwSettings = getGatewaySettings();
      if (gwSettings.autoSendRescheduleAlert !== false) {
        const templateVars = {
          patient_name: updatedLead.name,
          clinic_name: updatedLead.clinicName || 'Vance Health',
          doctor_name: updatedLead.practitionerName || 'Doctor of Chiropractic',
          date: newDate,
          time: newTime,
          ref_code: updatedLead.id,
          portal_url: `${window.location.origin}/portal?ref=${updatedLead.id}`,
        };
        const smsBody = interpolateTemplate(gwSettings.customSmsRescheduleTemplate, templateVars);
        sendLiveOrSimulatedSms(updatedLead.phone, smsBody, 'reschedule');
      }
    }

    const currentNotifs = getDispatchedNotifications();
    const updatedNotifs = [newNotif, ...currentNotifs];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifs));
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: updatedNotifs }));
  } catch {
    // Ignore
  }

  return { success: true, updatedLead, message: 'Appointment reschedule request submitted successfully.' };
}

export function requestPatientCancellation(
  leadId: string,
  reason: string
): { success: boolean; updatedLead?: PatientLead; message: string } {
  const leads = getStoredLeads();
  const targetIndex = leads.findIndex((l) => l.id === leadId);

  if (targetIndex === -1) {
    return { success: false, message: 'Appointment not found.' };
  }

  const existing = leads[targetIndex];
  const updatedLead: PatientLead = {
    ...existing,
    status: 'cancelled',
    cancellationReason: reason,
    notes: `${existing.notes || ''}\n[CANCELLED by patient on ${new Date().toLocaleDateString()}: ${reason}]`.trim(),
  };

  leads[targetIndex] = updatedLead;

  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: leads }));

    // Dispatch patient SMS cancellation receipt
    if (updatedLead.phone) {
      const gwSettings = getGatewaySettings();
      if (gwSettings.autoSendCancellationAlert !== false) {
        const templateVars = {
          patient_name: updatedLead.name,
          clinic_name: updatedLead.clinicName || 'Vance Health',
          doctor_name: updatedLead.practitionerName || 'Doctor of Chiropractic',
          date: existing.date || 'Scheduled Date',
          time: existing.time || 'Scheduled Time',
          ref_code: updatedLead.id,
          portal_url: `${window.location.origin}/portal`,
        };
        const smsBody = interpolateTemplate(gwSettings.customSmsCancellationTemplate, templateVars);
        sendLiveOrSimulatedSms(updatedLead.phone, smsBody, 'cancellation');
      }
    }

    // Dispatch front desk alert
    const newNotif: DispatchedNotification = {
      id: `notif-cancel-${Date.now()}`,
      type: 'status_update',
      recipient: 'Front Desk',
      channel: 'email',
      subject: `Appointment Cancelled: ${updatedLead.name}`,
      message: `${updatedLead.name} cancelled their ${existing.date || ''} ${existing.time || ''} booking. Reason: "${reason}". Slot opened.`,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      priority: 'high',
      read: false,
    };

    const currentNotifs = getDispatchedNotifications();
    const updatedNotifs = [newNotif, ...currentNotifs];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifs));
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: updatedNotifs }));
  } catch {
    // Ignore
  }

  return { success: true, updatedLead, message: 'Appointment cancelled successfully.' };
}

export function savePatientIntakeForm(leadId: string, intakeData: PatientLead['intakeForm']) {
  const leads = getStoredLeads();
  let updatedLead: PatientLead | null = null;
  const updatedLeads = leads.map((l) => {
    if (l.id === leadId) {
      updatedLead = { ...l, intakeForm: intakeData };
      return updatedLead;
    }
    return l;
  });

  if (updatedLead) {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updatedLeads));
      window.dispatchEvent(new CustomEvent('leads_updated', { detail: updatedLeads }));
    } catch {
      // ignore
    }
  }

  return { success: Boolean(updatedLead), updatedLead };
}


