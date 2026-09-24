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
  Copy,
  Check,
  Bell,
  CloudCheck,
  AlertCircle,
  Calendar,
  Zap,
} from 'lucide-react';
import { ClinicInfo, AnnouncementBannerConfig } from '../types';
import { agencyDemoPresets } from '../data/presets';
import { colorPalettes, resolvePalette } from '../data/colorPalettes';
import { ListsEditor } from './ListsEditor';
import { LeadsInbox } from './admin/LeadsInbox';
import { PracticeAudit } from './admin/PracticeAudit';
import { BookingSettings } from './admin/BookingSettings';
import { ExecutiveDashboard } from './admin/ExecutiveDashboard';
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

type MainTabType = 'overview' | 'leads' | 'booking' | 'site' | 'setup';
type SiteSubTab = 'branding' | 'info' | 'lists' | 'copy' | 'sections' | 'seo';
type SetupSubTab = 'audit' | 'presets';

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
  const [mainTab, setMainTab] = useState<MainTabType>('overview');
  const [siteSubTab, setSiteSubTab] = useState<SiteSubTab>('branding');
  const [setupSubTab, setSetupSubTab] = useState<SetupSubTab>('audit');

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

  const currentPalette = resolvePalette(clinic.colorPalette);
  const hasCustomColors = Boolean(
    clinic.customPrimaryColor ||
    clinic.customAccentColor ||
    clinic.customBgColor ||
    clinic.customTextColor
  );
  const primaryVal = clinic.customPrimaryColor || currentPalette.preview.primary;
  const accentVal = clinic.customAccentColor || currentPalette.preview.accent;
  const bgVal = clinic.customBgColor || currentPalette.preview.bg;
  const textVal = clinic.customTextColor || currentPalette.variables['--theme-text'] || '#1C1917';

  const mainTabs: {
    id: MainTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: Layout, badge: 'Live' },
    { id: 'leads', label: 'Leads', icon: Inbox, badge: leadsCount > 0 ? leadsCount : undefined },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'site', label: 'Site', icon: Palette },
    { id: 'setup', label: 'Setup', icon: Sparkles },
  ];

  const siteSubTabs: {
    id: SiteSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'branding', label: 'Themes', icon: Palette },
    { id: 'info', label: 'Clinic Info', icon: Sliders },
    { id: 'lists', label: 'Content', icon: FileText },
    { id: 'copy', label: 'Copy', icon: FileText },
    { id: 'sections', label: 'Sections', icon: Layout },
    { id: 'seo', label: 'SEO & Alert', icon: Bell },
  ];

  const setupSubTabs: {
    id: SetupSubTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'audit', label: 'Checklist & Audit', icon: Sparkles },
    { id: 'presets', label: 'Presets & Backup', icon: Globe },
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
                <span className="text-emerald-400 font-medium">
                  {hasSupabase ? (syncStatus === 'synced' ? '🟢 Cloud Synced' : '🔄 Syncing...') : '💾 Local Storage'}
                </span>
                {lastSaved && <span className="text-stone-500">Saved {lastSaved}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onResetDefault}
              className="p-1.5 text-stone-400 hover:text-amber-400 transition hover:bg-stone-800 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white transition hover:bg-stone-800 rounded-lg cursor-pointer"
              aria-label="Close suite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary 5 Tab Strip */}
        <div className="grid grid-cols-5 border-b border-stone-800 bg-stone-950/80 text-xs font-semibold px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`py-3 px-1.5 sm:px-2 flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-stone-900 shadow-inner'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate text-[10px] sm:text-xs">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="hidden sm:inline ml-0.5 px-1.5 py-0.2 bg-emerald-500 text-stone-950 font-bold text-[10px] rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Sub-navigation for Site Design & Content */}
        {mainTab === 'site' && (
          <div className="flex border-b border-stone-800 bg-stone-900/90 text-xs font-medium overflow-x-auto no-scrollbar whitespace-nowrap px-3 py-1.5 gap-1.5">
            {siteSubTabs.map((sub) => {
              const Icon = sub.icon;
              const isActive = siteSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSiteSubTab(sub.id)}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Secondary Sub-navigation for Setup & Agency */}
        {mainTab === 'setup' && (
          <div className="flex border-b border-stone-800 bg-stone-900/90 text-xs font-medium overflow-x-auto no-scrollbar whitespace-nowrap px-3 py-1.5 gap-1.5">
            {setupSubTabs.map((sub) => {
              const Icon = sub.icon;
              const isActive = setupSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSetupSubTab(sub.id)}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB GROUP 0: EXECUTIVE PRACTICE OVERVIEW */}
          {mainTab === 'overview' && (
            <ExecutiveDashboard
              clinic={clinic}
              onUpdateClinic={onUpdateClinic}
              onNavigateTab={(tab, subTab) => {
                setMainTab(tab as MainTabType);
                if (tab === 'site' && subTab) setSiteSubTab(subTab as SiteSubTab);
                if (tab === 'setup' && subTab) setSetupSubTab(subTab as SetupSubTab);
              }}
              hasSupabase={hasSupabase}
              syncStatus={syncStatus}
            />
          )}

          {/* TAB GROUP 1: LEADS / REQUESTS INBOX */}
          {mainTab === 'leads' && (
            <LeadsInbox clinicName={clinic.name || 'Clinic'} />
          )}

          {/* TAB GROUP 2: EXTERNAL BOOKING SETTINGS */}
          {mainTab === 'booking' && (
            <BookingSettings />
          )}

          {/* TAB GROUP 3: SITE DESIGN & CONTENT */}
          {mainTab === 'site' && (
            <>
              {/* SUB: THEMES & BRANDING */}
              {siteSubTab === 'branding' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-stone-200 text-sm">Theme</h3>
                    <p className="text-xs text-stone-400">Select active color palette.</p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {Object.values(colorPalettes).map((p) => (
                        <button
                          key={p.id}
                          onClick={() =>
                            onUpdateClinic({
                              ...clinic,
                              colorPalette: p.id,
                              customPrimaryColor: undefined,
                              customAccentColor: undefined,
                              customBgColor: undefined,
                              customTextColor: undefined,
                            })
                          }
                          className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            clinic.colorPalette === p.id && !hasCustomColors
                              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/50'
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
                          <div>
                            <div className="font-medium text-xs text-stone-100">{p.name}</div>
                            <div className="text-[10px] text-stone-400 capitalize">{p.category || 'Theme'}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Hex Overrides */}
                  <div className="border-t border-stone-800 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-xs text-stone-200 flex items-center gap-1.5">
                          <Paintbrush className="w-3.5 h-3.5 text-emerald-400" /> Custom Hex Colors
                        </h4>
                        <p className="text-[11px] text-stone-400">Fine-tune brand colors directly.</p>
                      </div>
                      {hasCustomColors && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateClinic({
                              ...clinic,
                              customPrimaryColor: undefined,
                              customAccentColor: undefined,
                              customBgColor: undefined,
                              customTextColor: undefined,
                            })
                          }
                          className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Reset to palette
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-stone-400 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
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
                        <label className="block text-[11px] text-stone-400 mb-1">Accent / CTA</label>
                        <div className="flex items-center gap-2">
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
                        <label className="block text-[11px] text-stone-400 mb-1">Background</label>
                        <div className="flex items-center gap-2">
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
                        <div className="flex items-center gap-2">
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
                    <h3 className="font-semibold text-stone-200 text-sm">Font Pairings</h3>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {[
                        { id: 'classic-editorial', name: 'Playfair Display + Plus Jakarta', style: 'Serif / Sans' },
                        { id: 'modern-sans', name: 'Inter + Montserrat', style: 'Clean Sans' },
                        { id: 'warm-editorial', name: 'Lora + Inter', style: 'Editorial Serif' },
                        { id: 'bold-contemporary', name: 'Syne + Space Grotesk', style: 'Display Sans' },
                        { id: 'refined-elegance', name: 'Cinzel + Plus Jakarta', style: 'Formal Serif' },
                      ].map((fp) => (
                        <button
                          key={fp.id}
                          onClick={() => onUpdateClinic({ ...clinic, fontPairing: fp.id })}
                          className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                            (clinic.fontPairing || 'classic-editorial') === fp.id
                              ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                              : 'border-stone-800 bg-stone-850 hover:border-stone-700'
                          }`}
                        >
                          <div className="font-medium text-xs text-stone-100">{fp.name}</div>
                          <div className="text-[11px] text-stone-400">{fp.style}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB: CLINIC INFO & LOGISTICS */}
              {siteSubTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-stone-200 text-sm">Clinic Details & Logistics</h3>
                    <p className="text-xs text-stone-400">Core contact info, address, hours, and fees.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Clinic Name</label>
                      <input
                        type="text"
                        value={clinic.name || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, name: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={clinic.tagline || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, tagline: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Lead Doctor Name & Credentials</label>
                      <input
                        type="text"
                        value={clinic.doctorName || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, doctorName: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Phone (Display)</label>
                      <input
                        type="text"
                        value={clinic.phone || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, phone: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Phone (Dialing Format)</label>
                      <input
                        type="text"
                        value={clinic.phoneRaw || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, phoneRaw: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Email Address</label>
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
                        <label className="block text-xs text-stone-400 mb-1">City, State</label>
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

                    <div className="grid grid-cols-2 gap-2">
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
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Google Rating</label>
                        <input
                          type="text"
                          placeholder="4.9"
                          value={clinic.googleRating || ''}
                          onChange={(e) => onUpdateClinic({ ...clinic, googleRating: e.target.value })}
                          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Verified Review Count</label>
                        <input
                          type="text"
                          placeholder="140+"
                          value={clinic.googleReviewCount || ''}
                          onChange={(e) => onUpdateClinic({ ...clinic, googleReviewCount: e.target.value })}
                          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                        />
                      </div>
                    </div>

                    <div className="bg-stone-850 border border-stone-800 rounded-xl p-3 flex items-center justify-between">
                      <div className="pr-2">
                        <span className="text-xs font-semibold text-stone-200 block">Booking Integration</span>
                        <span className="text-[11px] text-stone-400">
                          {clinic.externalBookingUrl
                            ? `Connected (${clinic.bookingEmbedMode || 'iframe'} mode)`
                            : 'Using 3-step triage request'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMainTab('booking')}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline shrink-0 cursor-pointer"
                      >
                        Manage Settings →
                      </button>
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

              {/* SUB: CONTENT & LISTS (With Category Pill Navigation) */}
              {siteSubTab === 'lists' && (
                <ListsEditor clinic={clinic} onUpdateClinic={onUpdateClinic} />
              )}

              {/* SUB: COPY & HEADLINES */}
              {siteSubTab === 'copy' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-stone-200 text-sm">Site Copy</h3>
                    <p className="text-xs text-stone-400">Headlines and doctor profile text.</p>
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
                      <label className="block text-xs text-stone-400 mb-1">Hero Hook (Main Headline)</label>
                      <textarea
                        rows={2}
                        value={clinic.heroHook || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, heroHook: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Urgent Pain Line (Sub-hook)</label>
                      <input
                        type="text"
                        value={clinic.heroUrgentPain || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, heroUrgentPain: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Hero Subheadline</label>
                      <textarea
                        rows={2}
                        value={clinic.heroSubhead || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, heroSubhead: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Offer Main Value Prop</label>
                      <input
                        type="text"
                        value={clinic.offerTitle || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, offerTitle: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Offer Subtext / Urgency</label>
                      <input
                        type="text"
                        value={clinic.offerSubtext || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, offerSubtext: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Booking Button Text</label>
                      <input
                        type="text"
                        value={clinic.offerCtaText || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, offerCtaText: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Hero Trust Line</label>
                      <input
                        type="text"
                        value={clinic.heroTrustLine || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, heroTrustLine: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Doctor Bio</label>
                      <textarea
                        rows={3}
                        value={clinic.doctorBio || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, doctorBio: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Doctor Philosophy</label>
                      <textarea
                        rows={2}
                        value={clinic.doctorPhilosophy || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, doctorPhilosophy: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Guarantee Headline</label>
                      <input
                        type="text"
                        value={clinic.guaranteeTitle || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, guaranteeTitle: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Guarantee Description</label>
                      <textarea
                        rows={2}
                        value={clinic.guaranteeDesc || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, guaranteeDesc: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUB: SECTIONS & NAVIGATION */}
              {siteSubTab === 'sections' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-stone-200 text-sm">Sections & Navigation</h3>
                    <p className="text-xs text-stone-400">Toggle sections and pages on the website.</p>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {[
                      { key: 'showTrustBar', label: 'Ratings Bar' },
                      { key: 'showConditions', label: 'Conditions Treated' },
                      { key: 'showWhyUs', label: 'Why Choose Us' },
                      { key: 'showTheProcess', label: '3-Step Process' },
                      { key: 'showTheDoctor', label: 'Doctor Profile' },
                      { key: 'showPatients', label: 'Patient Reviews' },
                      { key: 'showTheClinic', label: 'Clinic Gallery' },
                      { key: 'showInsurancePayment', label: 'Insurance & Payment' },
                      { key: 'showFAQ', label: 'FAQs' },
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
                          className="flex items-center justify-between p-2.5 bg-stone-850 border border-stone-800 rounded-lg cursor-pointer hover:border-stone-700 transition"
                        >
                          <span className="text-xs text-stone-300">{label}</span>
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

              {/* SUB: SEO & EMERGENCY ANNOUNCEMENT */}
              {siteSubTab === 'seo' && (
                <div className="space-y-6">
                  {/* Emergency Alert Banner System */}
                  <div className="p-3.5 bg-stone-850 border border-stone-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-xs text-stone-200 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-amber-400" /> Announcement Banner
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-stone-400">Enabled</span>
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
                      <div className="space-y-2 pt-2 border-t border-stone-800 text-xs">
                        <div>
                          <label className="block text-[11px] text-stone-400 mb-1">Message</label>
                          <input
                            type="text"
                            placeholder="e.g. Holiday Notice: Clinic closed on Monday."
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
                            <label className="block text-[11px] text-stone-400 mb-1">Badge</label>
                            <input
                              type="text"
                              placeholder="Notice"
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
                            <label className="block text-[11px] text-stone-400 mb-1">Variant</label>
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
                              <option value="amber">Amber</option>
                              <option value="rose">Rose</option>
                              <option value="emerald">Emerald</option>
                              <option value="indigo">Indigo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEO Meta Tags */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-stone-200 text-sm">Search Engine Optimization</h3>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={clinic.seoTitle || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, seoTitle: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">SEO Description</label>
                      <textarea
                        rows={2}
                        value={clinic.seoDescription || ''}
                        onChange={(e) => onUpdateClinic({ ...clinic, seoDescription: e.target.value })}
                        className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB GROUP 4: SETUP & AGENCY */}
          {mainTab === 'setup' && (
            <>
              {/* SUB: PRACTICE CHECKLIST & AUDIT */}
              {setupSubTab === 'audit' && (
                <PracticeAudit clinic={clinic} hasSupabase={hasSupabase} syncStatus={syncStatus} />
              )}

              {/* SUB: PRESETS & BLUEPRINT BACKUP */}
              {setupSubTab === 'presets' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-stone-200 text-sm">Demo Practice Presets</h3>
                    <p className="text-xs text-stone-400">Load full practice archetypes in 1 click.</p>
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {Object.entries(agencyDemoPresets).map(([key, presetData]) => (
                        <button
                          key={key}
                          onClick={() => {
                            if (confirm(`Load "${presetData.name || key}" preset? This replaces current practice data.`)) {
                              onUpdateClinic({ ...clinic, ...presetData });
                            }
                          }}
                          className="p-3 bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 rounded-lg text-left transition group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-100 group-hover:text-emerald-400">
                              {presetData.name}
                            </span>
                            <span className="text-[10px] text-stone-500 bg-stone-800 px-1.5 py-0.5 rounded">
                              {presetData.cityState || presetData.city || 'Preset'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1">{presetData.tagline || 'Pre-configured practice theme & content'}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Export & Import */}
                  <div className="border-t border-stone-800 pt-4 space-y-3">
                    <h3 className="font-semibold text-stone-200 text-sm">Blueprint JSON Backup</h3>
                    <p className="text-xs text-stone-400">Save or transfer this clinic's complete settings.</p>

                    <div className="flex gap-2">
                      <button
                        onClick={handleExportBlueprint}
                        className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JSON</span>
                      </button>
                      <button
                        onClick={handleCopyJson}
                        className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {jsonCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{jsonCopied ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-stone-800">
                      <label className="block text-[11px] font-medium text-stone-300 mb-1">
                        Restore from JSON
                      </label>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="block w-full text-xs text-stone-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-stone-700 file:text-stone-200 hover:file:bg-stone-600 cursor-pointer mb-2"
                      />
                      <textarea
                        rows={2}
                        placeholder="Or paste JSON string here..."
                        value={importJsonText}
                        onChange={(e) => setImportJsonText(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      {importError && <p className="text-xs text-red-400 mt-1">{importError}</p>}
                      {importJsonText && (
                        <button
                          onClick={handleImportJson}
                          className="mt-2 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg cursor-pointer"
                        >
                          Apply JSON
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Unified Footer with explicit sync mental model */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            {hasSupabase ? (
              syncStatus === 'synced' ? (
                <>
                  <CloudCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-stone-300">
                    <strong className="text-emerald-400 font-semibold">Cloud Synced</strong> • PostgreSQL / Supabase connected
                  </span>
                </>
              ) : syncStatus === 'saving' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                  <span className="text-[11px] text-amber-300">Syncing to PostgreSQL / Supabase...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] text-stone-300">Cloud Sync Active</span>
                </>
              )
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="text-[11px] text-stone-400">
                  <strong className="text-stone-300 font-semibold">Local Storage</strong> • Saved in this browser (Multi-device team sync with Supabase)
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-medium px-3.5 py-1.5 rounded-lg border border-stone-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
