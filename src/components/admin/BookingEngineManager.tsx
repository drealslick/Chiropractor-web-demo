import React, { useState } from 'react';
import {
  Calendar,
  Link2,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { ClinicInfo, BookingEmbedMode, BookingPlatformPreset } from '../../types';

interface BookingEngineManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onNavigateTab?: (tab: 'leads' | 'booking' | 'site' | 'setup') => void;
}

interface PlatformPresetItem {
  id: BookingPlatformPreset;
  name: string;
  badge: string;
  placeholder: string;
  exampleUrl: string;
  hint: string;
}

const PLATFORM_PRESETS: PlatformPresetItem[] = [
  {
    id: 'jane',
    name: 'Jane App',
    badge: 'Most Popular for Clinics',
    placeholder: 'https://yourclinic.janeapp.com',
    exampleUrl: 'https://demo.janeapp.com',
    hint: 'Embeds smoothly inside a modal or redirects to your Jane booking portal.',
  },
  {
    id: 'cliniko',
    name: 'Cliniko',
    badge: 'Popular in UK & Australia',
    placeholder: 'https://yourclinic.cliniko.com/bookings',
    exampleUrl: 'https://demo.cliniko.com/bookings',
    hint: 'Integrates with multi-practitioner Allied Health schedules.',
  },
  {
    id: 'calendly',
    name: 'Calendly',
    badge: 'Google & Outlook Sync',
    placeholder: 'https://calendly.com/your-clinic/initial-exam',
    exampleUrl: 'https://calendly.com',
    hint: 'Direct schedule synchronization with personal Google/Outlook calendars.',
  },
  {
    id: 'acuity',
    name: 'Acuity / Squarespace',
    badge: 'Deposit & Intake',
    placeholder: 'https://yourclinic.as.me/schedule.php',
    exampleUrl: 'https://acuityscheduling.com',
    hint: 'Collects initial exam deposits and custom health questionnaires.',
  },
  {
    id: 'custom',
    name: 'Custom EHR / Webhook',
    badge: 'ChiroTouch / WriteUpp',
    placeholder: 'https://booking.yourclinic.com',
    exampleUrl: '',
    hint: 'Custom EHR portal URL for enterprise patient management.',
  },
];

export const BookingEngineManager: React.FC<BookingEngineManagerProps> = ({
  clinic,
  onUpdateClinic,
  onNavigateTab,
}) => {
  const isExternalSync = clinic.bookingEmbedMode === 'iframe' || clinic.bookingEmbedMode === 'redirect';
  const currentUrl = clinic.externalBookingUrl || '';
  const currentPreset: BookingPlatformPreset = clinic.bookingPlatformPreset || 'jane';

  const [inputUrl, setInputUrl] = useState(currentUrl || 'https://demo.janeapp.com');
  const [selectedPreset, setSelectedPreset] = useState<BookingPlatformPreset>(currentPreset);
  const [copiedLink, setCopiedLink] = useState(false);

  const activePresetInfo = PLATFORM_PRESETS.find((p) => p.id === selectedPreset) || PLATFORM_PRESETS[0];

  const handleSelectMode1 = () => {
    onUpdateClinic({
      ...clinic,
      bookingEmbedMode: 'triage_request',
    });
  };

  const handleSelectMode2 = () => {
    onUpdateClinic({
      ...clinic,
      bookingEmbedMode: 'iframe',
      externalBookingUrl: clinic.externalBookingUrl || activePresetInfo.placeholder,
      bookingPlatformPreset: selectedPreset,
    });
  };

  const handleSaveExternalConfig = (newUrl: string, preset: BookingPlatformPreset, embedMode: BookingEmbedMode) => {
    onUpdateClinic({
      ...clinic,
      bookingEmbedMode: embedMode,
      externalBookingUrl: newUrl,
      bookingPlatformPreset: preset,
    });
  };

  const handlePresetSelect = (preset: PlatformPresetItem) => {
    setSelectedPreset(preset.id);
    const newUrl = inputUrl && inputUrl !== 'https://demo.janeapp.com' ? inputUrl : preset.placeholder;
    setInputUrl(newUrl);
    handleSaveExternalConfig(newUrl, preset.id, clinic.bookingEmbedMode || 'iframe');
  };

  const handleCopyLink = () => {
    if (inputUrl) {
      navigator.clipboard.writeText(inputUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Booking Engine Architecture</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isExternalSync
                    ? 'bg-sky-950 text-sky-300 border border-sky-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {isExternalSync ? 'Mode 2: External Sync Active' : 'Mode 1: On-Site Triage Active'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Choose how patients schedule appointments and how your staff dashboard dynamically responds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-mono bg-stone-850 px-2.5 py-1 rounded-lg border border-stone-750">
              Live Config
            </span>
          </div>
        </div>

        {/* Dynamic Mode Switcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {/* Card 1: Mode 1 - On-Site Triage (Built-in) */}
          <div
            onClick={handleSelectMode1}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              !isExternalSync
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                : 'bg-stone-850 hover:bg-stone-800/80 border-stone-800 hover:border-stone-700 opacity-80 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Mode 1 • All-in-One
                </span>
                {!isExternalSync && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>On-Site Triage & Built-in Scheduling</span>
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                The receptionist runs the entire practice through this website. Includes vertical Day View with doctor columns, drag-and-drop slots, waitlist, and availability rules.
              </p>

              <div className="mt-3 p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] space-y-1 text-stone-300">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Enables: Booking & EHR, Day View, Doctor Columns, Waitlist</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Check className="w-3.5 h-3.5 text-stone-500" />
                  <span>Receptionist dashboard is full-service command center</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">
                {!isExternalSync ? '● Active Engine' : 'Click to Activate Mode 1'}
              </span>
              {!isExternalSync && onNavigateTab && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTab('booking');
                  }}
                  className="text-xs text-stone-300 hover:text-white underline font-medium"
                >
                  Open Day Calendar →
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Mode 2 - External Sync (Jane / Cliniko / Calendly) */}
          <div
            onClick={handleSelectMode2}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              isExternalSync
                ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                : 'bg-stone-850 hover:bg-stone-800/80 border-stone-800 hover:border-stone-700 opacity-80 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-800">
                  Mode 2 • External EHR
                </span>
                {isExternalSync && (
                  <span className="w-5 h-5 rounded-full bg-sky-400 text-stone-950 flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-sky-400" />
                <span>External Sync (Jane, Cliniko, Calendly)</span>
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Connects to your existing practice software. Hides internal calendar and availability rules to eliminate staff confusion while preserving website Contact Us inquiries.
              </p>

              <div className="mt-3 p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] space-y-1 text-stone-300">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Hides: Booking & EHR, availability rules, empty calendars</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Check className="w-3.5 h-3.5 text-sky-400" />
                  <span>Direct Launch card: Opens Jane/Cliniko dashboard in 1 click</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Keeps: Patient Inquiries inbox for website contact questions</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">
                {isExternalSync ? '● Active Engine' : 'Click to Activate Mode 2'}
              </span>
              {isExternalSync && (
                <span className="text-xs text-sky-300 font-medium">
                  {activePresetInfo.name} Connected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* External Sync Configuration Section (Shown when Mode 2 is active or being configured) */}
      {isExternalSync && (
        <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-5 animate-fade-in shadow-xs">
          <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-sky-400" />
                <span>External EHR Software Setup</span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Configure which EHR system your practice uses and how patients access your booking link.
              </p>
            </div>

            <a
              href={inputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition self-start sm:self-auto cursor-pointer"
            >
              <span>Launch {activePresetInfo.name} ↗</span>
            </a>
          </div>

          {/* Platform Preset Cards */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              1. Choose Your EHR Platform:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PLATFORM_PRESETS.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-500 text-white shadow-xs'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs truncate">{p.name}</div>
                      <div className="text-[10px] text-stone-400 truncate mt-0.5">{p.badge}</div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-sky-400 mt-2 block">✓ Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking URL Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              2. Your Clinic's Booking URL / Portal Link:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder={activePresetInfo.placeholder}
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    handleSaveExternalConfig(e.target.value, selectedPreset, clinic.bookingEmbedMode || 'iframe');
                  }}
                  className="w-full bg-stone-900 border border-stone-750 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <a
                  href={inputUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Test URL</span>
                </a>
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              {activePresetInfo.hint}
            </p>
          </div>

          {/* Embed Mode: Modal Iframe vs Direct Redirect */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              3. Patient Interaction on Website:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  handleSaveExternalConfig(inputUrl, selectedPreset, 'iframe')
                }
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  clinic.bookingEmbedMode === 'iframe'
                    ? 'bg-sky-950/70 border-sky-500 text-white shadow-xs'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-stone-200">
                    Option A: Embedded Modal (Recommended)
                  </span>
                  {clinic.bookingEmbedMode === 'iframe' && (
                    <span className="text-[10px] font-bold text-sky-400">✓ Selected</span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Patient stays on your website; your {activePresetInfo.name} scheduler opens in a sleek popup modal.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSaveExternalConfig(inputUrl, selectedPreset, 'redirect')
                }
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  clinic.bookingEmbedMode === 'redirect'
                    ? 'bg-sky-950/70 border-sky-500 text-white shadow-xs'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-stone-200">
                    Option B: Direct Redirect
                  </span>
                  {clinic.bookingEmbedMode === 'redirect' && (
                    <span className="text-[10px] font-bold text-sky-400">✓ Selected</span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Clicking "Book Appointment" forwards the patient straight to your {activePresetInfo.name} subdomain in a new tab.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
