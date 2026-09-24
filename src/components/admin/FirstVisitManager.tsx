import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Clock,
  MapPin,
  Car,
  FolderCheck,
  Shirt,
  MessageSquare,
  Search,
  ClipboardCheck,
  Activity,
  Stethoscope,
  Sparkles,
  Shield,
  User,
  Eye,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ClinicInfo, ProcessStep } from '../../types';
import { firstVisitSteps } from '../../data/clinicData';

interface FirstVisitManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

const DEFAULT_BRING_ITEMS = [
  'Photo ID or Government Identification (Driver’s License, Passport)',
  'Private Health Insurance card or policy details (if claiming cover)',
  'List of current medications, supplements, and previous surgeries',
  'Previous spinal X-ray, MRI, or CT scan imaging reports (if available)',
];

export const FirstVisitManager: React.FC<FirstVisitManagerProps> = ({
  clinic,
  onUpdateClinic,
}) => {
  const steps: ProcessStep[] =
    clinic.customFirstVisitSteps && clinic.customFirstVisitSteps.length > 0
      ? clinic.customFirstVisitSteps
      : firstVisitSteps;

  const bringList: string[] =
    clinic.firstVisitBringList && clinic.firstVisitBringList.length > 0
      ? clinic.firstVisitBringList
      : clinic.firstVisitBring
        ? clinic.firstVisitBring.split('\n').filter(Boolean)
        : DEFAULT_BRING_ITEMS;

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Steps Handlers
  const handleAddStep = () => {
    const nextNumber = String(steps.length + 1).padStart(2, '0');
    const newStep: ProcessStep = {
      number: nextNumber,
      title: 'Home Care & Movement Progression',
      duration: '10 mins',
      icon: 'activity',
      description: 'Prescribed home decompression exercises and postural modifications to protect your spine between visits.',
      details: [
        'Personalized daily mobility drill instructions',
        'Workstation ergonomic modification guidance',
        'Direct access to our patient messaging portal',
      ],
    };
    const next = [...steps, newStep];
    onUpdateClinic({ ...clinic, customFirstVisitSteps: next });
    showNotification('New step added to First Visit Guide.');
  };

  const handleUpdateStep = (index: number, partial: Partial<ProcessStep>) => {
    const next = [...steps];
    next[index] = { ...next[index], ...partial };
    onUpdateClinic({ ...clinic, customFirstVisitSteps: next });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= steps.length) return;
    const copy = [...steps];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    onUpdateClinic({ ...clinic, customFirstVisitSteps: copy });
  };

  const handleDeleteStep = (index: number) => {
    if (window.confirm(`Delete step #${index + 1}?`)) {
      const next = steps.filter((_, i) => i !== index);
      onUpdateClinic({ ...clinic, customFirstVisitSteps: next });
      showNotification('Step removed.');
    }
  };

  const handleResetSteps = () => {
    if (window.confirm('Reset all first visit steps back to the standard 3-phase clinical protocol?')) {
      onUpdateClinic({ ...clinic, customFirstVisitSteps: firstVisitSteps });
      showNotification('Steps reset to defaults.');
    }
  };

  // Bring List Handlers
  const handleAddBringItem = () => {
    const next = [...bringList, 'New checklist item (e.g., Comfortable gym shorts)'];
    onUpdateClinic({ ...clinic, firstVisitBringList: next });
  };

  const handleUpdateBringItem = (index: number, val: string) => {
    const next = [...bringList];
    next[index] = val;
    onUpdateClinic({ ...clinic, firstVisitBringList: next });
  };

  const handleDeleteBringItem = (index: number) => {
    const next = bringList.filter((_, i) => i !== index);
    onUpdateClinic({ ...clinic, firstVisitBringList: next });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>First Visit Guide Editor (/first-visit)</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure the patient onboarding walkthrough: vertical timeline steps, what to bring checklist, dress code, Google Map directions, and doctor reassurance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/first-visit"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Live Page</span>
          </a>
          <button
            type="button"
            onClick={handleResetSteps}
            className="px-3 py-1.5 rounded-lg border border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Steps</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: HERO & GENERAL VISIT SETTINGS */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 1. Hero Section & Visit Overview
          </h4>
          <p className="text-[11px] text-stone-400">Controls the headline, duration estimate, and reassurance microcopy.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Eyebrow Subtitle Badge
            </label>
            <input
              type="text"
              value={clinic.firstVisitSubtitle || ''}
              placeholder="What to expect"
              onChange={(e) => onUpdateClinic({ ...clinic, firstVisitSubtitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Page Headline (H1)
            </label>
            <input
              type="text"
              value={clinic.firstVisitTitle || ''}
              placeholder="Your first visit"
              onChange={(e) => onUpdateClinic({ ...clinic, firstVisitTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Visit Duration & Setting Statement
            </label>
            <textarea
              rows={2}
              value={clinic.firstVisitDuration || ''}
              placeholder="Plan about 45–60 minutes at Vance Health Practice Architecture. You’ll leave with a clear plan, not a sales pitch."
              onChange={(e) => onUpdateClinic({ ...clinic, firstVisitDuration: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Hero Welcoming Photo URL (Optional)
            </label>
            <input
              type="text"
              value={clinic.firstVisitHeroImage || ''}
              placeholder="https://... or leave empty to use clinic reception photo"
              onChange={(e) => onUpdateClinic({ ...clinic, firstVisitHeroImage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Displayed in the welcoming 2-column split hero alongside your headline.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: VISIT STEPS BUILDER (DYNAMIC TIMELINE) */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 2. Visit Steps Builder ({steps.length} Phases)
            </h4>
            <p className="text-[11px] text-stone-400">
              Configures the vertical timeline. Each step includes a step number, icon, time estimate, and clinical details.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddStep}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3 hover:border-stone-750 transition"
            >
              {/* Step Top Bar */}
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono">
                    {step.number || `0${idx + 1}`}
                  </span>
                  <span className="font-bold text-xs text-stone-200">
                    {step.title || 'Untitled Step'}
                  </span>
                  {step.duration && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {step.duration}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, 'up')}
                    disabled={idx === 0}
                    title="Move Up"
                    className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, 'down')}
                    disabled={idx === steps.length - 1}
                    title="Move Down"
                    className="p-1 rounded bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(idx)}
                    title="Delete Step"
                    className="p-1 rounded bg-stone-850 hover:bg-red-950 text-stone-400 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Step Title
                  </label>
                  <input
                    type="text"
                    value={step.title || ''}
                    placeholder="e.g. Consultation & Clinical History"
                    onChange={(e) => handleUpdateStep(idx, { title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    Duration Estimate Badge
                  </label>
                  <input
                    type="text"
                    value={step.duration || ''}
                    placeholder="e.g. 15 mins"
                    onChange={(e) => handleUpdateStep(idx, { duration: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Timeline Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'chat', label: 'Chat / Discovery', icon: MessageSquare },
                    { id: 'search', label: 'Exam / Diagnostic', icon: Search },
                    { id: 'clipboard', label: 'Plan / Report', icon: ClipboardCheck },
                    { id: 'activity', label: 'Rehab / Care', icon: Activity },
                    { id: 'stethoscope', label: 'Doctor Care', icon: Stethoscope },
                    { id: 'shield', label: 'Guarantee / Safety', icon: Shield },
                  ].map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = (step.icon || 'chat') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleUpdateStep(idx, { icon: preset.id })}
                        className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Description */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  Step Description
                </label>
                <textarea
                  rows={2}
                  value={step.description || ''}
                  placeholder="Concise overview of what happens during this phase of the appointment..."
                  onChange={(e) => handleUpdateStep(idx, { description: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Bullet Details */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-stone-400">
                    Clinical Focus Points (Bullet Highlights)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDetails = step.details || [];
                      handleUpdateStep(idx, { details: [...currentDetails, 'New clinical focus point'] });
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    + Add Bullet
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(step.details || []).map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">•</span>
                      <input
                        type="text"
                        value={detail}
                        onChange={(e) => {
                          const nextDetails = [...(step.details || [])];
                          nextDetails[dIdx] = e.target.value;
                          handleUpdateStep(idx, { details: nextDetails });
                        }}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-850 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextDetails = (step.details || []).filter((_, i) => i !== dIdx);
                          handleUpdateStep(idx, { details: nextDetails });
                        }}
                        className="text-stone-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: "BEFORE YOU ARRIVE" LIST BUILDER & DRESS CODE */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <FolderCheck className="w-3.5 h-3.5" /> 3. "Before You Arrive" Preparation & Checklist
          </h4>
          <p className="text-[11px] text-stone-400">
            Replaces the wall of text with an icon-driven checklist of what to bring, what to wear, and intake form guidance.
          </p>
        </div>

        {/* Bring Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>What to Bring Checklist ({bringList.length} Items)</span>
            </label>
            <button
              type="button"
              onClick={handleAddBringItem}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Checklist Item</span>
            </button>
          </div>

          <div className="space-y-2">
            {bringList.map((item, bIdx) => (
              <div
                key={bIdx}
                className="flex items-center gap-2 p-2 rounded-xl bg-stone-900 border border-stone-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateBringItem(bIdx, e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteBringItem(bIdx)}
                  className="p-1 text-stone-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Wear & Forms Guidance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-800">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-emerald-400" />
              <span>What to Wear Guidance</span>
            </label>
            <textarea
              rows={2}
              value={clinic.firstVisitWear || ''}
              placeholder="Comfortable clothes you can move in. Avoid restrictive dresses or suits."
              onChange={(e) => onUpdateClinic({ ...clinic, firstVisitWear: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Digital Intake Forms Guidance</span>
            </label>
            <textarea
              rows={2}
              value={clinic.firstVisitForms || ''}
              placeholder="If we sent digital intake forms via SMS or email, complete them prior to arrival so your appointment begins on time."
              onChange={(e) => onUpdateClinic({ ...clinic, firstVisitForms: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: "GETTING HERE" & GOOGLE MAP CUSTOMIZATION */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> 4. "Getting Here" & Google Maps Embed
          </h4>
          <p className="text-[11px] text-stone-400">
            Displays clinic address, practice hours, and an embedded Google Map right below the directions card.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-stone-200">
              Display Google Map on First Visit Page
            </span>
            <p className="text-[11px] text-stone-400">
              Renders an interactive location map so patients can get directions instantly.
            </p>
          </div>
          <input
            type="checkbox"
            checked={clinic.showFirstVisitMap !== false}
            onChange={(e) => onUpdateClinic({ ...clinic, showFirstVisitMap: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Custom Google Maps Embed URL (Optional)
            </label>
            <input
              type="text"
              value={clinic.firstVisitMapUrl || clinic.googleMapsEmbedUrl || ''}
              placeholder="https://maps.google.com/... or leave empty to auto-embed address"
              onChange={(e) => onUpdateClinic({ ...clinic, firstVisitMapUrl: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              If left empty, your address ({clinic.address || 'Practice Address'}) is embedded automatically.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Parking & Transit Instructions</span>
            </label>
            <input
              type="text"
              value={clinic.parkingNote || ''}
              placeholder="Dedicated client parking available behind the facility."
              onChange={(e) => onUpdateClinic({ ...clinic, parkingNote: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: "MEET YOUR DOCTOR" REASSURANCE */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="border-b border-stone-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> 5. "Meet Your Doctor" Human Reassurance
          </h4>
          <p className="text-[11px] text-stone-400">
            A warm section introducing the practitioner to dramatically reduce new patient anxiety before arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Lead Practitioner Name & Credentials
            </label>
            <input
              type="text"
              value={clinic.doctorName || ''}
              placeholder="Dr. Alistair Vance, D.C., DACBSP"
              onChange={(e) => onUpdateClinic({ ...clinic, doctorName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              Doctor Clinical Title
            </label>
            <input
              type="text"
              value={clinic.doctorTitle || ''}
              placeholder="Lead Chiropractic Biomechanist"
              onChange={(e) => onUpdateClinic({ ...clinic, doctorTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-300 mb-1">
            Doctor Reassurance Statement & Experience
          </label>
          <textarea
            rows={2}
            value={clinic.firstVisitDoctorNote || ''}
            placeholder={`You'll be seen directly by ${clinic.doctorName || 'Dr. Vance'}, who brings over 12 years of clinical experience in advanced spinal mechanics. We never pass you off to junior assistants.`}
            onChange={(e) => onUpdateClinic({ ...clinic, firstVisitDoctorNote: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
