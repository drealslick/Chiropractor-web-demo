import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Copy,
  RotateCcw,
  Check,
  Stethoscope,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  Info,
  Compass,
} from 'lucide-react';
import { ClinicInfo, ProblemCondition } from '../../types';
import { conditionsData } from '../../data/clinicData';

interface HomepageConditionsEditorProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onNavigateToMiniPageBuilder?: () => void;
}

export const HomepageConditionsEditor: React.FC<HomepageConditionsEditorProps> = ({
  clinic,
  onUpdateClinic,
  onNavigateToMiniPageBuilder,
}) => {
  const condList: ProblemCondition[] =
    clinic.customConditions && clinic.customConditions.length > 0
      ? clinic.customConditions
      : conditionsData;

  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateItem = (index: number, partial: Partial<ProblemCondition>) => {
    const next = [...condList];
    next[index] = { ...next[index], ...partial };
    onUpdateClinic({ ...clinic, customConditions: next });
  };

  const handleAddCondition = () => {
    const newItem: ProblemCondition = {
      id: `cond_${Date.now()}`,
      title: 'New Clinical Condition',
      description: 'Isolate restrictions and restore optimal joint kinematics.',
      symptoms: ['Localized joint restriction', 'Movement pain', 'Postural fatigue'],
      approach: 'Targeted spinal adjustments and kinetic chain rehabilitation.',
      howWeHelp: 'Targeted spinal adjustments and kinetic chain rehabilitation.',
    };
    const next = [...condList, newItem];
    onUpdateClinic({ ...clinic, customConditions: next });
    setActivePreviewIdx(next.length - 1);
    showNotification('New condition added to homepage section.');
  };

  const handleDeleteCondition = (index: number) => {
    const item = condList[index];
    if (window.confirm(`Remove "${item.title}" from the homepage conditions section?`)) {
      const next = condList.filter((_, i) => i !== index);
      onUpdateClinic({ ...clinic, customConditions: next });
      if (activePreviewIdx >= next.length) {
        setActivePreviewIdx(Math.max(0, next.length - 1));
      }
      showNotification(`"${item.title}" removed.`);
    }
  };

  const handleMoveCondition = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= condList.length) return;
    const copy = [...condList];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    onUpdateClinic({ ...clinic, customConditions: copy });
    setActivePreviewIdx(target);
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        'Reset homepage conditions section back to the standard 5 clinical protocols?'
      )
    ) {
      onUpdateClinic({
        ...clinic,
        customConditions: conditionsData,
        conditionsTitle: undefined,
        conditionsSubtitle: undefined,
        conditionsIntro: undefined,
      });
      setActivePreviewIdx(0);
      showNotification('Homepage conditions reset to default clinical curriculum.');
    }
  };

  const activeCondition = condList[activePreviewIdx] || condList[0] || {};

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner with Cross-Link to Mini-Page Builder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Homepage Section Editor</span>
          </div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
            <span>Homepage Conditions & Diagnostic Canvas</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Controls the interactive master-detail condition explorer on your homepage (<code className="text-emerald-400 font-mono">/#care</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Section</span>
          </button>
          {onNavigateToMiniPageBuilder && (
            <button
              type="button"
              onClick={onNavigateToMiniPageBuilder}
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-emerald-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Page Builder (/conditions)</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Homepage Canvas Interactive Mini-Preview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-stone-850 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
              Live Homepage Section Preview
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            Interactive diagnostic canvas
          </span>
        </div>

        {/* Section Headings Preview */}
        <div className="space-y-1.5 border-b border-stone-850 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">
            {clinic.conditionsSubtitle || 'Clinical Focus Areas'}
          </span>
          <h4 className="text-lg font-serif font-bold text-white tracking-tight">
            {clinic.conditionsTitle || 'Targeted Care for Specific Mechanical Pain'}
          </h4>
          <p className="text-xs text-stone-400 max-w-xl line-clamp-2">
            {clinic.conditionsIntro ||
              'Pain is rarely random. We isolate the exact nerve irritation, joint restriction, or postural compensation causing your symptoms.'}
          </p>
        </div>

        {/* Master-Detail Interactive Canvas Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Left Mini List */}
          <div className="md:col-span-5 space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {condList.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setActivePreviewIdx(idx)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                  activePreviewIdx === idx
                    ? 'bg-stone-900 border-emerald-500/80 text-white ring-1 ring-emerald-500/30'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-xs text-stone-200 truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {item.description}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>
            ))}
          </div>

          {/* Right Detail Card Preview */}
          <div className="md:col-span-7 p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Diagnostic Profile #{activePreviewIdx + 1}
              </span>
              <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-400" /> Targeted Protocol
              </span>
            </div>
            <h5 className="font-serif font-bold text-sm text-stone-100">
              {activeCondition.title || 'Untitled Condition'}
            </h5>
            <p className="text-xs text-stone-300 line-clamp-2">
              {activeCondition.description || 'Condition description summary.'}
            </p>

            {/* Symptoms preview */}
            {activeCondition.symptoms && activeCondition.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {activeCondition.symptoms.slice(0, 3).map((sym, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-[10px] text-stone-300"
                  >
                    {sym}
                  </span>
                ))}
              </div>
            )}

            {/* Approach preview */}
            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-stone-300">
              <span className="font-bold text-emerald-400 block mb-0.5">How We Restore Function:</span>
              <span className="line-clamp-2">
                {activeCondition.approach || activeCondition.howWeHelp || activeCondition.ourApproach || 'Gentle adjustments and rehabilitation.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: HOMEPAGE HEADER & HEADLINES */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 1. Homepage Section Header & Titles
          </h4>
          <span className="text-[10px] text-stone-400 font-mono">Location: Homepage /#care</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Section Subtitle / Eyebrow Badge
            </label>
            <input
              type="text"
              value={clinic.conditionsSubtitle || ''}
              placeholder="Clinical Focus Areas"
              onChange={(e) => onUpdateClinic({ ...clinic, conditionsSubtitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Green badge pill rendered directly above the main section title.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Main Section Headline
            </label>
            <input
              type="text"
              value={clinic.conditionsTitle || ''}
              placeholder="Targeted Care for Specific Mechanical Pain"
              onChange={(e) => onUpdateClinic({ ...clinic, conditionsTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Large H2 serif heading of the condition diagnostic section.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-300 mb-1">
            Section Subtext / Intro Statement
          </label>
          <textarea
            rows={2}
            value={clinic.conditionsIntro || ''}
            placeholder="Pain is rarely random. We isolate the exact nerve irritation, joint restriction, or postural compensation causing your symptoms."
            onChange={(e) => onUpdateClinic({ ...clinic, conditionsIntro: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[11px] text-stone-400 mt-1">
            Supporting explanation next to the H2 title on desktop.
          </p>
        </div>
      </div>

      {/* SECTION 2: HOMEPAGE CONDITION CARDS & DIAGNOSTIC PROFILES */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> 2. Homepage Condition Items ({condList.length})
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Each item appears in the interactive diagnostic canvas on the homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddCondition}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Condition Card</span>
          </button>
        </div>

        <div className="space-y-4">
          {condList.map((cond, idx) => (
            <div
              key={cond.id || idx}
              className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3 hover:border-stone-750 transition"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-xs text-stone-200">
                    {cond.title || 'Untitled Condition'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveCondition(idx, 'up')}
                    disabled={idx === 0}
                    title="Move Up"
                    className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCondition(idx, 'down')}
                    disabled={idx === condList.length - 1}
                    title="Move Down"
                    className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCondition(idx)}
                    title="Remove Condition"
                    className="p-1 rounded bg-stone-850 hover:bg-red-950 text-stone-400 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Description Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Condition Title (Homepage Button & Heading)
                  </label>
                  <input
                    type="text"
                    value={cond.title || ''}
                    placeholder="e.g. Back & Lower Back Pain"
                    onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Short Summary (Biomechanical Root Cause)
                  </label>
                  <input
                    type="text"
                    value={cond.description || ''}
                    placeholder="Personalized care designed around your symptoms..."
                    onChange={(e) => handleUpdateItem(idx, { description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* How We Restore Function */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  How We Restore Function (Clinical Strategy Box)
                </label>
                <textarea
                  rows={2}
                  value={cond.approach || cond.howWeHelp || cond.ourApproach || ''}
                  placeholder="Gentle spinal adjustments, targeted decompression, and core stabilization routines to unload disc pressure..."
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdateItem(idx, { approach: val, howWeHelp: val, ourApproach: val });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Symptoms Pills */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Common Warning Signs (Comma Separated)
                </label>
                <input
                  type="text"
                  value={(cond.symptoms || []).join(', ')}
                  placeholder="Sciatica & radiating leg pain, Lumbar disc decompression, Postural spasm"
                  onChange={(e) => {
                    const syms = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    handleUpdateItem(idx, { symptoms: syms });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Rendered as gray symptom tags on the homepage card.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
