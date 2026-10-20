import { describe, expect, it } from 'vitest';
import { canManageReceptionAppointment, validateReceptionStatus } from '../functions/src/receptionPolicy';

describe('clinic reception status transitions', () => {
  it('allows confirming a new booking and checking in a confirmed patient', () => {
    expect(validateReceptionStatus('new', 'confirmed')).toBe('confirmed');
    expect(validateReceptionStatus('confirmed', 'checked_in')).toBe('checked_in');
    expect(validateReceptionStatus('booked', 'checked_in')).toBe('checked_in');
  });

  it('rejects payment holds and cancelled bookings', () => {
    expect(() => validateReceptionStatus('pending_payment', 'confirmed')).toThrow();
    expect(() => validateReceptionStatus('hold_expired', 'checked_in')).toThrow();
    expect(() => validateReceptionStatus('cancelled', 'confirmed')).toThrow();
  });

  it('rejects financial-status and unsupported changes', () => {
    expect(() => validateReceptionStatus('confirmed', 'paid_full')).toThrow();
    expect(() => validateReceptionStatus('confirmed', 'refunded')).toThrow();
    expect(() => validateReceptionStatus('new', 'checked_in')).toThrow();
  });

  it('restricts reception access to the authenticated clinic', () => {
    expect(canManageReceptionAppointment({ role: 'staff', clinicId: 'clinic-a' }, 'clinic-a')).toBe(true);
    expect(canManageReceptionAppointment({ role: 'admin', clinicId: 'clinic-a' }, 'clinic-b')).toBe(false);
    expect(canManageReceptionAppointment({ role: 'patient', clinicId: 'clinic-a' }, 'clinic-a')).toBe(false);
    expect(canManageReceptionAppointment({ role: 'staff' }, 'clinic-a')).toBe(false);
    expect(canManageReceptionAppointment({ role: 'editor', clinicId: 'clinic-a' }, 'clinic-a')).toBe(false);
    expect(canManageReceptionAppointment({ superAdmin: true }, 'clinic-b')).toBe(true);
  });

  it('cannot roll a checked-in patient back to confirmed', () => {
    expect(() => validateReceptionStatus('checked_in', 'confirmed')).toThrow();
  });
});
