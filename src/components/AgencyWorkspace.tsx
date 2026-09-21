import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Palette, 
  Layout, 
  Globe, 
  Sliders, 
  ShieldCheck, 
  ExternalLink,
  Smartphone,
  Eye,
  Check
} from 'lucide-react';
import { ClinicInfo } from '../types';
import { agencyDemoPresets } from '../data/presets';
import { colorPalettes } from '../data/colorPalettes';

interface AgencyWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onResetDefault: () => void;
}

export function AgencyWorkspace({
  isOpen,
  onClose,
  clinic,
  onUpdateClinic,
  onResetDefault,
}: AgencyWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'branding' | 'content' | 'seo' | 'pages'>('presets');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-stone-900 text-stone-100 h-full flex flex-col shadow-2xl border-l border-stone-800 overflow-hidden">
        
        {/* Workspace Header */}
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900/50 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 shrink-0 transition ${
              activeTab === 'presets'
                ? 'border-emerald-500 text-emerald-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Client Demos</span>
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 shrink-0 transition ${
              activeTab === 'branding'
                ? 'border-emerald-500 text-emerald-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Colors</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 shrink-0 transition ${
              activeTab === 'content'
                ? 'border-emerald-500 text-emerald-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Home Sections</span>
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 shrink-0 transition ${
              activeTab === 'seo'
                ? 'border-emerald-500 text-emerald-400 bg-stone-800/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Clinic Info</span>
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Instant Prospect Presets</h3>
                <p className="text-xs text-stone-400">Switch entire practice branding dynamically during sales calls.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {Object.entries(agencyDemoPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => onUpdateClinic({ ...clinic, ...preset })}
                    className="p-4 bg-stone-800/60 hover:bg-stone-800 border border-stone-700/80 hover:border-emerald-500/50 rounded-xl text-left transition flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-bold text-stone-100 group-hover:text-emerald-400 transition">
                        {preset.name}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">{preset.city}, {preset.country || 'EU'}</div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-stone-700/50 text-stone-300 rounded-md border border-stone-600 group-hover:border-emerald-500/30">
                      Load Preset
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Color Systems</h3>
                <p className="text-xs text-stone-400">Select standard agency palette configurations.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(colorPalettes).map(([paletteId, palette]) => (
                  <button
                    key={paletteId}
                    onClick={() => onUpdateClinic({ ...clinic, colorPalette: paletteId })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col gap-2 ${
                      clinic.colorPalette === paletteId 
                        ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300' 
                        : 'bg-stone-800/40 border-stone-700/80 text-stone-300 hover:border-stone-600'
                    }`}
                  >
                    <span className="text-xs font-bold">{palette.name}</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full border border-stone-600" style={{ backgroundColor: palette.preview.primary }} />
                      <div className="w-4 h-4 rounded-full border border-stone-600" style={{ backgroundColor: palette.preview.accent }} />
                      <div className="w-4 h-4 rounded-full border border-stone-600" style={{ backgroundColor: palette.preview.bg }} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-4">
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

          {/* TAB 3: CONTENT SECTIONS */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Homepage Section Visibility</h3>
                <p className="text-xs text-stone-400">Toggle sections on or off to tailor the sales presentation.</p>
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
                ].map(({ key, label }) => {
                  const isVisible = clinic[key as keyof ClinicInfo] !== false;
                  return (
                    <label
                      key={key}
                      className="flex items-center justify-between p-3 bg-stone-800/40 border border-stone-800 rounded-xl cursor-pointer hover:bg-stone-800/80 transition"
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

          {/* TAB 4: SEO & CLINIC DETAILS */}
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
                  <label className="block text-xs text-stone-400 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={clinic.city}
                    onChange={(e) => onUpdateClinic({ ...clinic, city: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Promo Offer Heading</label>
                  <input
                    type="text"
                    value={clinic.offerPriceText || '€49 New Patient Special'}
                    onChange={(e) => onUpdateClinic({ ...clinic, offerPriceText: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cmd+Shift+C Shortcut Active
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
