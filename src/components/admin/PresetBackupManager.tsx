import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Archive,
  RefreshCw,
  Palette,
  Building2,
  Zap,
  Tag,
  FileCode,
  Info,
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

export interface PracticeArchetype {
  id: string;
  name: string;
  tagline?: string;
  cityState?: string;
  colorPalette?: string;
  isCustom?: boolean;
  data: Partial<ClinicInfo>;
}

const STORAGE_SNAPSHOTS_KEY = 'clinic_site_snapshots_v1';
const STORAGE_TEMPLATES_KEY = 'clinic_custom_archetypes_v1';

// Convert factory agencyDemoPresets to initial array of archetypes
const getFactoryTemplates = (): PracticeArchetype[] => {
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
  // 1. Snapshots State
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

  // 2. Archetypes/Templates State (Deletable!)
  const [archetypes, setArchetypes] = useState<PracticeArchetype[]>(() => {
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

  // Form state for creating a new snapshot
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotNote, setSnapshotNote] = useState('');

  // Form state for saving current site as a reusable template
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateTagline, setTemplateTagline] = useState('');

  // JSON Blueprint Export/Import state
  const [jsonCopied, setJsonCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
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
      localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(archetypes));
    } catch (e) {
      console.error('Failed to save archetypes to localStorage', e);
    }
  }, [archetypes]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
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

    const newSnapshot: ClinicSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: finalName,
      description: snapshotNote.trim() || undefined,
      createdAt: now.toISOString(),
      formattedDate,
      clinicName: clinic.name || 'Untitled Practice',
      doctorName: clinic.doctorName,
      colorPalette: clinic.colorPalette || 'bone-charcoal',
      cityState: clinic.cityState || clinic.city || '',
      blogPostsCount: clinic.customPosts ? clinic.customPosts.length : 4,
      data: JSON.parse(JSON.stringify(clinic)), // deep clone
    };

    setSnapshots([newSnapshot, ...snapshots]);
    setSnapshotName('');
    setSnapshotNote('');
    setIsCreatingSnapshot(false);
    showNotification(`Saved snapshot "${newSnapshot.name}". You can redeploy to this state anytime.`);
  };

  const handleRedeploySnapshot = (snap: ClinicSnapshot) => {
    if (
      window.confirm(
        `Are you sure you want to redeploy to "${snap.name}"? This will replace current site data with this saved snapshot.`
      )
    ) {
      onUpdateClinic({ ...snap.data });
      showNotification(`Site successfully redeployed to "${snap.name}"!`);
    }
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
    a.download = `${snap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-snapshot.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Template Archetype Management ---
  const handleDeployTemplate = (template: PracticeArchetype) => {
    if (
      window.confirm(
        `Apply "${template.name}" template? This replaces current practice theme and copy with the template's settings.`
      )
    ) {
      onUpdateClinic({ ...clinic, ...template.data });
      showNotification(`Applied "${template.name}" template!`);
    }
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (window.confirm(`Delete template "${name}" from your presets library?`)) {
      setArchetypes(archetypes.filter((t) => t.id !== id));
      showNotification(`Deleted template "${name}".`);
    }
  };

  const handleRestoreDefaultTemplates = () => {
    if (window.confirm('Restore all factory demo templates (Austin, Denver, Preston, etc.)?')) {
      const factory = getFactoryTemplates();
      setArchetypes(factory);
      showNotification('Restored all factory starter templates.');
    }
  };

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = templateName.trim() || `${clinic.name || 'Practice'} Template`;
    const newTemplate: PracticeArchetype = {
      id: `custom_archetype_${Date.now()}`,
      name: finalName,
      tagline: templateTagline.trim() || clinic.tagline || 'Custom clinic archetype',
      cityState: clinic.cityState || clinic.city || '',
      colorPalette: clinic.colorPalette,
      isCustom: true,
      data: JSON.parse(JSON.stringify(clinic)),
    };
    setArchetypes([newTemplate, ...archetypes]);
    setTemplateName('');
    setTemplateTagline('');
    setIsCreatingTemplate(false);
    showNotification(`Saved "${finalName}" to template library.`);
  };

  // --- Blueprint JSON Export/Import ---
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
    URL.revokeObjectURL(url);
    showNotification('Downloaded site blueprint JSON backup.');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(clinic, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
    showNotification('Copied site blueprint JSON to clipboard.');
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
      showNotification('Blueprint successfully applied and site redeployed!');
    } catch {
      setImportError('Failed to parse JSON. Please verify syntax.');
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
          showNotification('Blueprint backup successfully loaded from file!');
        }
      } catch {
        alert('Could not parse imported JSON file. Please ensure it is valid JSON.');
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
              <span>Snapshots, Backups & Presets</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Save current site versions to safely redeploy anytime major changes occur, manage archetypes, or export JSON backups.
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
                    <span className="text-[10px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded font-mono flex items-center gap-1">
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
                    onClick={() => handleRedeploySnapshot(snap)}
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
                    title="Export this snapshot to a JSON file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSnapshot(snap.id, snap.name)}
                    className="p-1.5 bg-stone-800 hover:bg-red-950/40 text-stone-400 hover:text-red-400 rounded-lg transition cursor-pointer border border-stone-700 hover:border-red-800/50"
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

      {/* SECTION 2: DELETABLE PRACTICE ARCHETYPES / TEMPLATES */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div>
            <h4 className="font-bold text-xs text-stone-200 uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Practice Archetypes & Starter Templates (Deletable)</span>
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
              <span>Save Current as Template</span>
            </button>
            <button
              type="button"
              onClick={handleRestoreDefaultTemplates}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-stone-200 text-xs font-medium rounded-lg transition cursor-pointer border border-stone-700 flex items-center gap-1"
              title="Reset starter templates to original factory presets"
            >
              <RotateCcw className="w-3 h-3 text-stone-400" />
              <span>Reset Factory Archetypes</span>
            </button>
          </div>
        </div>

        {/* Create Template Form (Expandable) */}
        {isCreatingTemplate && (
          <form
            onSubmit={handleSaveCurrentAsTemplate}
            className="p-3.5 bg-stone-900 border border-stone-750 rounded-xl space-y-3 animate-fade-in"
          >
            <h5 className="text-xs font-bold text-stone-200">Save Current Site as Archetype</h5>
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
                Save to Archetypes
              </button>
            </div>
          </form>
        )}

        {/* Archetypes Grid */}
        {archetypes.length === 0 ? (
          <div className="py-6 text-center bg-stone-900/60 border border-dashed border-stone-800 rounded-xl p-4 space-y-2">
            <p className="text-xs text-stone-400">All templates have been deleted from your library.</p>
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
            {archetypes.map((tpl) => (
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
                      onClick={() => handleDeployTemplate(tpl)}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="Load this template onto the site"
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

      {/* SECTION 3: BLUEPRINT JSON EXPORT & IMPORT */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div>
          <h4 className="font-bold text-xs text-stone-200 uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            <span>Blueprint JSON File Export & Restore</span>
          </h4>
          <p className="text-xs text-stone-400 mt-0.5">
            Export complete site configuration file for external backup or migration to another domain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleExportBlueprint}
            className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-stone-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Complete Blueprint (.json)</span>
          </button>
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-stone-700"
          >
            {jsonCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-stone-400" />
            )}
            <span>{jsonCopied ? 'Copied to Clipboard!' : 'Copy Raw Blueprint JSON'}</span>
          </button>
        </div>

        <div className="pt-3 border-t border-stone-800 space-y-2.5">
          <label className="block text-xs font-medium text-stone-300">
            Restore / Redeploy from JSON File or Paste
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-xs text-stone-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-750 file:text-stone-200 hover:file:bg-stone-700 cursor-pointer"
          />
          <textarea
            rows={2}
            placeholder="Or paste raw JSON string here to redeploy..."
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full bg-stone-900 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
          />
          {importError && <p className="text-xs text-red-400">{importError}</p>}
          {importJsonText && (
            <button
              type="button"
              onClick={handleImportJson}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Apply & Redeploy Site From JSON</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
