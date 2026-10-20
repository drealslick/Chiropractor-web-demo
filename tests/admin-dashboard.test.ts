import { describe, expect, it } from 'vitest';
import { getReceptionMetrics, getSaveFeedback, localDateKey, resolveWorkspaceRole } from '../src/lib/admin-state';
import { invitationAccessError } from '../functions/src/staffSecurity';

describe('Workspace authorization', () => {
  it.each(['admin', 'staff', 'practitioner', 'editor', 'content_editor'])(
    'rejects %s from another clinic', role => {
      expect(resolveWorkspaceRole({ role, clinicId: 'other' }, 'clinic')).toBeNull();
    }
  );
  it.each([
    ['admin', 'admin'], ['staff', 'staff'], ['practitioner', 'staff'],
    ['editor', 'editor'], ['content_editor', 'editor'], ['patient', null], ['unknown', null],
  ])('maps verified %s to %s', (role, expected) => {
    expect(resolveWorkspaceRole({ role, clinicId: 'clinic' }, 'clinic')).toBe(expected);
  });
  it('fails closed on missing claims and only recognizes a boolean super-admin claim', () => {
    expect(resolveWorkspaceRole({}, 'clinic')).toBeNull();
    expect(resolveWorkspaceRole({ superAdmin: 'true' }, 'clinic')).toBeNull();
    expect(resolveWorkspaceRole({ superAdmin: true }, 'clinic')).toBe('admin');
  });
});

describe('Save feedback', () => {
  it('never describes a failed save or local-only copy as cloud synced', () => {
    expect(getSaveFeedback('error', false)).toEqual({ label: 'Save failed', error: true });
    expect(getSaveFeedback('local_only', false).label).toBe('Saved on this device only');
    expect(getSaveFeedback('saving', false).label).toBe('Saving to cloud…');
    expect(getSaveFeedback('synced', false).label).toBe('Saved to cloud');
    expect(getSaveFeedback('synced', true).label).toBe('Demo saved on this device');
  });
  it('uses the same local calendar date as the reception UI', () => {
    expect(localDateKey(new Date(2026, 9, 20, 0, 1))).toBe('2026-10-20');
    expect(localDateKey(new Date(2026, 0, 2, 23, 59))).toBe('2026-01-02');
  });
});

describe('Staff invitation identity boundary', () => {
  const claims = { email: 'staff@example.com', email_verified: true, clinicId: 'clinic' };
  const invitation = { email: 'Staff@Example.com', role: 'staff', expiresAt: '2026-10-21T00:00:00Z' };
  const now = Date.parse('2026-10-20T00:00:00Z');
  it('accepts a verified matching email in the same clinic', () => {
    expect(invitationAccessError(claims, 'clinic', invitation, now)).toBeNull();
  });
  it.each([
    { ...claims, email_verified: false }, { ...claims, email: 'someone@example.com' },
    { ...claims, clinicId: 'other' }, { ...claims, superAdmin: true }, { ...claims, role: 'admin' }, { ...claims, role: 'staff' }, {},
  ])('rejects an untrusted recipient before writes', actor => {
    expect(invitationAccessError(actor, 'clinic', invitation, now)).not.toBeNull();
  });
  it.each(['expired', 'invalid', 'missing', 'exact-expiry', 'invalid-role'])(
    'rejects %s invitation metadata', variant => {
      const values = {
        expired: { expiresAt: '2026-10-19T00:00:00Z' }, invalid: { expiresAt: 'invalid' },
        missing: { expiresAt: undefined }, 'exact-expiry': { expiresAt: '2026-10-20T00:00:00Z' },
        'invalid-role': { role: 'superAdmin' },
      };
      expect(invitationAccessError(claims, 'clinic', { ...invitation, ...values[variant] }, now)).not.toBeNull();
    }
  );
});


describe('Reception counts', () => {
  it('shows zero for an empty clinic instead of sample activity', () => {
    expect(getReceptionMetrics([], '2026-10-20')).toEqual({ pendingCount: 0, todayCount: 0, unconfirmedCount: 0, checkedInCount: 0 });
  });
  it('excludes cancelled, archived and waitlisted visits and counts the selected day', () => {
    expect(getReceptionMetrics([
      { status: 'new' }, { status: 'new', date: '2026-10-21' },
      { status: 'new', date: '2026-10-20' }, { status: 'checked_in', date: '2026-10-20' },
      { status: 'confirmed', date: '2026-10-20' }, { status: 'cancelled', date: '2026-10-20' },
      { status: 'archived', date: '2026-10-20' }, { status: 'waitlist', date: '2026-10-20' },
    ], '2026-10-20')).toEqual({ pendingCount: 2, todayCount: 3, unconfirmedCount: 1, checkedInCount: 1 });
  });
});
