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

const GATEWAY_SETTINGS_KEY = 'clinic_gateway_settings_v1';
const GATEWAY_LOGS_KEY = 'clinic_gateway_logs_v1';

export const DEFAULT_GATEWAY_SETTINGS: GatewaySettings = {
  smsProvider: 'simulator',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioPhoneNumber: '+44 7700 900192',
  emailProvider: 'simulator',
  sendgridApiKey: '',
  sendgridFromEmail: 'care@columbuschiropractic.com',
  sendgridFromName: 'Clinic Reception',
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
  customSmsReviewTemplate: '{{clinic_name}}: Thank you for visiting today, {{patient_name}}! How is your recovery progressing? We would love your 5-star review: {{review_url}}',
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
    return { ...DEFAULT_GATEWAY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GATEWAY_SETTINGS;
  }
}

export function saveGatewaySettings(settings: GatewaySettings): void {
  try {
    localStorage.setItem(GATEWAY_SETTINGS_KEY, JSON.stringify(settings));
    dispatchSafeEvent('gateway_settings_updated', settings);
  } catch {
    // Ignore
  }
}

export function getGatewayLogs(): GatewayLogEntry[] {
  try {
    const raw = localStorage.getItem(GATEWAY_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(GATEWAY_LOGS_KEY, JSON.stringify(DEFAULT_INITIAL_GATEWAY_LOGS));
      return DEFAULT_INITIAL_GATEWAY_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_GATEWAY_LOGS;
  } catch {
    return DEFAULT_INITIAL_GATEWAY_LOGS;
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
export async function sendLiveOrSimulatedSms(
  toPhone: string,
  messageText: string,
  eventType: GatewayLogEntry['eventType'] = 'test'
): Promise<{ success: boolean; message: string; logId: string; status: GatewayLogEntry['status'] }> {
  const settings = getGatewaySettings();
  const cleanPhone = toPhone.trim();

  if (!cleanPhone) {
    return {
      success: false,
      message: 'Recipient phone number is required.',
      logId: '',
      status: 'failed',
    };
  }

  // 1. ROUTE DISPATCH VIA CLOUD FUNCTION (SERVER-SIDE DISPATCH)
  try {
    const { httpsCallable } = await import('firebase/functions');
    const { functions } = await import('../lib/firebase');
    const sendFn = httpsCallable(functions, 'sendAutomatedNotification');
    const result: any = await sendFn({
      channel: 'sms',
      recipient: cleanPhone,
      messageText,
      subject: 'SMS Notification',
      clinicName: 'Columbus Chiropractic Care',
    });
    if (result.data?.success) {
      const log = logGatewayEvent({
        channel: 'sms',
        provider: 'Twilio Cloud Function',
        recipient: cleanPhone,
        eventType,
        status: 'delivered',
        payloadPreview: messageText,
      });
      return { success: true, message: 'SMS dispatched via Cloud Function.', logId: log.id, status: 'delivered' };
    }
  } catch (err: any) {
    console.warn('Cloud Function SMS dispatch fallback:', err?.message);
  }

  // 2. CUSTOM WEBHOOK DISPATCH
  if (settings.smsProvider === 'custom_webhook' && settings.webhookUrl) {
    try {
      const resp = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.webhookSecret ? { 'X-Webhook-Secret': settings.webhookSecret } : {}),
        },
        body: JSON.stringify({
          event: 'sms_dispatch',
          eventType,
          to: cleanPhone,
          message: messageText,
          timestamp: new Date().toISOString(),
        }),
      });

      if (resp.ok) {
        const log = logGatewayEvent({
          channel: 'webhook',
          provider: 'Custom Webhook (Make/Zapier)',
          recipient: cleanPhone,
          eventType,
          status: 'delivered',
          payloadPreview: messageText,
        });

        return {
          success: true,
          message: `SMS payload transmitted to external webhook (${resp.status} OK)`,
          logId: log.id,
          status: 'delivered',
        };
      }
    } catch (err: any) {
      // Ignore webhook error fallback to simulation
    }
  }

  // 3. SIMULATED DISPATCH (Zero-Config Immediate Preview)
  await new Promise((resolve) => setTimeout(resolve, 400));
  const log = logGatewayEvent({
    channel: 'sms',
    provider: 'Simulated Gateway (Sandbox)',
    recipient: cleanPhone,
    eventType,
    status: 'simulated',
    payloadPreview: messageText,
  });

  return {
    success: true,
    message: `SMS simulated successfully to ${cleanPhone}. (Provider set to Simulator)`,
    logId: log.id,
    status: 'simulated',
  };
}

/**
 * Send Live or Simulated Email
 */
export async function sendLiveOrSimulatedEmail(
  toEmail: string,
  subject: string,
  bodyHtmlOrText: string,
  eventType: GatewayLogEntry['eventType'] = 'test'
): Promise<{ success: boolean; message: string; logId: string; status: GatewayLogEntry['status'] }> {
  const settings = getGatewaySettings();
  const cleanEmail = toEmail.trim();

  if (!cleanEmail) {
    return {
      success: false,
      message: 'Recipient email is required.',
      logId: '',
      status: 'failed',
    };
  }

  // 1. LIVE RESEND GATEWAY DISPATCH
  if (settings.emailProvider === 'resend' && settings.resendApiKey) {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${settings.sendgridFromName || 'Practice'} <${settings.sendgridFromEmail || 'onboarding@resend.dev'}>`,
          to: cleanEmail,
          subject,
          html: `<p>${bodyHtmlOrText.replace(/\n/g, '<br/>')}</p>`,
        }),
      });

      const data = await resp.json();
      if (resp.ok && data.id) {
        const log = logGatewayEvent({
          channel: 'email',
          provider: `Resend Live (${data.id})`,
          recipient: cleanEmail,
          eventType,
          status: 'delivered',
          payloadPreview: `Subject: ${subject} • Body: ${bodyHtmlOrText.slice(0, 100)}...`,
        });

        return {
          success: true,
          message: `Live Email delivered via Resend (ID: ${data.id})`,
          logId: log.id,
          status: 'delivered',
        };
      }
    } catch (err: any) {
      // Fallback
    }
  }

  // 2. SIMULATED EMAIL
  await new Promise((resolve) => setTimeout(resolve, 350));
  const log = logGatewayEvent({
    channel: 'email',
    provider: 'Simulated Email Engine',
    recipient: cleanEmail,
    eventType,
    status: 'simulated',
    payloadPreview: `Subject: ${subject} • Body: ${bodyHtmlOrText.slice(0, 100)}...`,
  });

  return {
    success: true,
    message: `Email simulated successfully to ${cleanEmail}.`,
    logId: log.id,
    status: 'simulated',
  };
}
