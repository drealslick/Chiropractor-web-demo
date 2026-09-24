import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  Plus,
  Clock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Layers,
  Archive,
  RefreshCw,
  Palette,
  Building2,
  Zap,
  Tag,
  FileCode,
  FileCheck,
  Info,
  X,
} from 'lucide-react';
import { ClinicInfo } from '../../types';
import { agencyDemoPresets } from '../../data/presets';
import { resolvePalette } from '../../data/colorPalettes';

interface PresetBackupManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export interface ClinicSnapshot {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  formattedDate: string;
  clinicName: string;
  doctorName?: string;
  colorPalette: string;
  cityState?: string;
  blogPostsCount: number;
  data: ClinicInfo;
}

export interface StarterTemplate {
  id: string;
  name: string;
  tagline?: string;
  cityState?: string;
  colorPalette?: string;
  isCustom?: boolean;
  data: Partial<ClinicInfo>;
}

// Backward-compatibility alias
export type PracticeArchetype = StarterTemplate;

const STORAGE_SNAPSHOTS_KEY = 'clinic_site_snapshots_v1';
const STORAGE_TEMPLATES_KEY = 'clinic_custom_archetypes_v1';

// Convert factory agencyDemoPresets to initial array of starter templates
const getFactoryTemplates = (): StarterTemplate[] => {
  return Object.entries(agencyDemoPresets).map(([key, data]) => ({
    id: key,
    name: data.name || key,
    tagline: data.tagline,
    cityState: data.cityState || `${data.city || ''}, ${data.state || ''}`.replace(/^, |, $/g, ''),
    colorPalette: data.colorPalette,
    isCustom: false,
    data,
  }));
};

export const PresetBackupManager: React.FC<PresetBackupManagerProps> = ({
  clinic,
  onUpdateClinic,
}) => {
  // 1. Snapshots State (Live Rollback Savers)
  const [snapshots, setSnapshots] = useState<ClinicSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SNAPSHOTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // 2. Starter Templates State (Deletable!)
  const [templates, setTemplates] = useState<StarterTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TEMPLATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return getFactoryTemplates();
  });

  // Safety confirmation modal state for Applying a Template
  const [templateToApply, setTemplateToApply] = useState<StarterTemplate | null>(null);

  // Safety confirmation modal state for Redeploying a Snapshot
  const [snapshotToRedeploy, setSnapshotToRedeploy] = useState<ClinicSnapshot | null>(null);

  // Form state for creating a new snapshot
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotNote, setSnapshotNote] = useState('');

  // Form state for saving current site as a reusable starter template
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateTagline, setTemplateTagline] = useState('');

  // Site Data Export/Import state (Plain English for clinic owners, JSON for developers)
  const [jsonCopied, setJsonCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync snapshots to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SNAPSHOTS_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.error('Failed to save snapshots to localStorage', e);
    }
  }, [snapshots]);

  // Sync templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to save templates to localStorage', e);
    }
  }, [templates]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // --- Real-time JSON Paste Validation ---
  const jsonValidation = useMemo(() => {
    const trimmed = importJsonText.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return {
          isValid: false,
          error: 'Data must be a valid key-value configuration object (not an array or plain text).',
          data: null,
        };
      }

      const keys = Object.keys(parsed);
      if (keys.length === 0) {
        return {
          isValid: false,
          error: 'JSON object is empty. Please provide a valid site configuration.',
          data: null,
        };
      }

      const clinicName = parsed.name || parsed.clinicName || '';
      const doctorName = parsed.doctorName || '';
      const hasRecognizedField = keys.some((k) =>
        ['name', 'tagline', 'phone', 'email', 'colorPalette', 'doctorName', 'services', 'customPosts'].includes(k)
      );

      return {
        isValid: true,
        error: null,
        keyCount: keys.length,
        clinicName,
        doctorName,
        hasRecognizedField,
        data: parsed,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
      return {
        isValid: false,
        error: msg,
        data: null,
      };
    }
  }, [importJsonText]);

  // Helper to create a snapshot
  const createSnapshotRecord = (name: string, description?: string): ClinicSnapshot => {
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      createdAt: now.toISOString(),
      formattedDate,
      clinicName: clinic.name || 'Untitled Practice',
      doctorName: clinic.doctorName,
      colorPalette: clinic.colorPalette || 'bone-charcoal',
      cityState: clinic.cityState || clinic.city || '',
      blogPostsCount: clinic.customPosts ? clinic.customPosts.length : 4,
      data: JSON.parse(JSON.stringify(clinic)), // deep clone
    };
  };

  // --- Snapshot Management ---
  const handleSaveCurrentSnapshot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const finalName = snapshotName.trim() || `Snapshot – ${formattedDate}`;
    const newSnapshot = createSnapshotRecord(finalName, snapshotNote.trim() || undefined);

    setSnapshots([newSnapshot, ...snapshots]);
    setSnapshotName('');
    setSnapshotNote('');
    setIsCreatingSnapshot(false);
    showNotification(`Saved snapshot "${newSnapshot.name}". You can redeploy to this state anytime.`);
  };

  const handleConfirmRedeploySnapshot = () => {
    if (!snapshotToRedeploy) return;
    onUpdateClinic({ ...snapshotToRedeploy.data });
    showNotification(`Site successfully redeployed to "${snapshotToRedeploy.name}"!`);
    setSnapshotToRedeploy(null);
  };

  const handleDeleteSnapshot = (id: string, name: string) => {
    if (window.confirm(`Delete snapshot "${name}"? This action cannot be undone.`)) {
      setSnapshots(snapshots.filter((s) => s.id !== id));
      showNotification(`Deleted snapshot "${name}".`);
    }
  };

  const handleExportSingleSnapshot = (snap: ClinicSnapshot) => {
    const jsonStr = JSON.stringify(snap.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-site-backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Starter Template Management & Safety Confirmation ---
  const handleInitiateApplyTemplate = (template: StarterTemplate) => {
    setTemplateToApply(template);
  };

  // Action 1: Save Snapshot First, then Apply
  const handleSaveSnapshotAndApplyTemplate = () => {
    if (!templateToApply) return;
    const now = new Date();
    const autoSnapName = `Auto-Backup before applying ${templateToApply.name}`;
    const autoSnapshot = createSnapshotRecord(
      autoSnapName,
      `Automatic safety backup captured before applying the "${templateToApply.name}" starter template on ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    );
    setSnapshots([autoSnapshot, ...snapshots]);

    onUpdateClinic({ ...clinic, ...templateToApply.data });
    showNotification(`Snapshot saved and "${templateToApply.name}" template applied!`);
    setTemplateToApply(null);
  };

  // Action 2: Apply Directly Without Saving Snapshot
  const handleApplyTemplateDirectly = () => {
    if (!templateToApply) return;
    onUpdateClinic({ ...clinic, ...templateToApply.data });
    showNotification(`Applied "${templateToApply.name}" template.`);
    setTemplateToApply(null);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from your starter templates library?`)) {
      setTemplates(templates.filter((t) => t.id !== id));
      showNotification(`Deleted "${name}" template.`);
    }
  };

  const handleRestoreDefaultTemplates = () => {
    if (window.confirm('Restore all factory starter templates (Austin, Denver, Preston, etc.)?')) {
      const factory = getFactoryTemplates();
      setTemplates(factory);
      showNotification('Restored all factory starter templates.');
    }
  };

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = templateName.trim() || `${clinic.name || 'Practice'} Template`;
    const newTemplate: StarterTemplate = {
      id: `custom_template_${Date.now()}`,
      name: finalName,
      tagline: templateTagline.trim() || clinic.tagline || 'Custom starter template',
      cityState: clinic.cityState || clinic.city || '',
      colorPalette: clinic.colorPalette,
      isCustom: true,
      data: JSON.parse(JSON.stringify(clinic)),
    };
    setTemplates([newTemplate, ...templates]);
    setTemplateName('');
    setTemplateTagline('');
    setIsCreatingTemplate(false);
    showNotification(`Saved "${finalName}" to starter templates library.`);
  };

  // --- Export Site Data & File Backup (Plain English for clinic owners) ---
  const handleExportSiteData = () => {
    const jsonStr = JSON.stringify(clinic, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(clinic.name || 'clinic').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-site-backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Downloaded site data backup (.json).');
  };

  const handleCopySiteData = () => {
    navigator.clipboard.writeText(JSON.stringify(clinic, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
    showNotification('Copied site data to clipboard.');
  };

  const handleFormatJson = () => {
    if (jsonValidation?.isValid && jsonValidation.data) {
      setImportJsonText(JSON.stringify(jsonValidation.data, null, 2));
      showNotification('Formatted JSON data.');
    }
  };

  const handleImportJson = () => {
    if (!jsonValidation?.isValid || !jsonValidation.data) {
      return;
    }
    onUpdateClinic({ ...clinic, ...jsonValidation.data });
    setImportJsonText('');
    showNotification('Site data successfully applied and site redeployed!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed === 'object' && parsed && !Array.isArray(parsed)) {
          onUpdateClinic({ ...clinic, ...parsed });
          showNotification('Site backup successfully loaded from file!');
        } else {
          alert('Could not import file: File contents must be a valid site data JSON object.');
        }
      } catch {
        alert('Could not parse imported file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
              : 'bg-red-950/90 border-red-500/80 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-stone-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
              <Archive className="w-5 h-5 text-emerald-400" />
              <span>Snapshots, Backups & Starter Templates</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Save current site versions to safely redeploy anytime major changes occur, manage starter templates, or export data backups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreatingSnapshot(!isCreatingSnapshot);
                if (!isCreatingSnapshot) {
                  const now = new Date();
                  setSnapshotName(`Backup – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                }
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-900/30"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>{isCreatingSnapshot ? 'Cancel' : 'Save Current Site Snapshot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Creation Card (Expandable) */}
      {isCreatingSnapshot && (
        <form
          onSubmit={handleSaveCurrentSnapshot}
          className="p-4 sm:p-5 bg-stone-900 border border-emerald-500/50 rounded-2xl space-y-4 animate-fade-in shadow-xl shadow-black/40"
        >
          <div className="flex items-center justify-between border-b border-stone-850 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Create Live Site Snapshot
              </h4>
            </div>
            <span className="text-[11px] text-stone-400">Captures entire site state</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Snapshot Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="e.g. Pre-Redesign Backup, Summer Pricing Update"
                className="w-full bg-stone-950 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Notes / Change Description (Optional)
              </label>
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder="e.g. Updated clinician bio and active insurance list"
                className="w-full bg-stone-950 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl text-[11px] text-stone-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-stone-200 font-semibold">What will be saved:</span> All pages,
              homepage sections, colors ({clinic.colorPalette}), typography, team members, blog
              articles ({clinic.customPosts?.length ?? 4} posts), insurance partners, and SEO meta tags.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingSnapshot(false)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-medium rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Store Snapshot</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 1: SAVED SITE SNAPSHOTS (THE SAVER) */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div>
            <h4 className="font-bold text-xs text-stone-200 uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Saved Site Snapshots & Redeployment Rollbacks</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Deploy any saved version in 1 click whenever an issue occurs or you need to revert changes.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-750 self-start sm:self-auto">
            {snapshots.length} {snapshots.length === 1 ? 'Snapshot' : 'Snapshots'} Stored
          </span>
        </div>

        {snapshots.length === 0 ? (
          <div className="py-8 text-center bg-stone-900/60 border border-dashed border-stone-800 rounded-xl p-6 space-y-2.5">
            <ShieldCheck className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="text-xs font-semibold text-stone-300">No saved snapshots yet.</p>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Before making major edits to copy, doctors, or designs, save a snapshot so you can instantly roll back if needed.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCreatingSnapshot(true);
                const now = new Date();
                setSnapshotName(`Initial Baseline – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
              }}
              className="mt-2 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-emerald-400 hover:text-emerald-300 text-xs font-semibold rounded-lg transition cursor-pointer border border-stone-700"
            >
              + Create First Snapshot Now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 sm:p-4 bg-stone-900 border border-stone-800 hover:border-stone-750 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-stone-100 group-hover:text-emerald-400 transition">
                      {snap.name}
                    </span>
                    <span className="text-[10px] text-stone-400 bg-stone-850 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      {snap.formattedDate}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-medium">
                      {snap.colorPalette}
                    </span>
                  </div>

                  {snap.description && (
                    <p className="text-[11px] text-stone-400 italic line-clamp-1">
                      "{snap.description}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-500">
                    <span>Practice: <strong className="text-stone-300 font-medium">{snap.clinicName}</strong></span>
                    {snap.doctorName && (
                      <>
                        <span>•</span>
                        <span>Clinician: <strong className="text-stone-300 font-medium">{snap.doctorName}</strong></span>
                      </>
                    )}
                    {snap.cityState && (
                      <>
                        <span>•</span>
                        <span>Location: <strong className="text-stone-300 font-medium">{snap.cityState}</strong></span>
                      </>
                    )}
                    <span>•</span>
                    <span>Articles: <strong className="text-stone-300 font-medium">{snap.blogPostsCount}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setSnapshotToRedeploy(snap)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Deploy this snapshot to the live website"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Redeploy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportSingleSnapshot(snap)}
                    className="p-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white rounded-lg transition cursor-pointer border border-stone-700"
                    title="Export this snapshot to a file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSnapshot(snap.id, snap.name)}
                    className="p-1.5 bg-stone-800 hover:bg-red-950/40 text-stone-400 hover:text-red-400 rounded-lg transition cursor-pointer border border-stone-750 hover:border-red-800/50"
                    title="Delete this snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: DELETABLE STARTER TEMPLATES / CLINIC PRESETS */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div>
            <h4 className="font-bold text-xs text-stone-200 uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Starter Templates & Clinic Presets (Deletable)</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Load ready-made clinic styles or delete templates you don't need from your library.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingTemplate(!isCreatingTemplate)}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer border border-stone-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Current as Starter Template</span>
            </button>
            <button
              type="button"
              onClick={handleRestoreDefaultTemplates}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-200 text-xs font-medium rounded-lg transition cursor-pointer border border-stone-700 flex items-center gap-1"
              title="Reset starter templates to original factory presets"
            >
              <RotateCcw className="w-3 h-3 text-stone-400" />
              <span>Reset Factory Templates</span>
            </button>
          </div>
        </div>

        {/* Create Template Form (Expandable) */}
        {isCreatingTemplate && (
          <form
            onSubmit={handleSaveCurrentAsTemplate}
            className="p-3.5 bg-stone-900 border border-stone-750 rounded-xl space-y-3 animate-fade-in"
          >
            <h5 className="text-xs font-bold text-stone-200">Save Current Site as Starter Template</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name (e.g. Sports Injury Clinic)"
                className="bg-stone-950 border border-stone-750 rounded-lg p-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={templateTagline}
                onChange={(e) => setTemplateTagline(e.target.value)}
                placeholder="Description / Tagline"
                className="bg-stone-950 border border-stone-750 rounded-lg p-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingTemplate(false)}
                className="px-3 py-1 bg-stone-800 text-stone-400 hover:text-white rounded text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer"
              >
                Save to Starter Templates
              </button>
            </div>
          </form>
        )}

        {/* Starter Templates Grid */}
        {templates.length === 0 ? (
          <div className="py-6 text-center bg-stone-900/60 border border-dashed border-stone-800 rounded-xl p-4 space-y-2">
            <p className="text-xs text-stone-400">All starter templates have been deleted from your library.</p>
            <button
              type="button"
              onClick={handleRestoreDefaultTemplates}
              className="px-3 py-1.5 bg-stone-800 text-emerald-400 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Restore Factory Starter Templates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-3.5 bg-stone-900 hover:bg-stone-800/90 border border-stone-800 hover:border-stone-700 rounded-xl transition flex flex-col justify-between gap-2.5 group relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-stone-100 group-hover:text-emerald-400 transition leading-snug">
                      {tpl.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {tpl.cityState && (
                        <span className="text-[10px] text-stone-400 bg-stone-850 px-2 py-0.5 rounded font-mono">
                          {tpl.cityState}
                        </span>
                      )}
                      {tpl.isCustom && (
                        <span className="text-[9px] text-amber-400 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.2 rounded font-bold">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.tagline || 'Pre-configured practice theme and content'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <span className="text-[10px] font-mono text-stone-500">
                    {tpl.colorPalette || 'Standard theme'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInitiateApplyTemplate(tpl)}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Load this starter template onto the site"
                    >
                      <Zap className="w-3 h-3 text-emerald-400 group-hover:text-white" />
                      <span>Apply</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                      className="p-1 bg-stone-800/70 hover:bg-red-950/40 text-stone-500 hover:text-red-400 rounded-lg transition cursor-pointer border border-stone-750 hover:border-red-800/60"
                      title="Delete this template from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: EXPORT SITE DATA & BACKUP TO FILE */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div>
          <h4 className="font-bold text-xs text-stone-200 uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            <span>Export Site Data & Backup to File</span>
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Export a complete site data backup file for safe keeping, or migrate your settings to another domain. Developers can inspect the raw JSON format.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleExportSiteData}
            className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-stone-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Site Backup (.json)</span>
          </button>
          <button
            type="button"
            onClick={handleCopySiteData}
            className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-stone-700"
          >
            {jsonCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-stone-400" />
            )}
            <span>{jsonCopied ? 'Copied to Clipboard!' : 'Copy Site Data (JSON)'}</span>
          </button>
        </div>

        <div className="pt-3 border-t border-stone-800 space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-300">
              Restore / Redeploy from File or Pasted Data
            </label>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Select a previously saved backup file (.json) or paste raw site configuration text below.
            </p>
          </div>

          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-xs text-stone-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-750 file:text-stone-200 hover:file:bg-stone-700 cursor-pointer"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Or paste raw site data string (JSON):</span>
              {importJsonText && (
                <div className="flex items-center gap-2">
                  {jsonValidation?.isValid && (
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      className="text-stone-400 hover:text-emerald-400 cursor-pointer underline text-[10px]"
                    >
                      Format JSON
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setImportJsonText('')}
                    className="text-stone-500 hover:text-stone-300 cursor-pointer text-[10px]"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <textarea
              rows={3}
              placeholder='{"name": "Cedar Creek Chiropractic", "doctorName": "Dr. Sarah Jenkins", ...}'
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className={`w-full bg-stone-900 border rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none font-mono transition ${
                jsonValidation === null
                  ? 'border-stone-750 focus:border-emerald-500'
                  : jsonValidation.isValid
                  ? 'border-emerald-500/80 focus:border-emerald-500 ring-1 ring-emerald-500/30'
                  : 'border-red-500/80 focus:border-red-500 ring-1 ring-red-500/30'
              }`}
            />
          </div>

          {/* Real-time JSON Paste Validation Indicator */}
          {jsonValidation !== null && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition animate-fade-in ${
                jsonValidation.isValid
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/60 text-red-200'
              }`}
            >
              {jsonValidation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 text-[11px] flex-1">
                {jsonValidation.isValid ? (
                  <>
                    <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <span>Valid Site Data JSON</span>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-900/60 px-1.5 py-0.2 rounded border border-emerald-700/50">
                        {jsonValidation.keyCount} properties
                      </span>
                    </p>
                    <p className="text-stone-300">
                      Ready to apply.
                      {jsonValidation.clinicName && (
                        <span> Practice name: <strong className="text-white">{jsonValidation.clinicName}</strong></span>
                      )}
                      {jsonValidation.doctorName && (
                        <span> • Clinician: <strong className="text-white">{jsonValidation.doctorName}</strong></span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-red-300">Malformed JSON</p>
                    <p className="text-red-200/90 font-mono text-[10px] break-all">
                      {jsonValidation.error}
                    </p>
                    <p className="text-stone-400 text-[10px] mt-0.5">
                      Please check for missing braces, unquoted keys, or trailing commas before applying.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action button */}
          {importJsonText && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleImportJson}
                disabled={!jsonValidation?.isValid}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  jsonValidation?.isValid
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md shadow-emerald-950'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-750'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {jsonValidation?.isValid
                    ? 'Apply & Redeploy Site From Data'
                    : 'Fix JSON Errors to Apply'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SAFETY CONFIRMATION MODAL ON "APPLY" (Template) */}
      {templateToApply && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-750 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-5 text-stone-100 relative animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-100">
                    Apply Starter Template?
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                    Template: {templateToApply.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTemplateToApply(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Callout */}
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Warning: Potential Content Overwrite</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                Applying this starter template will overwrite your current design, copy, services, and images with the template's settings.
              </p>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                We highly recommend saving a <strong className="text-emerald-400 font-semibold">Snapshot</strong> first so you can instantly roll back at any time.
              </p>
            </div>

            {/* Template Summary Preview */}
            <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-1 text-xs">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Template Details
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-stone-500">Practice: </span>
                  <span className="text-stone-200 font-medium">
                    {templateToApply.data.name || templateToApply.name}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Color Theme: </span>
                  <span className="text-stone-200 font-medium">
                    {templateToApply.colorPalette || templateToApply.data.colorPalette || 'Standard'}
                  </span>
                </div>
                {templateToApply.cityState && (
                  <div className="col-span-2">
                    <span className="text-stone-500">Location: </span>
                    <span className="text-stone-200 font-medium">
                      {templateToApply.cityState}
                    </span>
                  </div>
                )}
                {templateToApply.tagline && (
                  <div className="col-span-2">
                    <span className="text-stone-500">Tagline: </span>
                    <span className="text-stone-300 italic">
                      "{templateToApply.tagline}"
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveSnapshotAndApplyTemplate}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Save Snapshot & Apply</span>
              </button>

              <button
                type="button"
                onClick={handleApplyTemplateDirectly}
                className="py-2.5 px-3 bg-stone-800 hover:bg-amber-900/40 text-stone-300 hover:text-amber-200 border border-stone-700 hover:border-amber-700/50 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Apply Without Saving
              </button>

              <button
                type="button"
                onClick={() => setTemplateToApply(null)}
                className="py-2.5 px-3 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFETY CONFIRMATION MODAL ON "REDEPLOY SNAPSHOT" */}
      {snapshotToRedeploy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-750 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 text-stone-100 relative animate-scale-up">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-100">
                    Redeploy Saved Snapshot?
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Rollback to: <strong className="text-emerald-400">{snapshotToRedeploy.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSnapshotToRedeploy(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              This will restore all content, sections, colors, team profiles, and settings to the exact state captured on <strong>{snapshotToRedeploy.formattedDate}</strong>.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSnapshotToRedeploy(null)}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs font-medium cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeploySnapshot}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-950"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Redeploy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
