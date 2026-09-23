import React, { useState } from 'react';
import {
  Calendar,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link2,
  ArrowRight,
  ShieldCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useClinic } from '../../data/ClinicContext';
import { BookingEmbedMode, BookingPlatformPreset } from '../../types';

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
    hint: 'Works both as an embedded modal iframe or as a direct redirect.'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    badge: 'Auto-Sync Google/Outlook',
    placeholder: 'https://calendly.com/your-clinic/initial-exam',
    exampleUrl: 'https://calendly.com',
    hint: 'Seamlessly embeds inside the website popup modal.'
  },
  {
    id: 'cliniko',
    name: 'Cliniko',
    badge: 'Popular in UK & Australia',
    placeholder: 'https://yourclinic.cliniko.com/bookings',
    exampleUrl: 'https://cliniko.com',
    hint: 'Ideal for allied health practices with multiple practitioners.'
  },
  {
    id: 'acuity',
    name: 'Acuity / Squarespace',
    badge: 'Payment & Intake',
    placeholder: 'https://yourclinic.as.me/schedule.php',
    exampleUrl: 'https://acuityscheduling.com',
    hint: 'Supports custom intake questions and instant deposit collection.'
  },
  {
    id: 'custom',
    name: 'Custom Portal / Webhook',
    badge: 'Any EHR System',
    placeholder: 'https://booking.yourclinic.com',
    exampleUrl: '',
    hint: 'Compatible with ChiroTouch, WriteUpp, Phorest, or internal portals.'
  }
];

export const BookingSettings: React.FC = () => {
  const { clinicData: clinic, updateClinic } = useClinic();
  const [testSuccess, setTestSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentUrl = clinic.externalBookingUrl || '';
  const currentMode: BookingEmbedMode = clinic.bookingEmbedMode || (currentUrl ? 'iframe' : 'triage_request');

  const detectPlatform = (url: string): BookingPlatformPreset => {
    const lower = url.toLowerCase();
    if (lower.includes('janeapp.com')) return 'jane';
    if (lower.includes('calendly.com')) return 'calendly';
    if (lower.includes('cliniko.com')) return 'cliniko';
    if (lower.includes('as.me') || lower.includes('acuityscheduling.com')) return 'acuity';
    return 'custom';
  };

  const detectedPlatform = detectPlatform(currentUrl);

  const handleUrlChange = (newUrl: string) => {
    updateClinic({
      ...clinic,
      externalBookingUrl: newUrl,
      bookingPlatformPreset: detectPlatform(newUrl),
    });
  };

  const handleModeChange = (mode: BookingEmbedMode) => {
    updateClinic({
      ...clinic,
      bookingEmbedMode: mode,
    });
  };

  const handleApplyPreset = (preset: PlatformPresetItem) => {
    // If the input is empty or just whitespace, fill in the starter placeholder
    if (!currentUrl || currentUrl.trim() === '') {
      updateClinic({
        ...clinic,
        externalBookingUrl: preset.placeholder,
        bookingPlatformPreset: preset.id,
        bookingEmbedMode: clinic.bookingEmbedMode || 'iframe',
      });
    } else {
      // Preserve existing live clinic URL, only associate the chosen platform preset
      updateClinic({
        ...clinic,
        bookingPlatformPreset: preset.id,
      });
    }
  };

  const isValidHttps = currentUrl.startsWith('https://') && currentUrl.length > 12;

  return (
    <div className="space-y-8 max-w-4xl text-stone-900">
      {/* Header Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Booking Integration Engine</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              External Booking & Calendar Integration
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Connect your clinic's existing management software (Jane App, Calendly, Cliniko, Acuity) and decide whether patients book inside an integrated popup modal or via seamless redirect.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUrl && (
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-xs font-semibold text-stone-700 shadow-sm transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                <span>Test Live Link</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 1. Quick Presets */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
          1. Choose Your Booking Platform
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {PLATFORM_PRESETS.map((p) => {
            const isSelected = detectedPlatform === p.id && Boolean(currentUrl);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-stone-900 text-sm">{p.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded inline-block mb-1.5">
                    {p.badge}
                  </span>
                  <p className="text-[11px] text-stone-500 leading-snug">{p.hint}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. External Booking URL Input */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
            2. External Booking System URL
          </label>
          {isValidHttps ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Valid HTTPS Link
            </span>
          ) : currentUrl ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertCircle className="w-3 h-3" />
              Must start with https://
            </span>
          ) : (
            <span className="text-[11px] text-stone-400">Optional (Leave blank to use on-site triage)</span>
          )}
        </div>

        <div className="relative">
          <Link2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="url"
            value={currentUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="e.g. https://apexchiro.janeapp.com"
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-stone-50/50"
          />
          {currentUrl && (
            <button
              type="button"
              onClick={() => handleUrlChange('')}
              className="absolute right-2.5 top-2.5 text-xs text-stone-400 hover:text-stone-700 px-2 py-1 rounded hover:bg-stone-100 transition"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-[11px] text-stone-500">
          Paste the direct link to your JaneApp clinic page, Calendly event type, Cliniko schedule, or Acuity booking page.
        </p>
      </div>

      {/* 3. Booking Experience Mode Toggle */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
          3. Patient Experience Mode
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Mode A: Integrated Modal Embed (iframe) */}
          <div
            onClick={() => handleModeChange('iframe')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              currentMode === 'iframe'
                ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Seamless Modal Embed (iframe)
                </h4>
                {currentMode === 'iframe' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Loads your live booking schedule <strong>directly inside a popup modal on your website</strong>. Patients never leave your domain, maximizing brand consistency and trust.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <span>Best for Calendly & Jane</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Mode B: Direct Redirect / Smart Handoff */}
          <div
            onClick={() => handleModeChange('redirect')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              currentMode === 'redirect'
                ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Direct Redirect / New Tab
                </h4>
                {currentMode === 'redirect' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Opens your external booking portal in a clean new tab or redirects the patient directly, passing their pre-filled info so they can finalize their time slot.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] font-semibold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
              <span>Fastest Direct Handoff</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Mode C: 3-Step Triage & Callback Request */}
          <div
            onClick={() => handleModeChange('triage_request')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              currentMode === 'triage_request'
                ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-700 shadow-sm'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  3-Step On-Site Triage
                </h4>
                {currentMode === 'triage_request' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Uses our high-converting 3-step intake form (Symptom → Time Window → Contact Info). Captures the lead directly in your Requests inbox for front-desk confirmation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <span>Zero Tech Required</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Test & Preview Simulator */}
      {currentUrl && (
        <div className="border border-stone-200 bg-stone-50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-stone-700" />
              <span className="font-bold text-xs uppercase tracking-wider text-stone-800">
                Live Embed Test ({currentMode.toUpperCase()})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
            >
              {previewOpen ? 'Hide Embed Preview' : 'Show Live Iframe Preview'}
            </button>
          </div>

          {previewOpen && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-inner">
              <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span className="truncate max-w-md">{currentUrl}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {currentMode === 'iframe' ? 'Modal Iframe Mode' : 'Direct Link Mode'}
                </span>
              </div>
              <div className="h-[420px] w-full bg-stone-50 flex items-center justify-center relative">
                <iframe
                  src={currentUrl}
                  title="Live Booking Schedule Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance / Security Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-stone-900">Security & Patient Privacy:</strong> Both Jane App and Calendly use SSL/TLS encryption. Embedding via modal keeps patient communication secure and preserves your clinic's domain authority while letting your EHR handle HIPAA/GDPR health charts.
        </div>
      </div>
    </div>
  );
};
