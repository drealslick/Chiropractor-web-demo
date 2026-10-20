import type { SyncStatus } from '../data/ClinicContext';

export type WorkspaceRole = 'admin' | 'editor' | 'staff';

export function resolveWorkspaceRole(
  claims: Record<string, unknown>,
  clinicId: string
): WorkspaceRole | null {
  if (claims.superAdmin === true) return 'admin';
  if (claims.clinicId !== clinicId) return null;
  if (claims.role === 'admin') return 'admin';
  if (claims.role === 'staff' || claims.role === 'practitioner') return 'staff';
  if (claims.role === 'editor' || claims.role === 'content_editor') return 'editor';
  return null;
}

export function getSaveFeedback(status: SyncStatus | string, demo: boolean) {
  if (status === 'saving') return { label: 'Saving to cloud…', error: false };
  if (status === 'error') return { label: 'Save failed', error: true };
  if (status === 'local_only') return { label: 'Saved on this device only', error: false };
  if (status === 'synced')
    return { label: demo ? 'Demo saved on this device' : 'Saved to cloud', error: false };
  return { label: 'Checking connection…', error: false };
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}


export function getReceptionMetrics(leads: Array<{ status: string; date?: string }>, today = localDateKey()) {
  const appointments = leads.filter(lead => lead.date === today && !['cancelled', 'archived', 'waitlist'].includes(lead.status));
  return {
    pendingCount: leads.filter(lead => lead.status === 'new' && lead.date !== today).length,
    todayCount: appointments.length,
    unconfirmedCount: appointments.filter(lead => lead.status === 'new').length,
    checkedInCount: appointments.filter(lead => lead.status === 'checked_in').length,
  };
}
