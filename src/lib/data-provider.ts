import { sandbox } from './sandbox';
import * as firestoreSync from '../services/firebaseSync';
import { PatientLead, PatientAccount } from '../data/leadsStore';
import { functions, isFirebaseConfigured } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { dispatchSafeEvent } from '../utils/customEvents';
import { isExplicitDemo, isUnconfiguredMode } from './mode';
import { validateAppointmentInput } from './validators';

export const isDemoMode = isExplicitDemo();

export interface DataActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Dispatch lightweight demo notification toast for simulated side-effects
 */
export function notifyDemoAction(message: string) {
  dispatchSafeEvent('demo_notification_toast', { message });
}

/**
 * Abstracted Appointments Data Provider
 */
export const appointmentsProvider = {
  list: async (clinicId?: string): Promise<PatientLead[]> => {
    if (isExplicitDemo()) {
      return sandbox.list<PatientLead>('appointments', clinicId);
    }
    // In live mode without Firebase, return empty rather than fabricating demo records
    if (!isFirebaseConfigured) {
      return [];
    }
    return firestoreSync.fetchAppointmentsByClinicFromFirestore(clinicId || '');
  },

  create: async (clinicId: string, lead: PatientLead): Promise<DataActionResult<PatientLead>> => {
    // 1. Validate input contract
    const validation = validateAppointmentInput({ ...lead, clinicId });
    if (!validation.success) {
      return {
        success: false,
        error: validation.errors?.join(' ') || 'Invalid appointment details provided.',
      };
    }

    // 2. Demo mode execution (isolated to sandbox)
    if (isExplicitDemo()) {
      const created = sandbox.create<PatientLead>('appointments', clinicId, lead);
      notifyDemoAction(`✓ Booking recorded in browser sandbox (${lead.name})`);
      return { success: true, data: created };
    }

    // 3. Live mode execution
    if (!isFirebaseConfigured) {
      return {
        success: false,
        error: 'Firebase is unconfigured on this live deployment. Appointment cannot be saved.',
      };
    }

    const syncResult = await firestoreSync.syncAppointmentToFirestore(lead);
    if (!syncResult.success) {
      return {
        success: false,
        error: syncResult.error || 'Failed to save appointment to Cloud Firestore.',
      };
    }

    return { success: true, data: lead };
  },

  update: async (id: string, patch: Partial<PatientLead>): Promise<DataActionResult<PatientLead>> => {
    if (isExplicitDemo()) {
      const updated = sandbox.update<PatientLead>('appointments', id, patch);
      return updated ? { success: true, data: updated } : { success: false, error: 'Record not found in sandbox.' };
    }

    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase is unconfigured on this live deployment.' };
    }

    const success = await firestoreSync.updateAppointmentInFirestore(id, patch);
    return success ? { success: true } : { success: false, error: 'Firestore update failed.' };
  },

  delete: async (id: string): Promise<DataActionResult<boolean>> => {
    if (isExplicitDemo()) {
      const deleted = sandbox.delete('appointments', id);
      return { success: deleted };
    }

    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase is unconfigured on this live deployment.' };
    }

    const success = await firestoreSync.deleteAppointmentFromFirestore(id);
    return { success };
  },

  getById: async (id: string): Promise<PatientLead | null> => {
    if (isExplicitDemo()) {
      return sandbox.getById<PatientLead>('appointments', id);
    }
    if (!isFirebaseConfigured) return null;
    return firestoreSync.fetchAppointmentByIdFromFirestore(id);
  },

  getByEmail: async (email: string): Promise<PatientLead[]> => {
    if (isExplicitDemo()) {
      const all = sandbox.list<PatientLead>('appointments');
      const clean = email.trim().toLowerCase();
      return all.filter((a) => (a.email || '').toLowerCase() === clean);
    }
    if (!isFirebaseConfigured) return [];
    return firestoreSync.fetchAppointmentsByEmailFromFirestore(email);
  },

  subscribe: (callback: (appointments: PatientLead[]) => void, clinicIdFilter?: string): (() => void) => {
    if (isExplicitDemo()) {
      const emit = () => {
        callback(sandbox.list<PatientLead>('appointments', clinicIdFilter));
      };
      emit();
      const handler = () => emit();
      window.addEventListener('sandbox_updated', handler);
      return () => window.removeEventListener('sandbox_updated', handler);
    }
    if (!isFirebaseConfigured) {
      callback([]);
      return () => {};
    }
    return firestoreSync.subscribeToAppointments(callback, clinicIdFilter);
  },
};

/**
 * Intercept side-effect: sendTransactionalEmail
 */
export async function sendTransactionalEmail(data: {
  type: string;
  recipientEmail: string;
  patientName?: string;
  date?: string;
  time?: string;
  doctorName?: string;
  appointmentId?: string;
}): Promise<DataActionResult<any>> {
  if (isExplicitDemo()) {
    notifyDemoAction(`✓ Email would be sent to ${data.recipientEmail} (${data.type})`);
    return { success: true, data: { simulated: true } };
  }

  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is unconfigured on this live deployment.' };
  }

  try {
    const fn = httpsCallable(functions, 'sendTransactionalEmail');
    const res: any = await fn(data);
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('sendTransactionalEmail error:', err);
    return { success: false, error: err.message || 'Email dispatch failed' };
  }
}

/**
 * Intercept side-effect: sendAutomatedNotification
 */
export async function sendAutomatedNotification(data: {
  channel: 'sms' | 'email';
  recipient: string;
  messageText: string;
  subject?: string;
  clinicName?: string;
}): Promise<DataActionResult<any>> {
  if (isExplicitDemo()) {
    notifyDemoAction(`✓ ${data.channel.toUpperCase()} would be sent to ${data.recipient}`);
    return { success: true, data: { simulated: true } };
  }

  if (!isFirebaseConfigured) {
    return { success: false, error: 'Firebase is unconfigured on this live deployment.' };
  }

  try {
    const fn = httpsCallable(functions, 'sendAutomatedNotification');
    const res: any = await fn(data);
    return { success: true, data: res.data };
  } catch (err: any) {
    console.error('sendAutomatedNotification error:', err);
    return { success: false, error: err.message || 'Notification dispatch failed' };
  }
}

/**
 * Intercept side-effect: Stripe payment intent creation
 */
export async function createPaymentIntent(payload: {
  clinicId: string;
  appointmentId: string;
  amount: number;
  currency: string;
  paymentChoice: string;
  patientEmail: string;
  patientName: string;
  serviceTitle: string;
}): Promise<DataActionResult<any>> {
  if (isExplicitDemo()) {
    notifyDemoAction(
      `✓ Would charge ${payload.currency.toUpperCase()} ${(payload.amount / 100).toFixed(2)} (Demo Mode - card not charged)`
    );
    return {
      success: true,
      data: {
        isDemoMode: true,
        message: 'Demo mode active: payments are simulated with no live card charges.',
      },
    };
  }

  if (!isFirebaseConfigured) {
    return {
      success: false,
      error: 'Firebase is not configured on this live deployment. Stripe payments cannot be processed.',
    };
  }

  try {
    const createIntentFn = httpsCallable(functions, 'createPaymentIntent');
    const res: any = await createIntentFn(payload);
    return { success: true, data: res.data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Payment intent creation failed.',
    };
  }
}
