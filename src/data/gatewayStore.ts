import { isDemoMode } from '../lib/data-provider';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { dispatchSafeEvent } from '../utils/customEvents';

export interface GatewaySettings {
  smsProvider: 'simulator' | 'twilio' | 'custom_webhook';
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  emailProvider: 'simulator' | 'sendgrid' | 'resend' | 'custom_webhook';
  sendgridApiKey: string;
  sendgridFromEmail: string;
  sendgridFromName: string;
  resendApiKey: string;
  webhookUrl: string;
  webhookSecret: string;
  autoSendBookingConfirmation: boolean;
  autoSend24hReminder: boolean;
  autoSend2hReminder: boolean;
  autoSendIntakeNudge: boolean;
  autoSendRescheduleAlert: boolean;
  autoSendCancellationAlert: boolean;
  autoSendReviewRequest: boolean;
  customSmsBookingTemplate: string;
  customSmsReminderTemplate: string;
  customSms2hReminderTemplate: string;
  customSmsIntakeNudgeTemplate: string;
  customSmsRescheduleTemplate: string;
  customSmsCancellationTemplate: string;
  customSmsReviewTemplate: string;
  customEmailBookingSubject: string;
  customEmailIntakeSubject: string;
  customEmailIntakeBody: string;
}

export interface GatewayLogEntry {
  id: string;
  timestamp: string;
  channel: 'sms' | 'email' | 'webhook';
  provider: string;
  recipient: string;
  eventType:
    | 'booking_confirmation'
    | 'reminder_24h'
    | 'reminder_2h'
    | 'intake_nudge'
    | 'reschedule'
    | 'cancellation'
    | 'review_request'
    | 'test';
  status: 'delivered' | 'sent' | 'failed' | 'simulated';
  payloadPreview: string;
  errorMessage?: string;
}

const GATEWAY_SETTINGS_KEY = 'vance_gateway_settings_v1';
const GATEWAY_LOGS_KEY = 'vance_gateway_logs_v1';

export const DEFAULT_GATEWAY_SETTINGS: GatewaySettings = {
  smsProvider: 'simulator',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '+44 7700 900192',
  emailProvider: 'simulator',
  sendgridApiKey: '',
  sendgridFromEmail: 'care@columbuschiropractic.co.uk',
  sendgridFromName: 'Columbus Chiropractic Reception',
  resendApiKey: '',
  webhookUrl: '',
  webhookSecret: '',
  autoSendBookingConfirmation: true,
  autoSend24hReminder: true,
  autoSend2hReminder: true,
  autoSendIntakeNudge: true,
  autoSendRescheduleAlert: true,
  autoSendCancellationAlert: true,
  autoSendReviewRequest: true,
  customSmsBookingTemplate: '{{clinic_name}}: Hello {{patient_name}}! Your appointment with {{doctor_name}} is confirmed for {{date}} at {{time}}. Ref: {{ref_code}}. Manage or complete intake at {{portal_url}}',
  customSmsReminderTemplate: '{{clinic_name}} 24h Reminder: Your appointment is tomorrow {{date}} at {{time}} with {{doctor_name}}. Please arrive 10m early. Reply YES to confirm or manage at {{portal_url}}',
  customSms2hReminderTemplate: '{{clinic_name}} Alert: See you in 2 hours at {{time}}! Address: {{clinic_address}}. Free patient parking in rear. Call {{phone}} if delayed.',
  customSmsIntakeNudgeTemplate: '{{clinic_name}}: Hi {{patient_name}}, please take 2 minutes to map your spinal pain points and complete your pre-visit health intake before arrival: {{portal_url}}',
  customSmsRescheduleTemplate: '{{clinic_name}}: Your appointment has been updated to {{date}} at {{time}} with {{doctor_name}}. Need to change? Reply or visit {{portal_url}}',
  customSmsCancellationTemplate: '{{clinic_name}}: Your booking for {{date}} has been cancelled. If you need further care, rebook anytime at {{portal_url}}',
  customSmsReviewTemplate: '{{clinic_name}}: Thank you for visiting today, {{patient_name}}! How is your spine feeling? We would love your 5-star review: {{review_url}}',
  customEmailBookingSubject: 'Appointment Confirmed: {{clinic_name}} - {{date}} at {{time}}',
  customEmailIntakeSubject: 'Action Required: Pre-Visit Digital Pain Map for {{date}} at {{time}}',
  customEmailIntakeBody: 'Hi {{patient_name}},\n\nTo save you 15 minutes of paperwork in our reception lounge and allow {{doctor_name}} to review your case prior to arrival, please complete your interactive 2D anatomical pain map and medical history questionnaire here:\n\n{{portal_url}}\n\nThank you,\n{{clinic_name}} Reception Team',
};

export const DEFAULT_INITIAL_GATEWAY_LOGS: GatewayLogEntry[] = [
  {
    id: 'gw-log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    channel: 'sms',
    provider: 'Simulated Gateway',
    recipient: '+44 7911 123456 (John Doe)',
    eventType: 'booking_confirmation',
    status: 'delivered',
    payloadPreview: 'Columbus Chiropractic Care: Hello John Doe! Your appointment with Dr. Alistair Vance is confirmed for tomorrow at 12:00 PM. Ref: COL-9428-K82X.',
  },
  {
    id: 'gw-log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    channel: 'email',
    provider: 'Simulated Gateway',
    recipient: 'johndoe@example.com',
    eventType: 'booking_confirmation',
    status: 'delivered',
    payloadPreview: 'Subject: Appointment Confirmed: Columbus Chiropractic Care - Tomorrow at 12:00 PM. Itemized invoice attached.',
  },
  {
    id: 'gw-log-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    channel: 'sms',
    provider: 'Simulated Gateway',
    recipient: '+44 7822 449102 (Sarah Jenkins)',
    eventType: 'reminder_24h',
    status: 'delivered',
    payloadPreview: 'Columbus Chiropractic Care Reminder: Your appointment is today at 3:00 PM. Please arrive 10m early. Address: 44 Wicklow St, London.',
  },
];

export function getGatewaySettings(): GatewaySettings {
  try {
    const raw = localStorage.getItem(GATEWAY_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(GATEWAY_SETTINGS_KEY, JSON.stringify(DEFAULT_GATEWAY_SETTINGS));
      return DEFAULT_GATEWAY_SETTINGS;
    }
    const clean = scrubSecrets({ ...DEFAULT_GATEWAY_SETTINGS, ...JSON.parse(raw) });
    localStorage.setItem(GATEWAY_SETTINGS_KEY, JSON.stringify(clean));
    return clean;
  } catch {
    return DEFAULT_GATEWAY_SETTINGS;
  }
}

function scrubSecrets(settings: GatewaySettings): GatewaySettings {
  return {...settings,twilioAuthToken:'',sendgridApiKey:'',resendApiKey:'',webhookSecret:''};
}
export function saveGatewaySettings(settings: GatewaySettings): void {
  settings = scrubSecrets(settings);
  try {
    localStorage.setItem(GATEWAY_SETTINGS_KEY, JSON.stringify(settings));
    dispatchSafeEvent('gateway_settings_updated', settings);
  } catch {
    // Ignore
  }
}

export function getGatewayLogs(): GatewayLogEntry[] {
  if (!isDemoMode) return [];
  try {
    const raw = localStorage.getItem(GATEWAY_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(GATEWAY_LOGS_KEY, JSON.stringify(DEFAULT_INITIAL_GATEWAY_LOGS));
      return isDemoMode ? DEFAULT_INITIAL_GATEWAY_LOGS : [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_GATEWAY_LOGS;
  } catch {
    return isDemoMode ? DEFAULT_INITIAL_GATEWAY_LOGS : [];
  }
}

export function logGatewayEvent(entry: Omit<GatewayLogEntry, 'id' | 'timestamp'>): GatewayLogEntry {
  const current = getGatewayLogs();
  const newEntry: GatewayLogEntry = {
    id: `gw-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const updated = [newEntry, ...current].slice(0, 100);
  try {
    localStorage.setItem(GATEWAY_LOGS_KEY, JSON.stringify(updated));
    dispatchSafeEvent('gateway_logs_updated', updated);
  } catch {
    // Ignore
  }
  return newEntry;
}

export function clearGatewayLogs(): void {
  try {
    localStorage.setItem(GATEWAY_LOGS_KEY, JSON.stringify([]));
    dispatchSafeEvent('gateway_logs_updated', []);
  } catch {
    // Ignore
  }
}

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    const re = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(re, val || '');
  }
  return result;
}

/**
 * Send Live or Simulated SMS
 */
async function dispatch(channel: 'email' | 'sms', recipient: string, messageText: string, eventType: GatewayLogEntry['eventType'], subject = '') {
  try {
    if (!recipient.trim()) throw new Error('Choose a patient contact.');
    let status: GatewayLogEntry['status'] = 'simulated';
    if (!isDemoMode) {
      const { getStoredLeads } = await import('./leadsStore');
      const appointment = getStoredLeads().find(a => channel === 'sms' ? a.phone === recipient : a.email === recipient);
      if (!appointment) throw new Error('Select an appointment before sending a notification.');
      const response = await httpsCallable(functions, 'sendAutomatedNotification')({ appointmentId:appointment.id, channel,recipient,messageText,subject });
      if (!(response.data as any).success) throw new Error('Provider did not accept the message.');
      status='sent';
    }
    const log=logGatewayEvent({channel,provider:isDemoMode?'Demo':'Server gateway',recipient,eventType,status,payloadPreview:messageText.slice(0,100)});
    return {success:true,message:isDemoMode?'Demo message simulated.':'Message accepted by provider; delivery is pending.',logId:log.id,status};
  } catch(e:any) { return {success:false,message:e.message,logId:'',status:'failed' as const}; }
}
export async function sendLiveOrSimulatedSms(toPhone: string, messageText: string, eventType: GatewayLogEntry['eventType'] = 'test') {
  return dispatch('sms',toPhone,messageText,eventType);
}
export async function sendLiveOrSimulatedEmail(toEmail: string, subject: string, bodyHtmlOrText: string, eventType: GatewayLogEntry['eventType'] = 'test') {
  return dispatch('email',toEmail,bodyHtmlOrText,eventType,subject);
}
