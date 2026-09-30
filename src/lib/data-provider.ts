import { sandbox } from './sandbox';
import * as firestoreSync from '../services/firebaseSync';
import { PatientLead, PatientAccount } from '../data/leadsStore';
import { functions, isFirebaseConfigured } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { dispatchSafeEvent } from '../utils/customEvents';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !isFirebaseConfigured;

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
    if (isDemoMode) {
      return sandbox.list<PatientLead>('appointments', clinicId);
    }
    // Return empty list if offline; real-time listener handles production
    return [];
  },

  create: async (clinicId: string, lead: PatientLead): Promise<PatientLead> => {
    if (isDemoMode) {
      const created = sandbox.create<PatientLead>('appointments', clinicId, lead);
      notifyDemoAction(`✓ Booking recorded in browser sandbox (${lead.name})`);
      return created;
    }
    await firestoreSync.syncAppointmentToFirestore(lead);
    return lead;
  },

  update: async (id: string, patch: Partial<PatientLead>): Promise<PatientLead | null> => {
    if (isDemoMode) {
      return sandbox.update<PatientLead>('appointments', id, patch);
    }
    return null;
  },

  delete: async (id: string): Promise<boolean> => {
    if (isDemoMode) {
      return sandbox.delete('appointments', id);
    }
    return false;
  },

  getById: async (id: string): Promise<PatientLead | null> => {
    if (isDemoMode) {
      return sandbox.getById<PatientLead>('appointments', id);
    }
    return firestoreSync.fetchAppointmentByIdFromFirestore(id);
  },

  getByEmail: async (email: string): Promise<PatientLead[]> => {
    if (isDemoMode) {
      const all = sandbox.list<PatientLead>('appointments');
      const clean = email.trim().toLowerCase();
      return all.filter((a) => (a.email || '').toLowerCase() === clean);
    }
    return firestoreSync.fetchAppointmentsByEmailFromFirestore(email);
  },

  subscribe: (callback: (appointments: PatientLead[]) => void): (() => void) => {
    if (isDemoMode) {
      const emit = () => {
        callback(sandbox.list<PatientLead>('appointments'));
      };
      emit();
      const handler = () => emit();
      window.addEventListener('sandbox_updated', handler);
      return () => window.removeEventListener('sandbox_updated', handler);
    }
    return firestoreSync.subscribeToAppointments(callback);
  },
};

/**
 * Abstracted Patients Data Provider
 */
export const patientsProvider = {
  list: (clinicId?: string): any[] => {
    if (isDemoMode) {
      return sandbox.list('patients', clinicId);
    }
    return [];
  },
  create: (clinicId: string, patient: any): any => {
    if (isDemoMode) {
      return sandbox.create('patients', clinicId, patient);
    }
    return patient;
  },
  update: (id: string, patch: any): any => {
    if (isDemoMode) {
      return sandbox.update('patients', id, patch);
    }
    return null;
  },
};

/**
 * Abstracted Tickets & Inquiries Data Provider
 */
export const ticketsProvider = {
  list: (clinicId?: string): any[] => {
    if (isDemoMode) {
      return sandbox.list('tickets', clinicId);
    }
    return [];
  },
  create: (clinicId: string, ticket: any): any => {
    if (isDemoMode) {
      return sandbox.create('tickets', clinicId, ticket);
    }
    return ticket;
  },
};

export const inquiriesProvider = {
  list: (clinicId?: string): any[] => {
    if (isDemoMode) {
      return sandbox.list('inquiries', clinicId);
    }
    return [];
  },
  create: (clinicId: string, inquiry: any): any => {
    if (isDemoMode) {
      return sandbox.create('inquiries', clinicId, inquiry);
    }
    return inquiry;
  },
};

export const invoicesProvider = {
  list: (clinicId?: string): any[] => {
    if (isDemoMode) {
      return sandbox.list('invoices', clinicId);
    }
    return [];
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
}): Promise<{ success: boolean; result?: any }> {
  if (isDemoMode) {
    notifyDemoAction(`✓ Email would be sent to ${data.recipientEmail} (${data.type})`);
    return { success: true, result: { simulated: true } };
  }

  try {
    const fn = httpsCallable(functions, 'sendTransactionalEmail');
    const res: any = await fn(data);
    return res.data;
  } catch (err) {
    console.error('sendTransactionalEmail error:', err);
    return { success: false };
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
}): Promise<{ success: boolean; result?: any }> {
  if (isDemoMode) {
    notifyDemoAction(`✓ ${data.channel.toUpperCase()} would be sent to ${data.recipient}`);
    return { success: true, result: { simulated: true } };
  }

  try {
    const fn = httpsCallable(functions, 'sendAutomatedNotification');
    const res: any = await fn(data);
    return res.data;
  } catch (err) {
    console.error('sendAutomatedNotification error:', err);
    return { success: false };
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
}): Promise<any> {
  if (isDemoMode) {
    notifyDemoAction(
      `✓ Would charge ${payload.currency.toUpperCase()} ${(payload.amount / 100).toFixed(2)} (Demo Mode - card not charged)`
    );
    return {
      isDemoMode: true,
      message: 'Demo mode active: payments are simulated with no live card charges.',
    };
  }

  const createIntentFn = httpsCallable(functions, 'createPaymentIntent');
  const res: any = await createIntentFn(payload);
  return res.data;
}
