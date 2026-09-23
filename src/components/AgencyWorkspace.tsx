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
  Inbox,
  Sparkles,
  Download,
  Upload,
  Copy,
  Check,
  Bell,
  CloudCheck,
  CloudOff,
  AlertCircle,
} from 'lucide-react';
import { ClinicInfo, AnnouncementBannerConfig } from '../types';
import { agencyDemoPresets } from '../data/presets';
import { colorPalettes } from '../data/colorPalettes';
import { ListsEditor } from './ListsEditor';
import { LeadsInbox } from './admin/LeadsInbox';
import { PracticeAudit } from './admin/PracticeAudit';
import { getStoredLeads } from '../data/leadsStore';

interface AgencyWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onResetDefault: () => void;
  syncStatus?: string;
  lastSaved?: string | null;
  hasSupabase?: boolean;
}

type TabType = 'inbox' | 'branding' | 'lists' | 'copy' | 'presets' | 'content' | 'seo' | 'audit';

export function AgencyWorkspace({
  isOpen,
  onClose,
  clinic,
  onUpdateClinic,
  onResetDefault,
  syncStatus = 'idle',
  lastSaved = null,
  hasSupabase = false,
}: AgencyWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [leadsCount, setLeadsCount] = useState<number>(() => getStoredLeads().length);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setLeadsCount(getStoredLeads().length);
    };
    window.addEventListener('leads_updated', handleUpdate);
    return () => window.removeEventListener('leads_updated', handleUpdate);
  }, []);

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

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[] = [
    { id: 'inbox', label: 'Demo Requests', icon: Inbox, badge: leadsCount > 0 ? leadsCount : undefined },
    { id: 'audit', label: 'Site checklist', icon: Sparkles },
    { id: 'branding', label: 'Theme & Colors', icon: Palette },
    { id: 'lists', label: 'Content & FAQs', icon: FileText },
    { id: 'copy', label: 'Site Copy', icon: FileText },
    { id: 'presets', label: 'Presets & Clone', icon: Globe },
    { id: 'content', label: 'Sections', icon: Layout },
    { id: 'seo', label: 'Clinic & Alerts', icon: Sliders },
  ];

  const handleExportBlueprint = () => {
    const jsonStr = JSON.stringify(clinic, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(clinic.name || 'clinic').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-blueprint.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(clinic, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (typeof parsed !== 'object' || !parsed) {
        setImportError('Invalid JSON format.');
        return;
      }
      onUpdateClinic({ ...clinic, ...parsed });
      setImportJsonText('');
      setImportError('');
      alert('Blueprint successfully imported!');
    } catch {
      setImportError('Failed to parse JSON. Please check syntax.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed === 'object' && parsed) {
          onUpdateClinic({ ...clinic, ...parsed });
          alert('Blueprint successfully loaded from file!');
        }
      } catch {
        alert('Could not parse imported JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const banner = clinic.announcementBanner || { enabled: false, message: '', variant: 'amber' };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-xl bg-stone-900 text-stone-100 h-full flex flex-col shadow-2xl border-l border-stone-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h2 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                {clinic.name || 'Noir Labs'} Admin
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                <span>{clinic.name || 'Private Practice'}</span>
                <span>•</span>
                <span className="text-emerald-400">
                  {hasSupabase ? (syncStatus === 'synced' ? '🟢 Cloud Synced' : '🔄 Syncing...') : '💾 Local Storage'}
                </span>
                {lastSaved && <span className="text-stone-500">Saved {lastSaved}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onResetDefault}
              className="p-1.5 text-stone-400 hover:text-amber-400 transition hover:bg-stone-800 rounded-lg text-xs flex items-center gap-1"
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white transition hover:bg-stone-800 rounded-lg"
              aria-label="Close suite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-stone-800 bg-stone-900/70 text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 flex items-center gap-1.5 border-b-2 transition ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-stone-800/40'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-stone-950 font-bold text-[10px] rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: INBOX & LEADS CRM */}
          {activeTab === 'inbox' && (
            <LeadsInbox clinicName={clinic.name || 'Clinic'} />
          )}

          {/* TAB 2: PRACTICE HEALTH AUDIT */}
          {activeTab === 'audit' && (
            <PracticeAudit clinic={clinic} hasSupabase={hasSupabase} syncStatus={syncStatus} />
          )}

          {/* TAB 3: THEME & BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Color Themes</h3>
                <p className="text-xs text-stone-400">Choose a proven luxury aesthetic.</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {Object.values(colorPalettes).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onUpdateClinic({ ...clinic, colorPalette: p.id })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        clinic.colorPalette === p.id
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                          : 'border-stone-800 bg-stone-850 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-stone-800"
                          style={{ backgroundColor: p.preview.primary }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-stone-800"
                          style={{ backgroundColor: p.preview.accent }}
                        />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-xs truncate">{p.name}</div>
                        <div className="text-[10px] text-stone-400">{p.tagline}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom CSS Hex Pickers */}
              <div className="p-4 bg-stone-800/40 border border-stone-800 rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-stone-300 flex items-center gap-1.5">
                  <Paintbrush className="w-3.5 h-3.5 text-emerald-400" /> Granular Hex Overrides
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Primary Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={primaryVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customPrimaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customPrimaryColor: e.target.value })}
                        className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Accent Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={accentVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customAccentColor: e.target.value })}
                        className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={accentVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customAccentColor: e.target.value })}
                        className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Page Canvas Bg</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={bgVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customBgColor: e.target.value })}
                        className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customBgColor: e.target.value })}
                        className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={textVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customTextColor: e.target.value })}
                        className="w-8 h-8 rounded border border-stone-700 bg-stone-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textVal}
                        onChange={(e) => onUpdateClinic({ ...clinic, customTextColor: e.target.value })}
                        className="w-20 bg-stone-900 border border-stone-700 px-2 py-1 rounded text-stone-200 text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Pairings */}
              <div>
                <h3 className="font-bold text-stone-200 text-base">Typography Pairings</h3>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    { id: 'classic-editorial', name: 'Playfair Display + Plus Jakarta', style: 'High-end clinical luxury' },
                    { id: 'modern-sans', name: 'Inter + Montserrat', style: 'Clinical, precise, corporate' },
                    { id: 'warm-editorial', name: 'Lora + Inter', style: 'Welcoming, human, empathetic' },
                    { id: 'bold-contemporary', name: 'Syne + Space Grotesk', style: 'Cutting-edge sports medicine' },
                    { id: 'refined-elegance', name: 'Cinzel + Plus Jakarta', style: 'Prestige private practice' },
                  ].map((fp) => (
                    <button
                      key={fp.id}
                      onClick={() => onUpdateClinic({ ...clinic, fontPairing: fp.id })}
                      className={`p-3 rounded-xl border text-left transition ${
                        (clinic.fontPairing || 'classic-editorial') === fp.id
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                          : 'border-stone-800 bg-stone-850 hover:border-stone-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-stone-100">{fp.name}</div>
                      <div className="text-[11px] text-stone-400">{fp.style}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LISTS & CLINICAL CONTENT */}
          {activeTab === 'lists' && (
            <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} />
          )}

          {/* TAB 5: COPY & HEADLINES */}
          {activeTab === 'copy' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Site Copy & Core Messaging</h3>
                <p className="text-xs text-stone-400">Modify live headlines and doctor bio copy.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Hero Badge</label>
                  <input
                    type="text"
                    value={clinic.heroBadge || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, heroBadge: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Hero Main Headline</label>
                  <textarea
                    rows={2}
                    value={clinic.heroTitle || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, heroTitle: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={clinic.heroSubtitle || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, heroSubtitle: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Lead Doctor Name</label>
                  <input
                    type="text"
                    value={clinic.doctorName || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, doctorName: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Doctor Credentials</label>
                  <input
                    type="text"
                    value={clinic.doctorCredentials || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, doctorCredentials: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Doctor Philosophy Quote</label>
                  <textarea
                    rows={3}
                    value={clinic.doctorQuote || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, doctorQuote: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRESETS & CLONE / BACKUP ENGINE */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-stone-200 text-base">Client Demonstration Profiles</h3>
                <p className="text-xs text-stone-400">1-click switch between target client niches.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(agencyDemoPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onUpdateClinic({ ...clinic, ...preset })}
                    className="p-4 bg-stone-800/60 border border-stone-700/80 rounded-xl text-left hover:border-emerald-500/60 transition group"
                  >
                    <div className="font-bold text-stone-100 group-hover:text-emerald-400 transition">
                      {preset.name}
                    </div>
                    <div className="text-xs text-stone-400">
                      {preset.city}, {preset.state || ''}
                    </div>
                  </button>
                ))}
              </div>

              {/* Blueprint Clone Engine */}
              <div className="p-4 bg-stone-800/40 border border-stone-700/80 rounded-xl space-y-4 mt-6">
                <div>
                  <h4 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" /> Blueprint Backup & Transfer Engine
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Download this clinic's complete profile or clone it into another deployment.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportBlueprint}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Blueprint (.json)
                  </button>
                  <button
                    onClick={handleCopyJson}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-stone-700 transition"
                  >
                    {jsonCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{jsonCopied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-stone-700/60">
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Import Blueprint from File or Paste JSON
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-stone-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-700 file:text-stone-200 hover:file:bg-stone-600 cursor-pointer mb-2"
                  />
                  <textarea
                    rows={2}
                    placeholder="Or paste JSON blueprint here..."
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {importError && <p className="text-xs text-red-400 mt-1">{importError}</p>}
                  {importJsonText && (
                    <button
                      onClick={handleImportJson}
                      className="mt-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Apply Pasted JSON
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: HOMEPAGE SECTIONS */}
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

          {/* TAB 8: CLINIC INFO & EMERGENCY ANNOUNCEMENT */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Emergency Alert Banner System */}
              <div className="p-4 bg-stone-800/60 border border-stone-700/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" /> Global Announcement / Alert Bar
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-stone-400">Broadcast</span>
                    <input
                      type="checkbox"
                      checked={banner.enabled}
                      onChange={(e) =>
                        onUpdateClinic({
                          ...clinic,
                          announcementBanner: { ...banner, enabled: e.target.checked },
                        })
                      }
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                  </label>
                </div>

                {banner.enabled && (
                  <div className="space-y-2 pt-2 border-t border-stone-700/60 text-xs">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Banner Message</label>
                      <input
                        type="text"
                        placeholder="e.g. Inclement Weather Alert: Practice closing at 3pm today."
                        value={banner.message}
                        onChange={(e) =>
                          onUpdateClinic({
                            ...clinic,
                            announcementBanner: { ...banner, message: e.target.value },
                          })
                        }
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-stone-400 mb-1">Badge Text</label>
                        <input
                          type="text"
                          placeholder="Notice / Urgent"
                          value={banner.badge || ''}
                          onChange={(e) =>
                            onUpdateClinic({
                              ...clinic,
                              announcementBanner: { ...banner, badge: e.target.value },
                            })
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-400 mb-1">Color Variant</label>
                        <select
                          value={banner.variant || 'amber'}
                          onChange={(e) =>
                            onUpdateClinic({
                              ...clinic,
                              announcementBanner: {
                                ...banner,
                                variant: e.target.value as AnnouncementBannerConfig['variant'],
                              },
                            })
                          }
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 cursor-pointer"
                        >
                          <option value="amber">Amber (Warning / Alert)</option>
                          <option value="rose">Rose (Emergency / Closed)</option>
                          <option value="emerald">Emerald (Announcement / Promo)</option>
                          <option value="indigo">Indigo (Information)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Clinic Logistics */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-200 text-base">Practice Logistics & Scheduling</h3>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Practice Name</label>
                  <input
                    type="text"
                    value={clinic.name || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, name: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Phone Number (Display)</label>
                  <input
                    type="text"
                    value={clinic.phone || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, phone: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Raw Phone (for tel: dialing)</label>
                  <input
                    type="text"
                    value={clinic.phoneRaw || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, phoneRaw: e.target.value })}
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
                  <label className="block text-xs text-stone-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={clinic.address || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, address: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">City, State / Region</label>
                    <input
                      type="text"
                      value={clinic.cityState || clinic.city || ''}
                      onChange={(e) =>
                        onUpdateClinic({ ...clinic, cityState: e.target.value, city: e.target.value })
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Postal / Zip Code</label>
                    <input
                      type="text"
                      value={clinic.zip || ''}
                      onChange={(e) => onUpdateClinic({ ...clinic, zip: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Weekday Hours</label>
                  <input
                    type="text"
                    value={clinic.hoursWeekday || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, hoursWeekday: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">Saturday Hours</label>
                  <input
                    type="text"
                    value={clinic.hoursSaturday || ''}
                    onChange={(e) => onUpdateClinic({ ...clinic, hoursSaturday: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-400 mb-1">External Booking URL (JaneApp / Calendly)</label>
                  <input
                    type="url"
                    placeholder="https://yourclinic.janeapp.com"
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Exam Price</label>
                    <input
                      type="text"
                      placeholder="$49 exam"
                      value={clinic.examFee || ''}
                      onChange={(e) => onUpdateClinic({ ...clinic, examFee: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Follow-up Price</label>
                    <input
                      type="text"
                      placeholder="$45 visit"
                      value={clinic.followUpFee || ''}
                      onChange={(e) => onUpdateClinic({ ...clinic, followUpFee: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin on</span>
          </span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded-lg transition cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
