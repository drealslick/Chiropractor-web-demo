import { supabase, clinicRowId } from './supabaseClient';

export interface PatientLead {
  id: string;
  source: 'booking' | 'contact';
  name: string;
  email: string;
  phone: string;
  condition?: string;
  date?: string;
  time?: string;
  notes?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'booked' | 'archived';
  clinicName?: string;
}

const LEADS_STORAGE_KEY = 'agency_patient_leads_v1';

export function getStoredLeads(): PatientLead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLead(
  leadInput: Omit<PatientLead, 'id' | 'createdAt' | 'status'> & Partial<PatientLead>
): PatientLead {
  const currentLeads = getStoredLeads();
  const newLead: PatientLead = {
    id: leadInput.id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    source: leadInput.source || 'booking',
    name: leadInput.name || 'Anonymous',
    email: leadInput.email || '',
    phone: leadInput.phone || '',
    condition: leadInput.condition || 'General Consultation',
    date: leadInput.date,
    time: leadInput.time,
    notes: leadInput.notes || '',
    createdAt: leadInput.createdAt || new Date().toISOString(),
    status: leadInput.status || 'new',
    clinicName: leadInput.clinicName || 'Clinic',
  };

  const updated = [newLead, ...currentLeads];
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore storage quota
  }

  // Attempt non-blocking Supabase sync if table exists
  if (supabase) {
    try {
      supabase
        .from('leads')
        .insert({
          clinic_id: clinicRowId(),
          data: newLead,
          created_at: newLead.createdAt,
        })
        .then(
          () => {},
          () => {}
        );
    } catch {
      // Ignore background supabase failure
    }
  }

  return newLead;
}

export function updateLeadStatus(id: string, status: PatientLead['status']): PatientLead[] {
  const current = getStoredLeads();
  const updated = current.map((lead) => (lead.id === id ? { ...lead, status } : lead));
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return updated;
}

export function deleteLead(id: string): PatientLead[] {
  const current = getStoredLeads();
  const updated = current.filter((lead) => lead.id !== id);
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return updated;
}

export function clearAllLeads(): void {
  try {
    localStorage.removeItem(LEADS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: [] }));
  } catch {
    // Ignore
  }
}

export function exportLeadsToCSV(leads: PatientLead[], clinicName: string = 'Clinic') {
  if (leads.length === 0) {
    alert('No leads to export yet.');
    return;
  }

  const headers = ['ID', 'Source', 'Date Created', 'Status', 'Name', 'Phone', 'Email', 'Condition/Reason', 'Requested Date', 'Requested Time', 'Notes'];
  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${l.source}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`,
    `"${l.status}"`,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${(l.condition || '').replace(/"/g, '""')}"`,
    `"${l.date || ''}"`,
    `"${l.time || ''}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-leads-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
