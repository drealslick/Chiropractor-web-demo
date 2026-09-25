import { supabase, clinicRowId } from './supabaseClient';

export interface PatientLead {
  id: string;
  source: 'booking' | 'contact';
  name: string;
  email: string;
  phone: string;
  condition?: string;
  practitionerId?: string;
  practitionerName?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'booked' | 'confirmed' | 'cancelled' | 'archived';
  clinicName?: string;
  cancellationReason?: string;
}

export interface DispatchedNotification {
  id: string;
  type: 'clinic_alert' | 'patient_autoresponder' | 'status_update' | 'rescheduled';
  recipient: string;
  channel: 'email' | 'sms';
  subject: string;
  message: string;
  timestamp: string;
  status: 'delivered' | 'simulated';
}

const LEADS_STORAGE_KEY = 'agency_patient_leads_v1';
const NOTIFICATIONS_STORAGE_KEY = 'agency_dispatched_notifications_v1';

export function getStoredLeads(): PatientLead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getDispatchedNotifications(): DispatchedNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logNotification(notif: Omit<DispatchedNotification, 'id' | 'timestamp' | 'status'> & { id?: string; timestamp?: string; status?: 'delivered' | 'simulated' }): DispatchedNotification {
  const current = getDispatchedNotifications();
  const entry: DispatchedNotification = {
    id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: notif.type,
    recipient: notif.recipient,
    channel: notif.channel || 'email',
    subject: notif.subject,
    message: notif.message,
    timestamp: notif.timestamp || new Date().toISOString(),
    status: notif.status || 'delivered',
  };
  const updated = [entry, ...current].slice(0, 50); // keep last 50
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: updated }));
  } catch {
    // Ignore
  }
  return entry;
}

export function clearDispatchedNotifications(): void {
  try {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('notifications_updated', { detail: [] }));
  } catch {
    // Ignore
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
    practitionerId: leadInput.practitionerId,
    practitionerName: leadInput.practitionerName || 'First Available Practitioner',
    date: leadInput.date,
    time: leadInput.time,
    durationMinutes: leadInput.durationMinutes || 45,
    notes: leadInput.notes || '',
    createdAt: leadInput.createdAt || new Date().toISOString(),
    status: leadInput.status || 'new',
    clinicName: leadInput.clinicName || 'Clinic',
    cancellationReason: leadInput.cancellationReason,
  };

  const updated = [newLead, ...currentLeads];
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore storage quota
  }

  // Auto-dispatch simulated notification alerts when a booking request is saved
  if (newLead.source === 'booking') {
    // 1. Alert to Clinic Front Desk
    logNotification({
      type: 'clinic_alert',
      recipient: 'reception@vancehealth.co.uk',
      channel: 'email',
      subject: `[New Appointment Request] ${newLead.name} (${newLead.condition})`,
      message: `A new appointment request was submitted by ${newLead.name} (${newLead.phone}, ${newLead.email}) for ${newLead.date} at ${newLead.time} with ${newLead.practitionerName}. Status: Pending review.`,
    });

    // 2. Auto-responder to Patient
    if (newLead.email) {
      logNotification({
        type: 'patient_autoresponder',
        recipient: newLead.email,
        channel: 'email',
        subject: `We've received your appointment request - ${newLead.clinicName}`,
        message: `Hello ${newLead.name},\n\nWe received your appointment request for ${newLead.date} at ${newLead.time} with ${newLead.practitionerName}.\n\nOur front-desk team will review your symptoms and insurance details within 24 hours to confirm your booking.`,
      });
    }

    // 3. Optional SMS receipt to Patient
    if (newLead.phone) {
      logNotification({
        type: 'patient_autoresponder',
        recipient: newLead.phone,
        channel: 'sms',
        subject: 'SMS Request Received',
        message: `${newLead.clinicName}: We received your booking request for ${newLead.date} @ ${newLead.time}. Our reception will confirm within 24h. Call us if urgent!`,
      });
    }
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

export function updateLeadStatus(id: string, status: PatientLead['status'], cancellationReason?: string): PatientLead[] {
  const current = getStoredLeads();
  let updatedLead: PatientLead | undefined;
  const updated = current.map((lead) => {
    if (lead.id === id) {
      updatedLead = {
        ...lead,
        status,
        ...(cancellationReason ? { cancellationReason } : {}),
      };
      return updatedLead;
    }
    return lead;
  });
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }

  // Log status change notification
  if (updatedLead) {
    if (status === 'confirmed') {
      logNotification({
        type: 'status_update',
        recipient: updatedLead.email || updatedLead.phone,
        channel: 'email',
        subject: `Appointment Confirmed: ${updatedLead.date} at ${updatedLead.time}`,
        message: `Dear ${updatedLead.name}, your appointment with ${updatedLead.practitionerName || 'our clinic'} on ${updatedLead.date} at ${updatedLead.time} has been officially CONFIRMED. Please arrive 10 minutes early.`,
      });
    } else if (status === 'cancelled') {
      logNotification({
        type: 'status_update',
        recipient: updatedLead.email || updatedLead.phone,
        channel: 'email',
        subject: `Appointment Request Cancelled`,
        message: `Dear ${updatedLead.name}, your appointment request for ${updatedLead.date} at ${updatedLead.time} has been cancelled.${cancellationReason ? ` Reason: ${cancellationReason}` : ''} Please contact us if you need to reschedule.`,
      });
    }
  }

  return updated;
}

export function updateLeadDetails(id: string, partial: Partial<PatientLead>): PatientLead[] {
  const current = getStoredLeads();
  let modifiedLead: PatientLead | undefined;
  const updated = current.map((lead) => {
    if (lead.id === id) {
      modifiedLead = { ...lead, ...partial };
      return modifiedLead;
    }
    return lead;
  });
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated', { detail: updated }));
  } catch {
    // Ignore
  }

  if (modifiedLead && (partial.date || partial.time)) {
    logNotification({
      type: 'rescheduled',
      recipient: modifiedLead.email || modifiedLead.phone,
      channel: 'email',
      subject: `Appointment Rescheduled: ${modifiedLead.date} at ${modifiedLead.time}`,
      message: `Dear ${modifiedLead.name}, your appointment has been rescheduled to ${modifiedLead.date} at ${modifiedLead.time} with ${modifiedLead.practitionerName || 'our team'}.`,
    });
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
