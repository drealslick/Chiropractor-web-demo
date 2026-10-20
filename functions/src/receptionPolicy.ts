/**
 * Reception-only status boundary. Payments and clinical notes must never be
 * mutated through this function.
 */
export type ReceptionStatus = 'confirmed' | 'checked_in';

export function validateReceptionStatus(
  currentStatus: string,
  nextStatus: string
): ReceptionStatus {
  if (currentStatus === 'cancelled' || currentStatus.startsWith('hold_expired') || currentStatus === 'pending_payment') {
    throw new Error('Cannot update an inactive or unpaid appointment');
  }
  if (nextStatus === 'checked_in' && ['confirmed', 'checked_in', 'booked'].includes(currentStatus)) return 'checked_in';
  if (nextStatus === 'confirmed' && ['new', 'confirmed', 'booked'].includes(currentStatus)) return 'confirmed';
  throw new Error('Reception status transition is not permitted');
}

export function canManageReceptionAppointment(
  claims: { role?: unknown; clinicId?: unknown; superAdmin?: unknown },
  appointmentClinicId: string
): boolean {
  return claims.superAdmin === true ||
    (claims.clinicId === appointmentClinicId &&
      (claims.role === 'admin' || claims.role === 'staff' || claims.role === 'practitioner'));
}
