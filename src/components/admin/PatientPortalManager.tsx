import React, { useState } from 'react';
import { ClinicInfo, PatientPortalSettings } from '../../types';
import { getStoredLeads, findPatientAppointments, PatientLead } from '../../data/leadsStore';
import {
  ShieldCheck,
  CalendarCheck2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Search,
  AlertTriangle,
  RotateCcw,
  FileText,
  Clock,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  Smartphone,
  Info,
} from 'lucide-react';

interface PatientPortalManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const defaultPortalSettings: PatientPortalSettings = {
  enabled: true,
  pageTitle: 'Patient Portal & Itinerary',
  pageSubtitle: 'Manage your appointments, reschedule, or download medical receipts',
  welcomeMessage: 'Welcome to your private patient portal. Enter your unique Booking Reference Key provided during appointment scheduling.',
  allowSelfReschedule: true,
  allowSelfCancellation: true,
  allowReceiptDownload: true,
  allowExerciseGuides: true,
  cancellationNoticeHours: 24,
  showEmergencyBanner: true,
  emergencyBannerText: 'For sudden loss of bowel/bladder sensation, acute trauma, or progressive limb numbness, please contact emergency medical services immediately.',
  supportPhone: '+44 20 7946 0192',
  supportEmail: 'reception@vancehealth.co.uk',
  requirePhoneLast4: false,
};

export function PatientPortalManager({ clinic, onUpdateClinic }: PatientPortalManagerProps) {
  const portal = {
    ...defaultPortalSettings,
    ...(clinic.portalSettings || {}),
  };

  const [testRefInput, setTestRefInput] = useState('');
  const [testResult, setTestResult] = useState<PatientLead[] | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updatePortal = (patch: Partial<PatientPortalSettings>) => {
    onUpdateClinic({
      ...clinic,
      portalSettings: {
        ...portal,
        ...patch,
      },
    });
  };

  const handleTestLookup = () => {
    if (!testRefInput.trim()) {
      setTestResult(null);
      return;
    }
    const clean = testRefInput.trim().toUpperCase();
    const results = findPatientAppointments(clean);
    setTestResult(results);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Get demo leads from store
  const allLeads = getStoredLeads();
  const leadsWithPasskeys = allLeads.filter((l) => Boolean(l.id));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-400" />
              <span>Patient Portal Backend & Self-Service</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
              Live & Active
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Configure patient self-service rules, 24-hour rescheduling policies, insurance receipts, and test passkey lookups.
          </p>
        </div>

        <a
          href="/portal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-emerald-400 hover:text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition cursor-pointer shrink-0"
        >
          <span>Open Portal Live View</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 1. Passkey Lookup Simulator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-stone-200">Patient Lookup Simulator</h4>
          </div>
          <span className="text-[11px] text-stone-400">
            {leadsWithPasskeys.length} Active Records in Registry
          </span>
        </div>

        <p className="text-xs text-stone-400">
          Simulate what front-desk reception or patients see when entering their booking reference key.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Lock className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. VH-9428-K82X or patient email"
              value={testRefInput}
              onChange={(e) => setTestRefInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestLookup()}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 pl-9 pr-3 py-2 text-xs font-mono uppercase text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleTestLookup}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Lookup Record
          </button>
        </div>

        {/* Test Result Box */}
        {testResult !== null && (
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs">
            {testResult.length === 0 ? (
              <p className="text-red-400">No patient record found matching &quot;{testRefInput}&quot;.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-bold text-emerald-400">✓ Record Found ({testResult.length} visit):</p>
                {testResult.map((lead) => (
                  <div key={lead.id} className="p-2.5 rounded-lg bg-stone-850 border border-stone-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-white">{lead.name} <span className="text-stone-400 font-normal">({lead.email})</span></p>
                      <p className="text-stone-400 text-[11px]">
                        📅 {lead.date || 'TBD'} at {lead.time || '10:00 AM'} • {lead.practitionerName || 'Dr. Alistair Vance'}
                      </p>
                      <p className="text-stone-400 text-[11px]">
                        Focus: <span className="text-emerald-400 font-medium">{lead.condition || 'Consultation'}</span> • Passkey: <code className="text-stone-200 font-mono">{lead.id}</code>
                      </p>
                    </div>
                    <a
                      href={`/portal?ref=${encodeURIComponent(lead.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold flex items-center gap-1 self-start sm:self-center transition"
                    >
                      <span>Simulate Login</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Self-Service Feature Toggles */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
        <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Patient Self-Service Permissions</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Allow Rescheduling */}
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-stone-200">Self-Service Rescheduling</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Allows patients to select a new appointment slot online without calling front-desk.
              </p>
            </div>
            <input
              type="checkbox"
              checked={portal.allowSelfReschedule}
              onChange={(e) => updatePortal({ allowSelfReschedule: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-800 border-stone-700 cursor-pointer"
            />
          </div>

          {/* Allow Cancellations */}
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-stone-200">Self-Service Cancellation</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Allows patients to cancel visits. Enforces 24-hour policy deposit terms.
              </p>
            </div>
            <input
              type="checkbox"
              checked={portal.allowSelfCancellation}
              onChange={(e) => updatePortal({ allowSelfCancellation: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-800 border-stone-700 cursor-pointer"
            />
          </div>

          {/* Allow Printable Receipts */}
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-stone-200">Itemized Insurance Receipts</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Patients can download printable PDF/HTML receipts for private insurance claims.
              </p>
            </div>
            <input
              type="checkbox"
              checked={portal.allowReceiptDownload}
              onChange={(e) => updatePortal({ allowReceiptDownload: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-800 border-stone-700 cursor-pointer"
            />
          </div>

          {/* Exercise & Home Care Guides */}
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-stone-200">Rehab & Ergonomic Guides</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Displays downloadable post-adjustment posture and stretching guides in portal.
              </p>
            </div>
            <input
              type="checkbox"
              checked={portal.allowExerciseGuides}
              onChange={(e) => updatePortal({ allowExerciseGuides: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-800 border-stone-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Cancellation Notice Policy Window */}
        <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-stone-200">Cancellation Policy Notice Window</p>
            <p className="text-[11px] text-stone-400">
              Hours before visit where cancellations forfeit deposit or incur standard fee.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="72"
              value={portal.cancellationNoticeHours}
              onChange={(e) => updatePortal({ cancellationNoticeHours: parseInt(e.target.value) || 24 })}
              className="w-20 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs text-white font-bold text-center focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-xs text-stone-400 font-semibold">Hours</span>
          </div>
        </div>
      </div>

      {/* 3. Portal Copy & Emergency Banner Configuration */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
        <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Portal Content & Support Info</span>
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Portal Header Title
            </label>
            <input
              type="text"
              value={portal.pageTitle}
              onChange={(e) => updatePortal({ pageTitle: e.target.value })}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Portal Subtitle / Instructions
            </label>
            <input
              type="text"
              value={portal.pageSubtitle}
              onChange={(e) => updatePortal({ pageSubtitle: e.target.value })}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Support Reception Phone
              </label>
              <input
                type="text"
                value={portal.supportPhone || clinic.phone || ''}
                onChange={(e) => updatePortal({ supportPhone: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Support Reception Email
              </label>
              <input
                type="email"
                value={portal.supportEmail || clinic.email || ''}
                onChange={(e) => updatePortal({ supportEmail: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Emergency Banner Toggle & Text */}
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Emergency Red-Flag Warning Banner</span>
              </label>
              <input
                type="checkbox"
                checked={portal.showEmergencyBanner}
                onChange={(e) => updatePortal({ showEmergencyBanner: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-800 border-stone-700 cursor-pointer"
              />
            </div>
            {portal.showEmergencyBanner && (
              <textarea
                rows={2}
                value={portal.emergencyBannerText}
                onChange={(e) => updatePortal({ emergencyBannerText: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-850 p-2 text-xs text-stone-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Emergency triage notice..."
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. Active Demo Passkeys Reference Table */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Demo Passkeys for Testing</span>
          </h4>
          <span className="text-[11px] text-stone-400">Pre-Seeded Patients</span>
        </div>

        <p className="text-xs text-stone-400">
          Click any passkey to copy it, or click &quot;Open in Portal&quot; to test the patient view instantly.
        </p>

        <div className="divide-y divide-stone-800 border border-stone-800 rounded-xl overflow-hidden bg-stone-900">
          {leadsWithPasskeys.slice(0, 5).map((lead) => {
            const passkey = lead.id;
            return (
              <div key={lead.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-850 transition">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{lead.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                        {lead.status || 'Confirmed'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {lead.condition || 'Consultation'} • {lead.practitionerName || 'Dr. Vance'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(passkey)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer border border-stone-700"
                    title="Click to copy passkey"
                  >
                    <span>{passkey}</span>
                    {copiedKey === passkey ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-stone-400" />
                    )}
                  </button>

                  <a
                    href={`/portal?ref=${encodeURIComponent(passkey)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Open in Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
