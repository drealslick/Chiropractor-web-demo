import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  Webhook,
  ShieldCheck,
  RotateCcw,
  Smartphone,
  Layers,
  Copy,
  Check,
  Radio,
  ExternalLink,
  Info,
  Trash2,
  RefreshCw,
  Sliders,
  Settings,
  KeyRound,
  FileText,
  BellRing,
} from 'lucide-react';
import { ClinicInfo } from '../../types';
import {
  GatewaySettings,
  GatewayLogEntry,
  getGatewaySettings,
  saveGatewaySettings,
  getGatewayLogs,
  clearGatewayLogs,
  sendLiveOrSimulatedSms,
  sendLiveOrSimulatedEmail,
  interpolateTemplate,
  DEFAULT_GATEWAY_SETTINGS,
} from '../../data/gatewayStore';

interface LiveGatewayManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const LiveGatewayManager: React.FC<LiveGatewayManagerProps> = ({ clinic, onUpdateClinic }) => {
  const [settings, setSettings] = useState<GatewaySettings>(getGatewaySettings);
  const [logs, setLogs] = useState<GatewayLogEntry[]>(getGatewayLogs);
  const [activeSubTab, setActiveSubTab] = useState<'providers' | 'templates' | 'simulator' | 'logs'>('simulator');

  // Test SMS State
  const [testPhone, setTestPhone] = useState(clinic.phone || '+44 7911 123456');
  const [testEventType, setTestEventType] = useState<GatewayLogEntry['eventType']>('booking_confirmation');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Active Template Preview
  const [selectedTemplateTab, setSelectedTemplateTab] = useState<'booking' | 'reminder' | 'reschedule' | 'review'>('booking');

  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  useEffect(() => {
    const handleLogUpdate = (e: Event) => {
      const custom = e as CustomEvent<GatewayLogEntry[]>;
      setLogs(custom.detail || getGatewayLogs());
    };
    window.addEventListener('gateway_logs_updated', handleLogUpdate);
    return () => window.removeEventListener('gateway_logs_updated', handleLogUpdate);
  }, []);

  const handleUpdateSetting = <K extends keyof GatewaySettings>(key: K, value: GatewaySettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveGatewaySettings(updated);
  };

  const handleSaveAll = () => {
    saveGatewaySettings(settings);
    setSavedNotification('Gateway credentials & triggers updated successfully!');
    setTimeout(() => setSavedNotification(null), 3000);
  };

  const sampleVars = {
    patient_name: 'John Doe',
    clinic_name: clinic.name || 'Vance Health',
    doctor_name: clinic.leadPractitionerName || 'Dr. Alistair Vance',
    date: 'Tomorrow, Oct 14',
    time: '12:00 PM',
    ref_code: 'VH-9428-K82X',
    portal_url: 'vancehealth.co.uk/portal?ref=VH-9428-K82X',
    clinic_address: clinic.address || '44 Wicklow St, London',
    phone: clinic.phone || '+44 20 7946 0192',
    review_url: 'g.page/vance-health/review',
  };

  const getActiveTemplateText = () => {
    switch (selectedTemplateTab) {
      case 'booking':
        return settings.customSmsBookingTemplate;
      case 'reminder':
        return settings.customSmsReminderTemplate;
      case 'reschedule':
        return settings.customSmsRescheduleTemplate;
      case 'review':
        return settings.customSmsReviewTemplate;
    }
  };

  const renderedPreviewText = interpolateTemplate(getActiveTemplateText(), sampleVars);

  const handleSendTestSms = async () => {
    if (!testPhone.trim()) return;
    setIsSendingTest(true);
    setTestResult(null);

    const message = renderedPreviewText;
    const res = await sendLiveOrSimulatedSms(testPhone, message, testEventType);

    setIsSendingTest(false);
    setTestResult({ success: res.success, message: res.message });
    setLogs(getGatewayLogs());

    setTimeout(() => {
      setTestResult(null);
    }, 6000);
  };

  const handleCopyVar = (tag: string) => {
    navigator.clipboard.writeText(`{{${tag}}}`);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const deliveredCount = logs.filter((l) => l.status === 'delivered' || l.status === 'simulated').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Live SMS & Communication Gateway</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Connect live Twilio SMS credentials, configure automated patient appointment reminders, and preview interactive dispatches.
          </p>
        </div>

        {savedNotification && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{savedNotification}</span>
          </div>
        )}
      </div>

      {/* Metric Counters & Gateway Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">SMS Mode</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${settings.smsProvider === 'twilio' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <strong className="text-xs text-stone-100 uppercase font-mono">
              {settings.smsProvider === 'twilio' ? 'Twilio Live' : settings.smsProvider === 'custom_webhook' ? 'Webhook' : 'Sandbox (Simulated)'}
            </strong>
          </div>
        </div>

        <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Email Engine</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <strong className="text-xs text-stone-100 uppercase font-mono">
              {settings.emailProvider === 'resend' ? 'Resend Live' : settings.emailProvider === 'sendgrid' ? 'SendGrid Live' : 'Active (Simulated)'}
            </strong>
          </div>
        </div>

        <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Messages Dispatched</span>
          <p className="text-base font-bold text-stone-100 font-mono mt-0.5">{logs.length}</p>
        </div>

        <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Transmission Rate</span>
          <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
            {logs.length > 0 ? `${Math.round((deliveredCount / logs.length) * 100)}%` : '100%'}
          </p>
        </div>
      </div>

      {/* Main Subtabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'simulator', label: '1. Interactive SMS Simulator & Test Sender', icon: Smartphone },
          { id: 'templates', label: '2. Automated Patient Triggers & Templates', icon: BellRing },
          { id: 'providers', label: '3. API Credentials (Twilio / Webhook)', icon: KeyRound },
          { id: 'logs', label: `4. Live Activity Feed (${logs.length})`, icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-850 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------- SUBTAB 1: INTERACTIVE SIMULATOR & TEST SENDER ------------------- */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Live Test Sender Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Trigger Live SMS Test</span>
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Send a test text to any phone number to verify carrier delivery.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                  {settings.smsProvider === 'twilio' ? 'Twilio Live' : 'Simulator Mode'}
                </span>
              </div>

              {/* Template Selector for Test */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Select Event Notification Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'booking', type: 'booking_confirmation', label: 'Booking Confirmation' },
                    { id: 'reminder', type: 'reminder_24h', label: '24-Hour Reminder' },
                    { id: 'reschedule', type: 'reschedule', label: 'Reschedule Alert' },
                    { id: 'review', type: 'review_request', label: 'Google Review Booster' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateTab(t.id as any);
                        setTestEventType(t.type as any);
                      }}
                      className={`p-2 rounded-xl text-xs text-left font-semibold transition cursor-pointer border ${
                        selectedTemplateTab === t.id
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Phone Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Recipient Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+44 7911 123456 or (555) 234-5678"
                    className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-750 rounded-xl text-xs text-stone-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dispatch Button */}
              <button
                type="button"
                onClick={handleSendTestSms}
                disabled={isSendingTest}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Transmitting Carrier Signal...' : 'Dispatch Test SMS Message →'}</span>
              </button>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-fade-in ${
                    testResult.success
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-200'
                      : 'bg-rose-950 border border-rose-800 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Template Variables Legend */}
            <div className="p-4 bg-stone-850 border border-stone-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                Dynamic Variables Available in Templates (Click to Copy):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'patient_name',
                  'clinic_name',
                  'doctor_name',
                  'date',
                  'time',
                  'ref_code',
                  'portal_url',
                  'clinic_address',
                  'phone',
                  'review_url',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleCopyVar(tag)}
                    className="px-2 py-1 rounded-md bg-stone-900 hover:bg-emerald-950 text-stone-300 hover:text-emerald-300 font-mono text-[10px] border border-stone-750 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{`{{${tag}}}`}</span>
                    {copiedVar === tag ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-40" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Smartphone Simulator */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] bg-stone-950 border-4 border-stone-750 rounded-[40px] p-3 shadow-2xl relative overflow-hidden">
              {/* Phone Notch / Speaker */}
              <div className="w-28 h-4 bg-stone-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-stone-950" />
              </div>

              {/* Message Header */}
              <div className="border-b border-stone-800 pb-2 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-900/80 text-emerald-200 font-serif font-bold text-sm flex items-center justify-center mx-auto mb-1">
                  {(clinic.name || 'V').charAt(0)}
                </div>
                <strong className="text-xs text-stone-200 block truncate">{clinic.name || 'Vance Health'}</strong>
                <span className="text-[10px] text-stone-500 font-mono">
                  {settings.smsProvider === 'twilio' ? settings.twilioPhoneNumber || '+44 7700 900192' : 'Verified SMS Gateway'}
                </span>
              </div>

              {/* Simulated Chat Thread */}
              <div className="py-5 px-1 space-y-3 min-h-[280px] flex flex-col justify-end">
                <span className="text-[10px] text-stone-500 font-mono text-center block">Today 12:00 PM</span>

                <div className="bg-emerald-700 text-white rounded-2xl rounded-bl-xs p-3.5 text-xs leading-relaxed shadow-sm">
                  {renderedPreviewText}
                </div>

                <div className="text-[10px] text-stone-500 text-right pr-1 flex items-center justify-end gap-1 font-mono">
                  <span>Delivered</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" />
                </div>
              </div>

              {/* Phone Bottom Pill bar */}
              <div className="mt-4 pt-2 border-t border-stone-800/80 flex items-center justify-between px-2 text-[10px] text-stone-500">
                <span>{renderedPreviewText.length} Characters</span>
                <span>1 Segment (GSM-7)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ------------------- SUBTAB 2: AUTOMATED PATIENT TRIGGERS & TEMPLATES ------------------- */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          {/* Automated Event Trigger Toggles */}
          <div className="p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5" />
                <span>Automated Practice Event Triggers</span>
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Configure which customer touchpoints automatically trigger real-time SMS & email dispatches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  key: 'autoSendBookingConfirmation',
                  label: 'Instant Booking Confirmation',
                  desc: 'Sends immediately when a patient schedules online or from front-desk.',
                },
                {
                  key: 'autoSend24hReminder',
                  label: '24-Hour Pre-Appointment SMS',
                  desc: 'Reminds patient of upcoming time slot, parking, and arrival instructions.',
                },
                {
                  key: 'autoSendRescheduleAlert',
                  label: 'Reschedule Modification Alert',
                  desc: 'Sends updated time slot details whenever an appointment is moved.',
                },
                {
                  key: 'autoSendCancellationAlert',
                  label: 'Cancellation Confirmation',
                  desc: 'Confirms appointment cancellation and provides easy rebooking link.',
                },
                {
                  key: 'autoSendReviewRequest',
                  label: 'Post-Adjustment 5-Star Review Booster',
                  desc: 'Follows up 2 hours after checkout requesting a Google Maps review.',
                },
              ].map((trigger) => {
                const isActive = (settings as any)[trigger.key];
                return (
                  <div
                    key={trigger.key}
                    onClick={() => handleUpdateSetting(trigger.key as any, !isActive)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isActive
                        ? 'bg-emerald-950/40 border-emerald-700 text-stone-200'
                        : 'bg-stone-900 border-stone-800 text-stone-400 opacity-70'
                    }`}
                  >
                    <div>
                      <strong className="text-xs block text-stone-100">{trigger.label}</strong>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{trigger.desc}</p>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-stone-700'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Template Copy Editors */}
          <div className="p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>SMS Template Copy Customizer</span>
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Customize the exact SMS copy sent to your patients.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Save Templates
              </button>
            </div>

            {/* Template Tabs */}
            <div className="flex gap-2 border-b border-stone-800 pb-2">
              {[
                { id: 'booking', label: '1. Booking SMS' },
                { id: 'reminder', label: '2. 24h Reminder SMS' },
                { id: 'reschedule', label: '3. Reschedule SMS' },
                { id: 'review', label: '4. Google Review Booster' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedTemplateTab === t.id
                      ? 'bg-stone-800 text-emerald-300 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Active Editor */}
            {selectedTemplateTab === 'booking' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Booking Confirmation SMS Template
                </label>
                <textarea
                  rows={3}
                  value={settings.customSmsBookingTemplate}
                  onChange={(e) => handleUpdateSetting('customSmsBookingTemplate', e.target.value)}
                  className="w-full p-3 bg-stone-900 border border-stone-750 rounded-xl text-xs text-stone-200 font-mono leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {selectedTemplateTab === 'reminder' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                  24-Hour Pre-Visit Reminder SMS Template
                </label>
                <textarea
                  rows={3}
                  value={settings.customSmsReminderTemplate}
                  onChange={(e) => handleUpdateSetting('customSmsReminderTemplate', e.target.value)}
                  className="w-full p-3 bg-stone-900 border border-stone-750 rounded-xl text-xs text-stone-200 font-mono leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {selectedTemplateTab === 'reschedule' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Reschedule Notification SMS Template
                </label>
                <textarea
                  rows={3}
                  value={settings.customSmsRescheduleTemplate}
                  onChange={(e) => handleUpdateSetting('customSmsRescheduleTemplate', e.target.value)}
                  className="w-full p-3 bg-stone-900 border border-stone-750 rounded-xl text-xs text-stone-200 font-mono leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {selectedTemplateTab === 'review' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Post-Adjustment Google Review Booster SMS Template
                </label>
                <textarea
                  rows={3}
                  value={settings.customSmsReviewTemplate}
                  onChange={(e) => handleUpdateSetting('customSmsReviewTemplate', e.target.value)}
                  className="w-full p-3 bg-stone-900 border border-stone-750 rounded-xl text-xs text-stone-200 font-mono leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------- SUBTAB 3: PROVIDER CREDENTIALS & KEYS ------------------- */}
      {activeSubTab === 'providers' && (
        <div className="space-y-6">
          {/* SMS Provider Selection */}
          <div className="p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>SMS Gateway Provider</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'simulator', title: 'Sandbox Simulator', desc: 'No credentials needed. Full preview & activity logs.' },
                { id: 'twilio', title: 'Twilio REST API', desc: 'Direct carrier SMS delivery via Twilio API.' },
                { id: 'custom_webhook', title: 'External Webhook', desc: 'Transmit JSON to Make.com, Zapier, or EHR.' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleUpdateSetting('smsProvider', p.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    settings.smsProvider === p.id
                      ? 'bg-emerald-950/50 border-emerald-600 text-white'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="font-bold text-xs text-stone-100">{p.title}</span>
                  <p className="text-[11px] text-stone-400 mt-1">{p.desc}</p>
                </button>
              ))}
            </div>

            {/* Twilio Input Fields */}
            {settings.smsProvider === 'twilio' && (
              <div className="p-4 bg-stone-900 border border-stone-750 rounded-xl space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                      Twilio Account SID *
                    </label>
                    <input
                      type="text"
                      value={settings.twilioAccountSid}
                      onChange={(e) => handleUpdateSetting('twilioAccountSid', e.target.value)}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                      Twilio Auth Token *
                    </label>
                    <input
                      type="password"
                      value={settings.twilioAuthToken}
                      onChange={(e) => handleUpdateSetting('twilioAuthToken', e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                    Twilio From Phone Number (E.164 format)
                  </label>
                  <input
                    type="tel"
                    value={settings.twilioPhoneNumber}
                    onChange={(e) => handleUpdateSetting('twilioPhoneNumber', e.target.value)}
                    placeholder="+447700900192 or +15552345678"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Custom Webhook Fields */}
            {settings.smsProvider === 'custom_webhook' && (
              <div className="p-4 bg-stone-900 border border-stone-750 rounded-xl space-y-3 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                    Webhook Endpoint URL *
                  </label>
                  <input
                    type="url"
                    value={settings.webhookUrl}
                    onChange={(e) => handleUpdateSetting('webhookUrl', e.target.value)}
                    placeholder="https://hook.eu1.make.com/xxxxxxxxxxxx or Zapier Webhook"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">
                    Secret Key / Header Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={settings.webhookSecret}
                    onChange={(e) => handleUpdateSetting('webhookSecret', e.target.value)}
                    placeholder="Bearer secret-token-xyz"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              Save Gateway Configuration
            </button>
          </div>
        </div>
      )}

      {/* ------------------- SUBTAB 4: LIVE ACTIVITY & CARRIER TRANSMISSION LOGS ------------------- */}
      {activeSubTab === 'logs' && (
        <div className="p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Live Carrier Transmission Logs</span>
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Real-time log of dispatched SMS, auto-responders, and appointment reminders.
              </p>
            </div>
            <button
              type="button"
              onClick={clearGatewayLogs}
              className="text-[11px] text-stone-400 hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Activity Log</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              No message transmissions recorded yet. Dispatches will appear here in real-time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Payload Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-sans">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-800/40 transition">
                      <td className="py-3 px-3 text-[11px] text-stone-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-stone-800 text-stone-300">
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-200 font-medium font-mono text-[11px]">
                        {log.recipient}
                      </td>
                      <td className="py-3 px-3 text-stone-300 text-[11px] capitalize">
                        {log.eventType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            log.status === 'delivered'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : log.status === 'simulated'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {log.status === 'delivered' ? 'Delivered ✓' : log.status === 'simulated' ? 'Simulated ✓' : 'Failed ✕'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-400 text-[11px] max-w-xs truncate">
                        {log.payloadPreview}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
