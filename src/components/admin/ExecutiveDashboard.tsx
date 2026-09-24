import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  Inbox,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Globe,
  Sliders,
  ShieldCheck,
  Download,
  Eye,
  Bell,
  ArrowRight,
  TrendingUp,
  Settings2,
  Check,
} from 'lucide-react';
import { ClinicInfo } from '../../types';
import { getStoredLeads, saveLead, PatientLead } from '../../data/leadsStore';
import { resolvePalette } from '../../data/colorPalettes';

interface ExecutiveDashboardProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onNavigateTab: (tab: 'leads' | 'booking' | 'site' | 'setup', subTab?: string) => void;
  hasSupabase: boolean;
  syncStatus: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  clinic,
  onUpdateClinic,
  onNavigateTab,
  hasSupabase,
  syncStatus,
}) => {
  const [leads, setLeads] = useState<PatientLead[]>(() => getStoredLeads());
  const [testLeadAdded, setTestLeadAdded] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setLeads(getStoredLeads());
    };
    window.addEventListener('leads_updated', handleUpdate);
    return () => window.removeEventListener('leads_updated', handleUpdate);
  }, []);

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const currentPalette = resolvePalette(clinic.colorPalette);

  // Practice Setup & Health Calculation
  const checks = [
    Boolean(clinic.name && clinic.doctorName),
    Boolean(clinic.phone && clinic.address),
    Boolean(clinic.externalBookingUrl || clinic.bookingEmbedMode),
    Boolean(clinic.examFee),
    Boolean(clinic.seoTitle),
    Boolean(clinic.customConditions?.length || true),
  ];
  const passedCount = checks.filter(Boolean).length;
  const healthPercent = Math.round((passedCount / checks.length) * 100);

  const handleSimulateLead = () => {
    const mockNames = ['Sarah Mitchell', 'David Chen', 'Emily Watson', 'James Thorne', 'Elena Rossi'];
    const mockConditions = [
      'Lower Back & Sciatica',
      'Desk Posture & Neck Strain',
      'Shoulder Impingement',
      'Headaches & Migraines',
      'Athletic Runner Knee/Hip',
    ];
    const randName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randCond = mockConditions[Math.floor(Math.random() * mockConditions.length)];
    const randPhone = `(${Math.floor(100 + Math.random() * 900)}) 555-0${Math.floor(100 + Math.random() * 900)}`;

    saveLead({
      source: 'booking',
      name: randName,
      email: `${randName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: randPhone,
      condition: randCond,
      notes: `Prospective patient inquiry. Primary complaint: ${randCond}.`,
      clinicName: clinic.name || 'Clinic',
      status: 'new',
    });

    setTestLeadAdded(true);
    setTimeout(() => setTestLeadAdded(false), 2500);
  };

  const handleToggleBanner = () => {
    const current = clinic.announcementBanner || { enabled: false, message: '' };
    onUpdateClinic({
      ...clinic,
      announcementBanner: {
        ...current,
        enabled: !current.enabled,
        message: current.message || 'Notice: Accepting new patients this week. Early morning & evening slots available.',
        variant: current.variant || 'emerald',
      },
    });
  };

  const handleToggleBookingMode = () => {
    const currentMode = clinic.bookingEmbedMode || 'triage_request';
    const nextMode = currentMode === 'iframe' ? 'redirect' : currentMode === 'redirect' ? 'triage_request' : 'iframe';
    onUpdateClinic({
      ...clinic,
      bookingEmbedMode: nextMode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">Practice Executive Overview</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Real-time performance metrics and control panel for {clinic.name || 'Your Practice'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-left sm:text-right">
              <div className="text-xs font-bold text-emerald-400">{healthPercent}% Setup Health</div>
              <div className="text-[10px] text-stone-500 font-mono">
                {hasSupabase ? (syncStatus === 'synced' ? 'Supabase Synced' : 'Syncing...') : 'Local Database'}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Live Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Metric 1: Inbound Leads */}
          <button
            type="button"
            onClick={() => onNavigateTab('leads')}
            className="p-3 bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/40 rounded-xl text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium group-hover:text-emerald-400">Patient Inquiries</span>
              <Inbox className="w-3.5 h-3.5 text-stone-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-serif font-bold text-white tabular-nums">{leads.length}</span>
              {newLeadsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-stone-950">
                  +{newLeadsCount} new
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5 truncate">Click to view CRM</div>
          </button>

          {/* Metric 2: Booking Engine */}
          <button
            type="button"
            onClick={() => onNavigateTab('booking')}
            className="p-3 bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/40 rounded-xl text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium group-hover:text-emerald-400">Booking Engine</span>
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
            </div>
            <div className="text-xs font-bold text-stone-200 truncate capitalize">
              {clinic.bookingEmbedMode === 'iframe'
                ? 'Iframe Modal'
                : clinic.bookingEmbedMode === 'redirect'
                ? 'External Link'
                : '3-Step Triage'}
            </div>
            <div className="text-[10px] text-stone-500 truncate mt-0.5">
              {clinic.externalBookingUrl ? 'EHR Connected' : 'Website Forms'}
            </div>
          </button>

          {/* Metric 3: Active Theme */}
          <button
            type="button"
            onClick={() => onNavigateTab('site', 'branding')}
            className="p-3 bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/40 rounded-xl text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium group-hover:text-emerald-400">Visual Palette</span>
              <div
                className="w-3.5 h-3.5 rounded-full border border-stone-700"
                style={{ backgroundColor: currentPalette.preview.primary }}
              />
            </div>
            <div className="text-xs font-bold text-stone-200 truncate">{currentPalette.name}</div>
            <div className="text-[10px] text-stone-500 truncate mt-0.5 capitalize">
              {clinic.fontPairing?.replace(/-/g, ' ') || 'Editorial Style'}
            </div>
          </button>

          {/* Metric 4: Pricing */}
          <button
            type="button"
            onClick={() => onNavigateTab('site', 'lists')}
            className="p-3 bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/40 rounded-xl text-left transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-[11px] font-medium group-hover:text-emerald-400">Exam Fee</span>
              <span className="text-emerald-400 text-xs font-bold">$</span>
            </div>
            <div className="text-xs font-bold text-stone-200 truncate">
              {clinic.examFee || '$49 Initial Exam'}
            </div>
            <div className="text-[10px] text-stone-500 truncate mt-0.5">
              {clinic.followUpFee || '$45 Follow-up'}
            </div>
          </button>
        </div>
      </div>

      {/* Quick Operational Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-emerald-400" /> Operational Actions
          </h4>
          <span className="text-[11px] text-stone-500">Fast workflow shortcuts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Action 1: Simulate Lead */}
          <button
            type="button"
            onClick={handleSimulateLead}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              testLeadAdded
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-stone-850 hover:bg-stone-800 border-stone-800 text-stone-200 hover:border-stone-700'
            }`}
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-emerald-400" />
                <span>{testLeadAdded ? 'Test Inquiry Created!' : 'Simulate Patient Inquiry'}</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                Injects a realistic patient triage lead into the CRM.
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-500 shrink-0" />
          </button>

          {/* Action 2: Toggle Announcement Banner */}
          <button
            type="button"
            onClick={handleToggleBanner}
            className="p-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-left flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5 text-stone-200">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {clinic.announcementBanner?.enabled ? 'Disable Alert Banner' : 'Enable Top Alert Banner'}
                </span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                {clinic.announcementBanner?.enabled ? 'Active on website top' : 'Broadcast practice notices & hours'}
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                clinic.announcementBanner?.enabled ? 'bg-amber-400 animate-pulse' : 'bg-stone-600'
              }`}
            />
          </button>

          {/* Action 3: Switch Booking Embed Mode */}
          <button
            type="button"
            onClick={handleToggleBookingMode}
            className="p-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-left flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5 text-stone-200">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Toggle Booking Mode</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5 capitalize">
                Current: {clinic.bookingEmbedMode === 'iframe' ? 'Embedded Modal' : clinic.bookingEmbedMode === 'redirect' ? 'Direct Redirect' : '3-Step Form'}
              </div>
            </div>
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
          </button>

          {/* Action 4: Load Archetype */}
          <button
            type="button"
            onClick={() => onNavigateTab('setup', 'presets')}
            className="p-3 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-left flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5 text-stone-200">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Load Practice Archetype</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                Switch demo presets (Sports, Family, Luxury, Rehab).
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* Direct Content Section Navigator */}
      <div className="space-y-3 border-t border-stone-800 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" /> Content & Clinical Editors
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigateTab('site', 'lists')}
            className="p-2.5 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-800 flex items-center justify-between text-left transition cursor-pointer"
          >
            <div>
              <span className="font-medium text-stone-200 block">Trust Bar & Accreditation Badges</span>
              <span className="text-[11px] text-stone-500">Rating, certifications, visit guarantees</span>
            </div>
            <span className="text-emerald-400 text-xs font-semibold">Edit →</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('site', 'lists')}
            className="p-2.5 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-800 flex items-center justify-between text-left transition cursor-pointer"
          >
            <div>
              <span className="font-medium text-stone-200 block">Conditions & Diagnostic Protocols</span>
              <span className="text-[11px] text-stone-500">Symptoms, adjustments, visit arcs</span>
            </div>
            <span className="text-emerald-400 text-xs font-semibold">Edit →</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('site', 'lists')}
            className="p-2.5 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-800 flex items-center justify-between text-left transition cursor-pointer"
          >
            <div>
              <span className="font-medium text-stone-200 block">Care Contrast Matrix (Why Us)</span>
              <span className="text-[11px] text-stone-500">Side-by-side clinical comparison</span>
            </div>
            <span className="text-emerald-400 text-xs font-semibold">Edit →</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('site', 'lists')}
            className="p-2.5 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-800 flex items-center justify-between text-left transition cursor-pointer"
          >
            <div>
              <span className="font-medium text-stone-200 block">3-Phase Patient Journey Roadmap</span>
              <span className="text-[11px] text-stone-500">Discovery, relief, and discharge phases</span>
            </div>
            <span className="text-emerald-400 text-xs font-semibold">Edit →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
