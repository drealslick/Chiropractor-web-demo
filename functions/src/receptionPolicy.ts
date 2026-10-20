/**
 * Reception-only mutation boundary. This is intentionally independent of
 * Firebase so the invariants can run in fast unit tests.
 */
export type ReceptionStatus = 'confirmed' | 'checked_in';
export type ReceptionAction = { status?: ReceptionStatus; staffNote?: string };

export function validateReceptionAction(
  currentStatus: string,
  action: ReceptionAction
): { status?: ReceptionStatus; staffNote?: string } {
  const hasStatus = action.status !== undefined;
  const hasNote = action.staffNote !== undefined;
  if (!hasStatus && !hasNote) throw new Error('No reception change specified');
  if (['cancelled', 'hold_expired', 'hold_expired_conflict', 'pending_payment'].includes(currentStatus)) {
    throw new Error('Cannot update an inactive or unpaid booking');
  }
  if (hasStatus && action.status !== 'confirmed' && action.status !== 'checked_in') {
    throw new Error('Reception status is not permitted');
  }
  if (action.status === 'checked_in' && !['confirmed', 'checked_in', 'booked'].includes(currentStatus)) {
    throw new Error('Only confirmed bookings can be checked in');
  }
  if (action.status === 'confirmed' && !['new', 'confirmed', 'booked'].includes(currentStatus)) {
    throw new Error('Appointment cannot transition to confirmed');
  }
  if (hasNote && (typeof action.staffNote !== 'string' ||
    !action.staffNote.trim() || action.staffNote.trim().length > 500)) {
    throw new Error('Staff notes must contain 1 to 500 characters');
  }
  return {
    ...(hasStatus ? { status: action.status } : {}),
    ...(hasNote ? { staffNote: action.staffNote!.trim() } : {}),
  };
}
