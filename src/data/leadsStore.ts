import {
  getGatewaySettings,
  sendLiveOrSimulatedSms,
  interpolateTemplate,
} from './gatewayStore';
import { syncAppointmentToFirestore, persistAppointment, activeClinicId } from '../services/firebaseSync';
import { sandbox } from '../lib/sandbox';
import { dispatchSafeEvent } from '../utils/customEvents';
import { isFirebaseConfigured } from '../lib/firebase';

export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

export interface PatientLead {
  id: string;
  clinicId?: string;
  patientId?: string;
  serviceId?: string;
  amountPaid?: number;
  currency?: string;
  priceMinor?: number;
  timeZone?: string;
  clinicalPlan?: { phase: string; milestone: string; progress: number; frequency: string; doctorNote: string; exercises?: any[] };
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
    bodyRegions?: string[];
    painLevel: number; // 1-10
    painDuration: string; // e.g. "2-4 weeks"
    painType: string; // e.g. "Sharp / Stabbing"
    symptoms: string[]; // e.g. ["Numbness in toes", "Morning stiffness"]
    aggravatingFactors?: string[];
    priorSurgeries: string;
    contraindications?: {
      unexplainedWeightLoss?: boolean;
      lossOfBowelBladder?: boolean;
      historyOfCancer?: boolean;
      osteoporosisOrFracture?: boolean;
      pacemakerOrImplant?: boolean;
      bloodThinners?: boolean;
      pregnant?: boolean;
    };
    hasRedFlags?: boolean;
    informedConsentAgreed?: boolean;
    signatureDataUrl?: string;
    signedAt?: string;
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

export function generateSecureBookingReference(prefix = 'VH'): string {
  return `${prefix}-${crypto.randomUUID()}`.toUpperCase();
}
let appointmentCache: PatientLead[] = [];
export function cacheAppointments(rows: PatientLead[]) {
  appointmentCache = rows;
  dispatchSafeEvent('leads_updated', rows);
}

export function getDefaultSeedLeads(): PatientLead[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  return [
    {
      id: 'COL-9428-K82X',
      source: 'booking',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '(303) 555-0199',
      condition: 'Lower Back & Sciatica Pain',
      practitionerName: 'Dr. Alistair Vance',
      date: tomorrow,
      time: '12:00 PM',
      durationMinutes: 45,
      notes: 'Initial Consultation ($49). Has sharp lumbar pain radiating to left leg for 3 weeks.',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      status: 'new',
      clinicName: 'Columbus Chiropractic Care',
      paymentStatus: 'deposit_paid',
      paymentAmount: '$25.00',
      paymentMethod: 'card',
      cardLast4: '4242',
      cardBrand: 'Visa',
      transactionId: 'pi_3P92kL2eZvKYlo2C',
      noShowProtected: true,
    },
    {
      id: 'COL-7183-M91B',
      source: 'booking',
      name: 'John Dow',
      email: 'johndow@example.com',
      phone: '(303) 555-0142',
      condition: 'Desk Posture & Neck Stiffness',
      practitionerName: 'Dr. Elena Rostova',
      date: inThreeDays,
      time: '1:45 PM',
      durationMinutes: 45,
      notes: 'Requested: Initial Consultation ($49). Chronic tension headaches by 3 PM daily.',
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      status: 'new',
      clinicName: 'Columbus Chiropractic Care',
      paymentStatus: 'card_hold',
      paymentAmount: '$0.00 (Hold)',
      paymentMethod: 'apple_pay',
      cardLast4: '1984',
      cardBrand: 'Mastercard',
      transactionId: 'ch_auth_9012481',
      noShowProtected: true,
    },
    {
      id: 'COL-3850-P24A',
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
      clinicName: 'Columbus Chiropractic Care',
      paymentStatus: 'paid_full',
      paymentAmount: '$49.00',
      paymentMethod: 'card',
      cardLast4: '8821',
      cardBrand: 'Visa',
      transactionId: 'pi_3Q88xL9pWv',
      noShowProtected: true,
    },
    {
      id: 'COL-5519-R76Q',
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
      clinicName: 'Columbus Chiropractic Care',
    },
    {
      id: 'COL-6294-T18K',
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
      clinicName: 'Columbus Chiropractic Care',
    },
    {
      id: 'COL-4402-Z33W',
      source: 'booking',
      name: 'Emily Watson',
      email: 'emily.w@example.com',
      phone: '(303) 555-0194',
      condition: 'Pelvic Alignment & Lower Back',
      practitionerName: 'Dr. Alistair Vance',
      date: today,
      time: '1:30 PM',
      durationMinutes: 45,
      notes: 'Initial Exam ($49). Returning after marathon training.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'confirmed',
      clinicName: 'Columbus Chiropractic Care',
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
      message: 'New online request from John Doe. Initial Consultation ($49) for Lower Back & Sciatica.',
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
  let leads: PatientLead[];
  if (isDemoMode()) {
    leads = sandbox.list<PatientLead>('appointments');
  } else {
    leads = appointmentCache;
  }

  // Deduplicate by ID to guarantee unique React keys across the application
  const seen = new Set<string>();
  return leads.filter((l, idx) => {
    const key = l?.id ? String(l.id) : `lead_${idx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getDispatchedNotifications(): DispatchedNotification[] {
  if (!isDemoMode()) return [];
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
    status: notif.status || 'simulated',
  };
  const updated = [entry, ...current].slice(0, 50); // keep last 50
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    dispatchSafeEvent('notifications_updated', updated );
  } catch {
    // Ignore
  }
  return entry;
}

export function clearDispatchedNotifications(): void {
  try {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    dispatchSafeEvent('notifications_updated', [] );
  } catch {
    // Ignore
  }
}

async function saveMutation(id: string, patch: Partial<PatientLead>, action = 'save') {
  const result = await persistAppointment(id, patch, action);
  const rows = getStoredLeads().filter(l => l.id !== id);
  cacheAppointments(result ? [result, ...rows] : rows);
  return result;
}

export async function saveLead(lead: Omit<PatientLead, 'id' | 'createdAt' | 'status'> & Partial<PatientLead>): Promise<PatientLead> {
  const record = { ...lead, id: lead.id || generateSecureBookingReference(), createdAt: lead.createdAt || new Date().toISOString(),
    clinicId: lead.clinicId || activeClinicId(), status: lead.status || 'new', paymentStatus: lead.paymentStatus || 'unpaid' } as PatientLead;
  return (await saveMutation(record.id, record))!;
}
export async function updateLeadStatus(id: string, status: PatientLead['status'], cancellationReason?: string): Promise<PatientLead[]> {
  await saveMutation(id, { status, ...(cancellationReason ? { cancellationReason } : {}) });
  return getStoredLeads();
}
export async function updateLeadDetails(id: string, patch: Partial<PatientLead>): Promise<PatientLead[]> {
  await saveMutation(id, patch); return getStoredLeads();
}
export async function updateLeadPayment(id: string, patch: Partial<PatientLead> & { notesAppend?: string }): Promise<PatientLead[]> {
  if (!isDemoMode()) {
    const { httpsCallable } = await import('firebase/functions');
    const { functions } = await import('../lib/firebase');
    if (patch.paymentStatus === 'refunded') await httpsCallable(functions, 'refundAppointment')({appointmentId:id});
    else if (patch.paymentMethod === 'clinic_cash') await httpsCallable(functions, 'recordCashPayment')({appointmentId:id});
    else throw new Error('Card charges require a verified payment. No charge has been made.');
  } else await saveMutation(id, patch);
  return getStoredLeads();
}
export async function deleteLead(id: string): Promise<PatientLead[]> {
  await saveMutation(id, {}, 'delete'); return getStoredLeads();
}

export function markNotificationAsRead(id: string): DispatchedNotification[] {
  const current = getDispatchedNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    dispatchSafeEvent('notifications_updated', updated );
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
    dispatchSafeEvent('notifications_updated', updated );
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
    dispatchSafeEvent('notifications_updated', updated );
  } catch {
    // Ignore
  }
  return updated;
}

export function clearAllLeads(): void {
  try {
    localStorage.removeItem(LEADS_STORAGE_KEY);
    dispatchSafeEvent('leads_updated', [] );
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
      name: 'John Doe',
      phone: '(303) 555-0199',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'acc-emily-watson',
      email: 'emily.w@example.com',
      name: 'Emily Watson',
      phone: '(303) 555-0194',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getStoredPatientAccounts(): PatientAccount[] {
  if (!isDemoMode()) { localStorage.removeItem(PATIENT_ACCOUNTS_KEY); return []; }
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
    const safe = parsed.map(({password, ...account}: PatientAccount) => account);
    localStorage.setItem(PATIENT_ACCOUNTS_KEY, JSON.stringify(safe));
    return safe;
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
  if (!isDemoMode()) return {success:false, message:'Use secure account registration.'};
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
  if (!isDemoMode()) return {success:false, message:'Use secure sign in.'};
  const accounts = getStoredPatientAccounts();
  const match = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!match) {
    return { success: false, message: 'No patient account found with that email. Please check your spelling or sign up.' };
  }

  if (!isDemoMode()) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  return { success: true, account: match, message: 'Login successful.' };
}

export function findPatientAppointmentsByEmail(email: string): PatientLead[] {
  const clean = email.trim().toLowerCase();
  if (!clean) return [];
  const leads = getStoredLeads();
  const matches = leads.filter((l) => l.email && l.email.trim().toLowerCase() === clean);
  const seen = new Set<string>();
  return matches.filter((l, idx) => {
    const key = l?.id ? String(l.id) : `lead_${idx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

  const matches = leads.filter((lead) => {
    const leadIdClean = lead.id.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const txIdClean = (lead.transactionId || '').toUpperCase().replace(/[^A-Z0-9-]/g, '');

    return leadIdClean === query || txIdClean === query;
  });

  const seen = new Set<string>();
  return matches.filter((l, idx) => {
    const key = l?.id ? String(l.id) : `lead_${idx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function requestPatientReschedule(leadId: string, date: string, time: string, notes?: string) {
  try { const updatedLead = await saveMutation(leadId, { date, time, notes: notes || '', status:'new' });
    return { success: true, updatedLead: updatedLead || undefined, message: 'Reschedule request saved.' };
  } catch (e:any) { return { success:false, updatedLead:undefined, message:e.message }; }
}
export async function requestPatientCancellation(leadId: string, reason: string) {
  try { const updatedLead = await saveMutation(leadId, {status:'cancelled',cancellationReason:reason});
    return {success:true, updatedLead:updatedLead || undefined, message:'Appointment cancelled.'};
  } catch (e:any) { return {success:false, updatedLead:undefined, message:e.message}; }
}
export async function savePatientIntakeForm(leadId: string, intakeForm: PatientLead['intakeForm']) {
  const updatedLead = await saveMutation(leadId, {intakeForm});
  return {success:!!updatedLead, updatedLead};
}
