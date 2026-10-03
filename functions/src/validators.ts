/**
 * Server-side Input & Contract Validators (Cloud Functions)
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  return (phone || '').trim();
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_MIN_DIGITS = 7;
const CLINIC_ID_REGEX = /^[a-zA-Z0-9_-]{2,100}$/;

export interface ServerValidatedAppointment {
  clinicId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceType: 'initial' | 'followup' | 'custom';
  serviceTitle: string;
  durationMinutes: number;
  condition?: string;
  locationId?: string;
  practitionerId?: string;
  practitionerName?: string;
  notes?: string;
}

export function validateServerAppointmentInput(raw: any): ValidationResult<ServerValidatedAppointment> {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { success: false, errors: ['Request body must be a valid JSON object.'] };
  }

  // Reject unexpected authority tampering fields
  const forbiddenFields = ['paymentStatus', 'amountPaid', 'transactionId', 'isVerifiedAdmin', 'role', 'claims'];
  for (const field of forbiddenFields) {
    if (field in raw && raw[field] !== undefined) {
      errors.push(`Authority field '${field}' cannot be supplied in client appointment creation.`);
    }
  }

  // Clinic ID
  const clinicId = (raw.clinicId || raw.clinicName || '').trim();
  if (!clinicId || !CLINIC_ID_REGEX.test(clinicId.toLowerCase().replace(/\s+/g, '-'))) {
    errors.push('A valid clinicId is required (alphanumeric, dashes, underscores).');
  }

  // Patient Name
  const name = (raw.name || raw.patientName || '').trim();
  if (!name || name.length < 2 || name.length > 100) {
    errors.push('Patient name is required (between 2 and 100 characters).');
  }

  // Patient Email
  const email = normalizeEmail(raw.email || raw.patientEmail || '');
  if (!email || !EMAIL_REGEX.test(email) || email.length > 120) {
    errors.push('A valid email address is required.');
  }

  // Patient Phone
  const phone = normalizePhone(raw.phone || raw.patientPhone || '');
  const digitCount = (phone.match(/\d/g) || []).length;
  if (!phone || digitCount < PHONE_MIN_DIGITS || phone.length > 30) {
    errors.push(`A valid phone number with at least ${PHONE_MIN_DIGITS} digits is required.`);
  }

  // Date & Time
  const date = (raw.date || raw.preferredDate || '').trim();
  if (!date || date.length > 30) {
    errors.push('Appointment date is required.');
  }

  const time = (raw.time || raw.preferredTime || '').trim();
  if (!time || time.length > 30) {
    errors.push('Appointment time is required.');
  }

  const allowedServiceTypes = ['initial', 'followup', 'custom'];
  const serviceType = allowedServiceTypes.includes(raw.serviceType) ? raw.serviceType : 'initial';
  const serviceTitle = (raw.serviceTitle || raw.condition || 'Consultation').trim().slice(0, 150);
  const durationMinutes = typeof raw.durationMinutes === 'number' && raw.durationMinutes > 0 ? raw.durationMinutes : 45;

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      clinicId: clinicId.toLowerCase().replace(/\s+/g, '-'),
      name,
      email,
      phone,
      date,
      time,
      serviceType,
      serviceTitle,
      durationMinutes,
      condition: (raw.condition || '').slice(0, 150),
      locationId: (raw.locationId || '').slice(0, 50),
      practitionerId: (raw.practitionerId || raw.preferredPractitionerId || '').slice(0, 50),
      practitionerName: (raw.practitionerName || raw.preferredPractitionerName || '').slice(0, 100),
      notes: (raw.notes || '').slice(0, 1000),
    },
  };
}
