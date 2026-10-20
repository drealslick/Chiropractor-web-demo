/** Validate invitation identity before any membership or claims writes. */
export function invitationAccessError(
  claims: Record<string, unknown>,
  clinicId: string,
  invitation: { email?: unknown; role?: unknown; expiresAt?: unknown },
  now = Date.now()
): string | null {
  if (claims.email_verified !== true || typeof claims.email !== 'string') {
    return 'Verify your account email before accepting a staff invitation.';
  }
  if (claims.superAdmin === true || (claims.clinicId && claims.clinicId !== clinicId)) {
    return 'Use an account belonging to this clinic.';
  }
  if (['admin', 'staff', 'practitioner', 'editor', 'content_editor'].includes(String(claims.role))) {
    return 'You already have a staff role. Ask your administrator to update your existing account.';
  }
  if (typeof invitation.email !== 'string' || claims.email.trim().toLowerCase() !== invitation.email.trim().toLowerCase()) {
    return 'This invitation belongs to a different email address.';
  }
  if (!['admin', 'staff', 'practitioner', 'editor'].includes(String(invitation.role))) {
    return 'Invitation role is invalid.';
  }
  const expires = typeof invitation.expiresAt === 'string' ? Date.parse(invitation.expiresAt) : NaN;
  if (!Number.isFinite(expires) || expires <= now) return 'Invitation has expired or has an invalid expiry date.';
  return null;
}
