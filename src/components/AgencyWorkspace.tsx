import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Palette,
  Layout,
  Globe,
  Sliders,
  ShieldCheck,
  Paintbrush,
  FileText,
} from 'lucide-react';
import { ClinicInfo } from '../types';
import { agencyDemoPresets } from '../data/presets';
import { colorPalettes } from '../data/colorPalettes';
import { ListsEditor } from './ListsEditor';

interface AgencyWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onResetDefault: () => void;
}

type TabType = 'branding' | 'copy' | 'lists' | 'presets' | 'content' | 'seo';

export function AgencyWorkspace({
  isOpen,
  onClose,
  clinic,
  onUpdateClinic,
  onResetDefault,
}: AgencyWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('branding');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const primaryVal = clinic.customPrimaryColor || '#059669';
  const accentVal = clinic.customAccentColor || '#10b981';
  const bgVal = clinic.customBgColor || '#f5f5f4';
  const textVal = clinic.customTextColor || '#1c1917';

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'branding', label: 'Theme & Colors', icon: Palette },
    { id: 'lists', label: 'FAQs & Conditions', icon: FileText },
    { id: 'copy', label: 'Site Copy & Text', icon: FileText },
    { id: 'presets', label: 'Client Demos', icon: Globe },
    { id: 'content', label: 'Sections', icon: Layout },
    { id: 'seo', label: 'Clinic Info', icon: Sliders },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-lg bg-stone-900 text-stone-100 h-full flex flex-col shadow-2xl border-l border-stone-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-bold text-lg text-white tracking-tight">Agency Command Suite</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetDefault}
              className="p-2 text-stone-400 hover:text-amber-400 transition hover:bg-stone-800 rounded-lg text-xs flex items-center gap-1"
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white transition hover:bg-stone-800 rounded-lg"
              aria-label="Close suite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-stone-800 bg-stone-900/50 text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 border-b-2 shrink-0 transition ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-stone-800/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-stone-200 text-base mb-1">Preset Themes</h3>
                <p className="text-xs text-stone-400 mb-3">
                  Select a base palette or build your own custom combination.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(colorPalettes).map(([paletteId, palette]) => (
                    <button
                      key={paletteId}
                      onClick={() => {
                        onUpdateClinic({
                          ...clinic,
                          colorPalette: paletteId,
                          customPrimaryColor: palette.variables['--color-primary'],
                          customAccentColor: palette.variables['--color-accent'],
                          customBgColor: palette.variables['--color-bg'],
                          customTextColor: palette.variables['--color-text'],
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-2 ${
                        clinic.colorPalette === paletteId
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                          : 'bg-stone-800/40 border-stone-700/80 text-stone-300 hover:border-stone-600'
                      }`}
                    >
                      <span className="text-xs font-bold truncate">{palette.name}</span>
                      <div className="flex gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-stone-600"
                          style={{ backgroundColor: palette.preview.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-stone-600"
                          style={{ backgroundColor: palette.preview.accent }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-stone-600"
                          style={{ backgroundColor: palette.preview.bg }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-stone-200 text-base">Custom Color Palette</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Primary Color', val: primaryVal, key: 'customPrimaryColor' as const },
                    { label: 'Accent Color', val: accentVal, key: 'customAccentColor' as const },
                    { label: 'Page Background', val: bgVal, key: 'customBgColor' as const },
                    { label: 'Text Color', val: textVal, key: 'customTextColor' as const },
                  ].map(({ label, val, key }) => (
                    <div key={key} className="p-3 bg-stone-800/50 border border-stone-700/80 rounded-xl space-y-2">
                      <label className="block text-xs font-semibold text-stone-300">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={val}
                          onChange={(e) => onUpdateClinic({ ...clinic, [key]: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-stone-600 bg-transparent cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => onUpdateClinic({ ...clinic, [key]: e.target.value })}
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-xs font-mono text-stone-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-3">
                <h4 className="font-semibold text-stone-300 text-xs uppercase tracking-wider">Font Pairing</h4>
                <select
                  value={clinic.fontPairing || 'classic-editorial'}
                  onChange={(e) => onUpdateClinic({ ...clinic, fontPairing: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="classic-editorial">Classic Editorial (Playfair + Plus Jakarta)</option>
                  <option value="modern-avant-garde">Modern Avant-Garde (Syne + Space Grotesk)</option>
                  <option value="serene-academic">Serene Academic (Lora + Inter)</option>
                  <option value="timeless-luxury">Timeless Luxury (Cinzel + Montserrat)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'copy' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Live Content & Copy</h3>
                <p className="text-xs text-stone-400">
                  Override hero headlines, badges, offers, and doctor profiles instantly.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Hero Badge Text</label>
                  <input
                    type="text"
                    value={clinic.heroBadge || ''}
                    placeholder="e.g. Rated #1 Private Clinic in Europe"
                    onChange={(e) => onUpdateClinic({ ...clinic, heroBadge: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Hero Title Heading</label>
                  <textarea
                    rows={2}
                    value={clinic.heroTitle || ''}
                    placeholder="Main headline on the homepage..."
                    onChange={(e) => onUpdateClinic({ ...clinic, heroTitle: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={clinic.heroSubtitle || ''}
                    placeholder="Sub-headline description..."
                    onChange={(e) => onUpdateClinic({ ...clinic, heroSubtitle: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Promo Offer Banner Text</label>
                  <input
                    type="text"
                    value={clinic.offerPriceText || ''}
                    placeholder="e.g. €49 New Patient Special"
                    onChange={(e) => onUpdateClinic({ ...clinic, offerPriceText: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="pt-3 border-t border-stone-800">
                  <label className="block text-xs text-stone-400 mb-1">Lead Specialist / Doctor Name</label>
                  <input
                    type="text"
                    value={clinic.doctorName || ''}
                    placeholder="e.g. Dr. Alistair Vance"
                    onChange={(e) => onUpdateClinic({ ...clinic, doctorName: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Specialist Title / Role</label>
                  <input
                    type="text"
                    value={clinic.doctorTitle || ''}
                    placeholder="e.g. Chief Medical Director"
                    onChange={(e) => onUpdateClinic({ ...clinic, doctorTitle: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lists' && (
            <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} />
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Instant Prospect Presets</h3>
                <p className="text-xs text-stone-400">Switch branding on a sales call.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-2">
                {Object.entries(agencyDemoPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onUpdateClinic({ ...clinic, ...preset })}
                    className="p-4 bg-stone-800/60 border border-stone-700/80 rounded-xl text-left hover:border-emerald-500/60 transition"
                  >
                    <div className="font-bold text-stone-100">{preset.name}</div>
                    <div className="text-xs text-stone-400">
                      {preset.city}, {preset.state || ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Homepage Section Visibility</h3>
                <p className="text-xs text-stone-400">Toggle sections and pages.</p>
              </div>
              <div className="space-y-2 pt-2">
                {[
                  { key: 'showTrustBar', label: 'Trust Bar & Ratings' },
                  { key: 'showConditions', label: 'Conditions & Symptom Selector' },
                  { key: 'showWhyUs', label: 'Why Us / Value Proposition' },
                  { key: 'showTheProcess', label: '3-Step Patient Process' },
                  { key: 'showTheDoctor', label: 'Doctor / Specialist Profile' },
                  { key: 'showPatients', label: 'Patient Reviews & Social Proof' },
                  { key: 'showTheClinic', label: 'Clinic Facility Gallery' },
                  { key: 'showInsurancePayment', label: 'Insurance & Payment Options' },
                  { key: 'showFAQ', label: 'Frequently Asked Questions' },
                  { key: 'showNavConditions', label: 'Page: Conditions' },
                  { key: 'showNavFirstVisit', label: 'Page: First Visit' },
                  { key: 'showNavAbout', label: 'Page: About' },
                  { key: 'showNavPricing', label: 'Page: Pricing' },
                  { key: 'showNavBlog', label: 'Page: Blog' },
                ].map(({ key, label }) => {
                  const isVisible = clinic[key as keyof ClinicInfo] !== false;
                  return (
                    <label
                      key={key}
                      className="flex items-center justify-between p-3 bg-stone-800/40 border border-stone-800 rounded-xl cursor-pointer hover:border-stone-700 transition"
                    >
                      <span className="text-xs font-medium text-stone-300">{label}</span>
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => onUpdateClinic({ ...clinic, [key]: e.target.checked })}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Clinic Contact Details</h3>
                <p className="text-xs text-stone-400">Update practice information on the fly.</p>
              </div>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Practice Name</label>
                  <input
                    type="text"
                    value={clinic.name}
                    onChange={(e) => onUpdateClinic({ ...clinic, name: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={clinic.phone}
                    onChange={(e) => onUpdateClinic({ ...clinic, phone: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={clinic.email || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, email: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={clinic.city}
                    onChange={(e) => onUpdateClinic({ ...clinic, city: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Trust: rating line</label>
                  <input
                    type="text"
                    value={clinic.trustRatingLabel || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, trustRatingLabel: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Trust: years line</label>
                  <input
                    type="text"
                    value={clinic.trustExperienceLabel || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, trustExperienceLabel: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Trust: patients line</label>
                  <input
                    type="text"
                    value={clinic.trustPatientsLabel || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, trustPatientsLabel: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Trust: rating subtext</label>
                  <input
                    type="text"
                    placeholder="Verified Patient Reviews"
                    value={(clinic as ClinicInfo & { trustRatingSub?: string }).trustRatingSub || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, trustRatingSub: e.target.value } as ClinicInfo)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Trust: years subtext</label>
                  <input
                    type="text"
                    placeholder="Clinical Excellence"
                    value={(clinic as ClinicInfo & { trustExperienceSub?: string }).trustExperienceSub || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, trustExperienceSub: e.target.value } as ClinicInfo)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Trust: patients subtext</label>
                  <input
                    type="text"
                    placeholder="Treated in this city"
                    value={(clinic as ClinicInfo & { trustPatientsSub?: string }).trustPatientsSub || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, trustPatientsSub: e.target.value } as ClinicInfo)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Google reviews URL</label>
                  <input
                    type="url"
                    placeholder="https://g.page/..."
                    value={clinic.reviewsUrl || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, reviewsUrl: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Address</label>
                  <input
                    type="text"
                    value={clinic.address || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, address: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={clinic.zip || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, zip: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Weekday hours</label>
                  <input
                    type="text"
                    value={clinic.hoursWeekday || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, hoursWeekday: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Saturday hours</label>
                  <input
                    type="text"
                    value={clinic.hoursSaturday || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, hoursSaturday: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Logo image URL</label>
                  <input
                    type="url"
                    value={clinic.logoImage || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, logoImage: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Clinic gallery URLs (one per line)</label>
                  <textarea
                    rows={3}
                    value={(clinic.clinicGallery || []).join('\n')}
                    onChange={(e) =>
                      onUpdateClinic({
                        ...clinic,
                        clinicGallery: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Booking link (Jane / Calendly)</label>
                  <input
                    type="url"
                    value={clinic.externalBookingUrl || ''}
                    onChange={(e) =>
                      onUpdateClinic({
                        ...clinic,
                        externalBookingUrl: e.target.value,
                        bookingMode: e.target.value ? 'external' : clinic.bookingMode,
                      })
                    }
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Offer headline</label>
                  <input
                    type="text"
                    value={clinic.offerHeadline || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, offerHeadline: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Offer button text</label>
                  <input
                    type="text"
                    value={clinic.offerCtaText || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, offerCtaText: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Exam price label</label>
                  <input
                    type="text"
                    placeholder="£65 exam"
                    value={clinic.examFee || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, examFee: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Follow-up price label</label>
                  <input
                    type="text"
                    placeholder="£45 visit"
                    value={clinic.followUpFee || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, followUpFee: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Total Control Active
          </span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded-lg transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
