/**
 * Authoritative Booking Client Adapter (Phase 3)
 * Connects frontend booking modal, reception calendar, and patient actions
 * to server-side transactional scheduling operations.
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, isFirebaseConfigured } from './firebase';
import { isExplicitDemo } from './mode';
import { sandbox } from './sandbox';
import { PatientLead } from '../data/leadsStore';

export interface BookingSubmissionInput {
  clinicId: string;
  branchId?: string;
  serviceId?: string;
  serviceTitle?: string;
  practitionerId?: string;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  notes?: string;
  condition?: string;
  clientRequestId: string;
  isHold?: boolean;
}

export interface BookingSubmissionResponse {
  success: boolean;
  appointmentId?: string;
  bookingReference?: string;
  practitionerId?: string;
  practitionerName?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  priceAmount?: number;
  depositAmount?: number;
  currency?: string;
  status?: string;
  idempotent?: boolean;
  error?: string;
}

export interface RescheduleSubmissionInput {
  appointmentId: string;
  newDate: string;
  newTime: string;
  newPractitionerId?: string;
  reason?: string;
}

export interface CancelSubmissionInput {
  appointmentId: string;
  reason?: string;
}

/**
 * Generate a cryptographically random UUID v4 for clientRequestId
 */
export function generateClientRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'req_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Authoritatively books an appointment or hold slot on the server
 */
export async function bookAppointmentServer(
  input: BookingSubmissionInput
): Promise<BookingSubmissionResponse> {
  // If demo mode or unconfigured, execute via deterministic sandbox
  if (isExplicitDemo() || !isFirebaseConfigured) {
    const apptId = 'COL-' + Math.floor(1000 + Math.random() * 9000) + '-DEMO';
    const mockAppt: PatientLead = {
      id: apptId,
      source: 'booking',
      name: input.patientName,
      email: input.patientEmail,
      phone: input.patientPhone || '',
      date: input.date,
      time: input.time,
      practitionerId: input.practitionerId || 'dr-alistair-vance',
      practitionerName: input.practitionerId === 'dr-elena-rostova' ? 'Dr. Elena Rostova' : 'Dr. Alistair Vance',
      serviceTitle: input.serviceTitle || 'Initial Diagnostic Consultation & Assessment',
      condition: input.condition || 'Consultation',
      notes: input.notes || '',
      clinicName: input.clinicId,
      status: input.isHold ? 'new' : 'confirmed',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    };

    sandbox.create('appointments', input.clinicId, mockAppt);

    return {
      success: true,
      appointmentId: apptId,
      bookingReference: apptId,
      practitionerId: mockAppt.practitionerId,
      practitionerName: mockAppt.practitionerName,
      date: input.date,
      time: input.time,
      durationMinutes: 45,
      priceAmount: 85,
      depositAmount: 25,
      currency: '£',
      status: input.isHold ? 'pending_payment' : 'confirmed',
    };
  }

  try {
    const functionsInstance = getFunctions(app, 'us-central1');
    const callable = httpsCallable<BookingSubmissionInput, BookingSubmissionResponse>(
      functionsInstance,
      'bookAppointment'
    );

    const result = await callable(input);
    return result.data;
  } catch (err: any) {
    console.error('Server booking rejected:', err);

    let friendlyError = err?.message || 'Booking submission failed. Please try again.';
    if (err?.code === 'functions/already-exists') {
      friendlyError = 'This time slot is no longer available. Please select another time.';
    } else if (err?.code === 'functions/failed-precondition') {
      friendlyError = err.message || 'The selected time is outside clinic opening hours.';
    } else if (err?.code === 'functions/invalid-argument') {
      friendlyError = err.message || 'Please check your booking details.';
    }

    return {
      success: false,
      error: friendlyError,
    };
  }
}

/**
 * Reschedules an appointment atomically via server function
 */
export async function rescheduleAppointmentServer(
  input: RescheduleSubmissionInput
): Promise<{ success: boolean; error?: string }> {
  if (isExplicitDemo() || !isFirebaseConfigured) {
    sandbox.update('appointments', input.appointmentId, {
      date: input.newDate,
      time: input.newTime,
      practitionerId: input.newPractitionerId,
    });
    return { success: true };
  }

  try {
    const functionsInstance = getFunctions(app, 'us-central1');
    const callable = httpsCallable(functionsInstance, 'rescheduleAppointmentSlot');
    await callable(input);
    return { success: true };
  } catch (err: any) {
    console.error('Server reschedule rejected:', err);
    return {
      success: false,
      error: err?.message || 'Rescheduling failed. The slot may be already taken.',
    };
  }
}

/**
 * Cancels an appointment and releases its interval reservation on the server
 */
export async function cancelAppointmentServer(
  input: CancelSubmissionInput
): Promise<{ success: boolean; error?: string }> {
  if (isExplicitDemo() || !isFirebaseConfigured) {
    sandbox.update('appointments', input.appointmentId, {
      status: 'cancelled',
      cancellationReason: input.reason || 'Cancelled via reception',
    });
    return { success: true };
  }

  try {
    const functionsInstance = getFunctions(app, 'us-central1');
    const callable = httpsCallable(functionsInstance, 'cancelAppointmentSlot');
    await callable(input);
    return { success: true };
  } catch (err: any) {
    console.error('Server cancellation rejected:', err);
    return {
      success: false,
      error: err?.message || 'Failed to cancel appointment.',
    };
  }
}

/**
 * Confirms an appointment hold following successful payment
 */
export async function confirmAppointmentHoldServer(input: {
  appointmentId: string;
  paymentIntentId: string;
  paymentChoice?: 'deposit' | 'full';
}): Promise<{ success: boolean; error?: string }> {
  if (isExplicitDemo() || !isFirebaseConfigured) {
    sandbox.update('appointments', input.appointmentId, {
      status: 'confirmed',
      paymentStatus: input.paymentChoice === 'deposit' ? 'deposit_paid' : 'paid_full',
      transactionId: input.paymentIntentId,
    });
    return { success: true };
  }

  try {
    const functionsInstance = getFunctions(app, 'us-central1');
    const callable = httpsCallable(functionsInstance, 'confirmAppointmentHold');
    await callable(input);
    return { success: true };
  } catch (err: any) {
    console.error('Server hold confirmation rejected:', err);
    return {
      success: false,
      error: err?.message || 'Confirmation failed. Hold may have expired.',
    };
  }
}
