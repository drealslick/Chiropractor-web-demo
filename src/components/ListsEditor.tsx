import React, { useState } from 'react';
import { ClinicInfo, ProblemCondition, PatientTestimonial, ProcessStep, HeroTriageOption, ClinicPost } from '../types';
import {
  conditionsData,
  faqs,
  testimonials,
  processSteps,
  firstVisitSteps,
  defaultTriageOptions,
} from '../data/clinicData';
import { defaultBlogPosts } from '../data/defaultPosts';
import { BlogManager } from './admin/BlogManager';
import {
  Activity,
  MessageSquare,
  HelpCircle,
  Shield,
  Clock,
  Heart,
  FileText,
  Image as ImageIcon,
  DollarSign,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Star,
  Award,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  RotateCcw,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

type FaqRow = { q: string; a: string };

function seedFaqs(clinic: ClinicInfo): FaqRow[] {
  if (clinic.customFaqs && clinic.customFaqs.length) return clinic.customFaqs;
  return faqs.map((f) => ({ q: f.question || '', a: f.answer || '' }));
}

function seedConditions(clinic: ClinicInfo): ProblemCondition[] {
  if (clinic.customConditions && clinic.customConditions.length) return clinic.customConditions;
  return conditionsData.map((c) => ({ ...c }));
}

function seedReviews(clinic: ClinicInfo): PatientTestimonial[] {
  if (clinic.customTestimonials && clinic.customTestimonials.length) return clinic.customTestimonials;
  return testimonials.map((t) => ({ ...t }));
}

function seedProcess(clinic: ClinicInfo): ProcessStep[] {
  if (clinic.customProcessSteps && clinic.customProcessSteps.length) return clinic.customProcessSteps;
  return processSteps.map((s) => ({ ...s }));
}

function seedFirstVisit(clinic: ClinicInfo): ProcessStep[] {
  if (clinic.customFirstVisitSteps && clinic.customFirstVisitSteps.length) return clinic.customFirstVisitSteps;
  return firstVisitSteps.map((s) => ({ ...s }));
}

function seedPosts(clinic: ClinicInfo): ClinicPost[] {
  if (clinic.customPosts && clinic.customPosts.length) return clinic.customPosts;
  return defaultBlogPosts;
}

function seedTriage(clinic: ClinicInfo): HeroTriageOption[] {
  if (clinic.customTriageOptions && clinic.customTriageOptions.length) return clinic.customTriageOptions;
  return defaultTriageOptions.map((t) => ({ ...t }));
}

function seedInsurances(clinic: ClinicInfo): string[] {
  if (clinic.customInsurances && clinic.customInsurances.length) return clinic.customInsurances;
  return [
    'Anthem Blue Cross Blue Shield',
    'Aetna',
    'UnitedHealthcare',
    'Medical Mutual',
    'Medicare',
    'Cigna',
    'HSA / FSA Accepted',
  ];
}

// 5 Core Pre-Built Discomfort Presets for Instant 1-Click Toggle
export const PREBUILT_DISCOMFORT_OPTIONS: HeroTriageOption[] = [
  {
    id: 'lower-back',
    label: 'Lower Back & Sciatica',
    shortLabel: 'Lower Back',
    focus: 'Lumbar Decompression & Nerve Relief',
    typicalVisits: '2–4 visits to relief',
    summary: 'Relieves sharp lumbar compression, disc pressure, and shooting sciatic pain down the leg.',
  },
  {
    id: 'neck-shoulder',
    label: 'Neck & Shoulder Tension',
    shortLabel: 'Neck & Posture',
    focus: 'Cervical Alignment & Posture Correction',
    typicalVisits: '1–3 visits to relief',
    summary: 'Releases tight upper trap spasms, tech neck stiffness, and suboccipital nerve tension.',
  },
  {
    id: 'headaches-migraines',
    label: 'Headaches & Migraines',
    shortLabel: 'Headaches',
    focus: 'Cervicogenic Pressure Release',
    typicalVisits: '2–4 visits to relief',
    summary: 'Relieves vascular and tension headaches originating from upper cervical joint restrictions.',
  },
  {
    id: 'sciatica-nerve',
    label: 'Sciatica & Nerve Impingement',
    shortLabel: 'Sciatica',
    focus: 'Sciatic Nerve Flossing & Alignment',
    typicalVisits: '3–5 visits to relief',
    summary: 'Targeted lumbar and piriformis decompression to halt radiating leg numbness and burning.',
  },
  {
    id: 'sports-joint',
    label: 'Sports & Joint Injuries',
    shortLabel: 'Sports & Joints',
    focus: 'Kinetic Chain & Soft Tissue Rehab',
    typicalVisits: '2–5 visits to relief',
    summary: 'Accelerates athletic recovery, joint mobility, and tendon resilience without surgery or downtime.',
  },
];

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
  helperText,
  locationBadge,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  helperText?: string;
  locationBadge?: string;
}) {
  return (
    <label className="block mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="block text-xs font-medium text-stone-300">{label}</span>
        {locationBadge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
            {locationBadge}
          </span>
        )}
      </div>
      {textarea ? (
        <textarea
          rows={2}
          placeholder={placeholder}
          className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 transition shadow-inner"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          placeholder={placeholder}
          className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2.5 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 transition shadow-inner"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {helperText && (
        <span className="block text-[11px] text-stone-400 mt-1 leading-normal flex items-center gap-1">
          <Info className="w-3 h-3 text-stone-500 shrink-0 inline" />
          <span>{helperText}</span>
        </span>
      )}
    </label>
  );
}

export function ListsEditor({
  clinic,
  onUpdateClinic,
  initialCategory,
}: {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  initialCategory?: string;
}) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'triage');
  const [expandedCustomIndex, setExpandedCustomIndex] = useState<number | null>(null);

  const triageList = seedTriage(clinic);
  const faqList = seedFaqs(clinic);
  const condList = seedConditions(clinic);
  const reviewList = seedReviews(clinic);
  const processList = seedProcess(clinic);
  const firstVisitList = seedFirstVisit(clinic);
  const insuranceList = seedInsurances(clinic);

  const isTriageEnabled = clinic.showHeroTriage !== false;
  const postList = seedPosts(clinic);

  const extra = clinic as ClinicInfo & {
    firstVisitDuration?: string;
    firstVisitBring?: string;
    firstVisitWear?: string;
    firstVisitAfter?: string;
    firstVisitForms?: string;
  };

  const categories = [
    { id: 'triage', label: 'Discomfort Selector', icon: Activity, count: triageList.length },
    { id: 'blog', label: 'Blog & Articles', icon: BookOpen, count: postList.length },
    { id: 'trust', label: 'Trust & Badges', icon: ShieldCheck, count: 4 },
    { id: 'conditions', label: 'Conditions & Protocols', icon: Activity, count: condList.length },
    { id: 'why-us', label: 'Why Choose Us (Matrix)', icon: Heart, count: 4 },
    { id: 'process', label: '3-Phase Roadmap', icon: Clock, count: processList.length },
    { id: 'reviews', label: 'Reviews & Case Studies', icon: MessageSquare, count: reviewList.length },
    { id: 'sanctuary', label: 'Practice Environment', icon: Sparkles, count: 3 },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, count: faqList.length },
    { id: 'first-visit', label: 'First Visit Guide', icon: FileText, count: firstVisitList.length },
    { id: 'insurance', label: 'Insurances', icon: Shield, count: insuranceList.length },
    { id: 'pricing', label: 'Pricing & Fees', icon: DollarSign, count: undefined },
    { id: 'images', label: 'Photos & URLs', icon: ImageIcon, count: undefined },
  ];

  // Helper to check if a pre-built preset is active in the clinic's list
  const isPresetActive = (presetId: string) => {
    return triageList.some((t) => t.id === presetId || t.label.toLowerCase().includes(presetId.replace('-', ' ')));
  };

  // Toggle a pre-built preset on or off
  const handleTogglePreset = (preset: HeroTriageOption) => {
    const exists = triageList.some((t) => t.id === preset.id || t.label === preset.label);
    if (exists) {
      // Remove it
      const next = triageList.filter((t) => t.id !== preset.id && t.label !== preset.label);
      onUpdateClinic({ ...clinic, customTriageOptions: next.length > 0 ? next : [preset] });
    } else {
      // Add it
      onUpdateClinic({ ...clinic, customTriageOptions: [...triageList, { ...preset }] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Sub-navigation */}
      <div className="sticky top-0 z-10 -mx-4 -mt-2 px-4 py-2 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-800 text-stone-400'}`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: BLOG & PATIENT GUIDES */}
      {activeCategory === 'blog' && (
        <BlogManager clinic={clinic} onUpdateClinic={onUpdateClinic} />
      )}

      {/* SECTION: HERO DISCOMFORT SELECTOR / CLINICAL TRIAGE */}
      {activeCategory === 'triage' && (
        <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-5">
          {/* Header & Master Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-100 text-sm sm:text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Hero Discomfort Selector</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {triageList.length} Active
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Interactive quick-triage widget on the homepage that diagnoses patient pain points.
              </p>
            </div>

            {/* Master Visibility Toggle */}
            <div className="flex items-center gap-2 bg-stone-900 px-3.5 py-2 rounded-xl border border-stone-750 shrink-0">
              <span className="text-xs text-stone-300 font-medium">Show in Hero:</span>
              <button
                type="button"
                onClick={() => onUpdateClinic({ ...clinic, showHeroTriage: !isTriageEnabled })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isTriageEnabled
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {isTriageEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{isTriageEnabled ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          </div>

          {/* 1-Click Pre-Built Options Toggles */}
          <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 1-Click Popular Condition Toggles
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Toggle recommended conditions on/off instantly without typing or building forms.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateClinic({
                    ...clinic,
                    customTriageOptions: defaultTriageOptions.map((t) => ({ ...t })),
                  })
                }
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition shrink-0"
                title="Reset to default options"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {PREBUILT_DISCOMFORT_OPTIONS.map((preset) => {
                const isActive = isPresetActive(preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleTogglePreset(preset)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/30'
                        : 'bg-stone-850 hover:bg-stone-800 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-300' : 'text-stone-300'}`}>
                          {preset.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{preset.focus}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                        isActive ? 'bg-emerald-500 text-stone-950 font-bold' : 'border border-stone-700 bg-stone-900'
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Headline & Eyebrow settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-stone-900/70 border border-stone-800 rounded-xl">
            <Field
              label="Selector Box Title"
              value={clinic.heroTriageHeadline || 'Select Primary Discomfort:'}
              placeholder="Select Primary Discomfort:"
              helperText="Headline shown above the interactive symptom tabs on the hero section."
              locationBadge="Hero Widget"
              onChange={(v) => onUpdateClinic({ ...clinic, heroTriageHeadline: v })}
            />
            <Field
              label="Subheadline / Eyebrow Tag"
              value={clinic.heroTriageSubheadline || 'Personalized pathway'}
              placeholder="Personalized pathway"
              helperText="Small badge or subtext indicating personalized care."
              locationBadge="Hero Widget"
              onChange={(v) => onUpdateClinic({ ...clinic, heroTriageSubheadline: v })}
            />
          </div>

          {/* Active Discomforts List & Custom Additions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Active Discomfort Cards ({triageList.length})
              </span>
              <button
                type="button"
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                onClick={() =>
                  onUpdateClinic({
                    ...clinic,
                    customTriageOptions: [
                      ...triageList,
                      {
                        id: `custom-${Date.now()}`,
                        label: 'Pregnancy & Pelvic Care',
                        shortLabel: 'Prenatal Care',
                        focus: 'Webster Technique & Sacral Alignment',
                        summary: 'Relieves round ligament tension, low back aching, and pelvic pressure during pregnancy.',
                        typicalVisits: '2–4 visits to relief',
                      },
                    ],
                  })
                }
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Custom Discomfort</span>
              </button>
            </div>

            {/* List of Discomfort Items */}
            <div className="space-y-3">
              {triageList.map((item, idx) => {
                const isExpanded = expandedCustomIndex === idx;
                return (
                  <div key={item.id || idx} className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-emerald-300 block">
                            {item.label || 'Untitled Discomfort Option'}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            Button: "{item.shortLabel || item.label}" • {item.typicalVisits}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedCustomIndex(isExpanded ? null : idx)}
                          className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 bg-stone-800 rounded flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Less' : 'Edit Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          className="text-[11px] text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          title="Remove condition"
                          onClick={() =>
                            onUpdateClinic({
                              ...clinic,
                              customTriageOptions: triageList.filter((_, i) => i !== idx),
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Field
                        label="Full Tab Label (Desktop)"
                        value={item.label || ''}
                        placeholder="e.g. Lower Back & Sciatica"
                        helperText="Appears on desktop symptom selector."
                        onChange={(v) => {
                          const next = [...triageList];
                          next[idx] = { ...item, label: v };
                          onUpdateClinic({ ...clinic, customTriageOptions: next });
                        }}
                      />
                      <Field
                        label="Short Tab Label (Mobile Buttons)"
                        value={item.shortLabel || ''}
                        placeholder="e.g. Lower Back"
                        helperText="Compact text for mobile button pills."
                        onChange={(v) => {
                          const next = [...triageList];
                          next[idx] = { ...item, shortLabel: v };
                          onUpdateClinic({ ...clinic, customTriageOptions: next });
                        }}
                      />
                    </div>

                    {/* Detailed Fields when expanded */}
                    {isExpanded && (
                      <div className="space-y-2.5 pt-2 border-t border-stone-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <Field
                            label="Focus Area / Protocol Name"
                            value={item.focus || ''}
                            placeholder="e.g. Decompression & Spinal Alignment"
                            helperText="The treatment approach highlighted for this condition."
                            onChange={(v) => {
                              const next = [...triageList];
                              next[idx] = { ...item, focus: v };
                              onUpdateClinic({ ...clinic, customTriageOptions: next });
                            }}
                          />
                          <Field
                            label="Expected Recovery Timeline Badge"
                            value={item.typicalVisits || ''}
                            placeholder="e.g. 2–4 visits to relief"
                            helperText="Realistic visit estimate displayed in green badge."
                            onChange={(v) => {
                              const next = [...triageList];
                              next[idx] = { ...item, typicalVisits: v };
                              onUpdateClinic({ ...clinic, customTriageOptions: next });
                            }}
                          />
                        </div>

                        <Field
                          label="Clinical Summary / Protocol Description"
                          textarea
                          value={item.summary || ''}
                          placeholder="e.g. Lumbar facet restriction or disc decompression protocol."
                          helperText="2-3 lines explaining why this condition occurs and how your care resolves it."
                          onChange={(v) => {
                            const next = [...triageList];
                            next[idx] = { ...item, summary: v };
                            onUpdateClinic({ ...clinic, customTriageOptions: next });
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: TRUST & ACCREDITATION BAR */}
      {activeCategory === 'trust' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trust Bar & Accreditation Highlights</span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Customizes the 4 high-trust credentials beneath the hero section.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Trust Item 1 */}
            <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> Badge 1: Patient Rating & Social Proof
              </div>
              <Field
                label="Primary Text"
                value={clinic.trustItem1Primary || clinic.trustRatingLabel || `${clinic.googleRating || 4.9} ★ Google Rating`}
                placeholder="4.9 ★ Google Rating"
                helperText="Prominent rating headline."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem1Primary: v, trustRatingLabel: v })}
              />
              <Field
                label="Secondary Subtitle"
                value={clinic.trustItem1Secondary || `${clinic.googleReviewsCount || clinic.googleReviewCount || '140+'} Verified Reviews`}
                placeholder="140+ Verified Reviews"
                helperText="Total verified reviews count."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem1Secondary: v })}
              />
              <Field
                label="Google Reviews External URL (Optional)"
                value={clinic.reviewsUrl || ''}
                placeholder="https://maps.google.com/..."
                helperText="Link directly to your Google Business reviews profile."
                onChange={(v) => onUpdateClinic({ ...clinic, reviewsUrl: v })}
              />
            </div>

            {/* Trust Item 2 */}
            <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Badge 2: Doctor Credential & Board Status
              </div>
              <Field
                label="Primary Text"
                value={clinic.trustItem2Primary || clinic.doctorCredentials || 'Board Certified DC'}
                placeholder="Board Certified DC"
                helperText="Doctor clinical certification."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem2Primary: v })}
              />
              <Field
                label="Secondary Subtitle"
                value={clinic.trustItem2Secondary || 'Licensed & Insured'}
                placeholder="Licensed & Insured"
                helperText="Licensure note."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem2Secondary: v })}
              />
            </div>

            {/* Trust Item 3 */}
            <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Badge 3: Appointment Time & Dignity
              </div>
              <Field
                label="Primary Text"
                value={clinic.trustItem3Primary || 'No Rushed Visits'}
                placeholder="No Rushed Visits"
                helperText="Time dedicated to patient."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem3Primary: v })}
              />
              <Field
                label="Secondary Subtitle"
                value={clinic.trustItem3Secondary || 'Dedicated 1-on-1 Doctor Time'}
                placeholder="Dedicated 1-on-1 Doctor Time"
                helperText="Care delivery model."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem3Secondary: v })}
              />
            </div>

            {/* Trust Item 4 */}
            <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Badge 4: Ethical Care & Freedom
              </div>
              <Field
                label="Primary Text"
                value={clinic.trustItem4Primary || 'Zero Long Contracts'}
                placeholder="Zero Long Contracts"
                helperText="Discharge-oriented ethics."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem4Primary: v })}
              />
              <Field
                label="Secondary Subtitle"
                value={clinic.trustItem4Secondary || 'Discharged Once You Heal'}
                placeholder="Discharged Once You Heal"
                helperText="No recurring subscription pressure."
                onChange={(v) => onUpdateClinic({ ...clinic, trustItem4Secondary: v })}
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION: CONDITIONS TREATED & PROTOCOLS */}
      {activeCategory === 'conditions' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Clinical Conditions & Diagnostic Protocols ({condList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Controls the interactive master-detail diagnosis explorer on /conditions.</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() =>
                onUpdateClinic({
                  ...clinic,
                  customConditions: [
                    ...condList,
                    {
                      id: `cond-${Date.now()}`,
                      title: 'New Condition',
                      description: 'Concise biomechanical summary.',
                      symptoms: ['Symptom 1', 'Symptom 2'],
                      approach: 'Gentle spinal adjustments and kinetic chain stabilization.',
                    },
                  ],
                })
              }
            >
              + Add Condition
            </button>
          </div>

          <div className="space-y-4">
            {condList.map((c, i) => (
              <div key={c.id || i} className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    #{i + 1} {c.title || 'Untitled Condition'}
                  </span>
                  <button
                    type="button"
                    className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                    onClick={() =>
                      onUpdateClinic({
                        ...clinic,
                        customConditions: condList.filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Condition Title"
                  value={c.title || ''}
                  helperText="Primary diagnosis name."
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = { ...c, title: v };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
                <Field
                  label="Short Description / Subtitle"
                  textarea
                  value={c.description || ''}
                  helperText="Summary of how symptoms present."
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = { ...c, description: v };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
                <Field
                  label="Our Gentle Clinical Protocol (What We Do on Table)"
                  textarea
                  value={c.approach || c.howWeHelp || ''}
                  helperText="Specific adjustments, soft tissue release, and movement rehab."
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = { ...c, approach: v, howWeHelp: v };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
                <Field
                  label="Common Symptoms (comma separated)"
                  value={(c.symptoms || []).join(', ')}
                  helperText="List 3-5 typical patient symptoms separated by commas."
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = {
                      ...c,
                      symptoms: v.split(',').map((s) => s.trim()).filter(Boolean),
                    };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: CARE CONTRAST MATRIX (WHY US) */}
      {activeCategory === 'why-us' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Why Choose Us (Care Contrast Matrix)</span>
            </h3>
            <p className="text-[11px] text-stone-400">
              The high-conviction side-by-side comparison table that breaks assembly-line healthcare stereotypes.
            </p>
          </div>

          <Field
            label="Section Headline"
            value={clinic.whyUsTitle || ''}
            placeholder="A Deliberate Departure from Assembly-Line Healthcare."
            helperText="Main header for the comparison section."
            onChange={(v) => onUpdateClinic({ ...clinic, whyUsTitle: v })}
          />
          <Field
            label="Section Subtitle / Eyebrow"
            value={clinic.whyUsSubtitle || ''}
            placeholder="The Vance Philosophy"
            helperText="Brand or doctor philosophy label."
            onChange={(v) => onUpdateClinic({ ...clinic, whyUsSubtitle: v })}
          />

          <div className="pt-2 border-t border-stone-800 space-y-3">
            <h4 className="text-xs font-bold text-stone-300">Pillar Proof Callouts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400">Pillar 1: Time</span>
                <input
                  className="w-full bg-stone-800 text-xs text-stone-200 p-1.5 rounded"
                  value={clinic.whyUsPillar1Title || '45-Minute Initial Exams'}
                  onChange={(e) => onUpdateClinic({ ...clinic, whyUsPillar1Title: e.target.value })}
                />
              </div>
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400">Pillar 2: Discharge</span>
                <input
                  className="w-full bg-stone-800 text-xs text-stone-200 p-1.5 rounded"
                  value={clinic.whyUsPillar2Title || 'Discharge-Focused Care'}
                  onChange={(e) => onUpdateClinic({ ...clinic, whyUsPillar2Title: e.target.value })}
                />
              </div>
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400">Pillar 3: Technique</span>
                <input
                  className="w-full bg-stone-800 text-xs text-stone-200 p-1.5 rounded"
                  value={clinic.whyUsPillar3Title || 'Gentle & Precision Techniques'}
                  onChange={(e) => onUpdateClinic({ ...clinic, whyUsPillar3Title: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: 3-PHASE PATIENT JOURNEY */}
      {activeCategory === 'process' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>3-Phase Patient Care Roadmap</span>
            </h3>
            <p className="text-[11px] text-stone-400">
              Interactive timeline detailing how patients progress from pain to freedom.
            </p>
          </div>

          <Field
            label="Section Headline"
            value={clinic.processSectionTitle || ''}
            placeholder="From First Exam to Long-Term Freedom"
            helperText="Main title for the 3-step healing process."
            onChange={(v) => onUpdateClinic({ ...clinic, processSectionTitle: v })}
          />

          <div className="space-y-3">
            {processList.map((s, i) => (
              <div key={i} className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-emerald-400">Phase 0{s.number || i + 1}</div>
                <Field
                  label="Phase Title"
                  value={s.title || ''}
                  helperText="e.g. Discovery & Precise Diagnostic Exam"
                  onChange={(v) => {
                    const next = [...processList];
                    next[i] = { ...s, title: v };
                    onUpdateClinic({ ...clinic, customProcessSteps: next });
                  }}
                />
                <Field
                  label="Phase Description & Outcomes"
                  textarea
                  value={s.description || ''}
                  helperText="What the patient experiences during this phase."
                  onChange={(v) => {
                    const next = [...processList];
                    next[i] = { ...s, description: v };
                    onUpdateClinic({ ...clinic, customProcessSteps: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PATIENT REVIEWS & FEATURED CASE STUDY */}
      {activeCategory === 'reviews' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Patient Reviews & Case Studies ({reviewList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Filterable review cards and featured patient comeback story.</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() =>
                onUpdateClinic({
                  ...clinic,
                  customTestimonials: [
                    ...reviewList,
                    { quote: 'New patient recovery quote', author: 'Patient Name', condition: 'Lower Back', rating: 5 },
                  ],
                })
              }
            >
              + Add Review
            </button>
          </div>

          {/* Featured Case Study Hero Dossier */}
          <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Featured Spotlight Case Story
            </div>
            <Field
              label="Patient Name"
              value={clinic.patientStoryName || 'Michael Vance'}
              helperText="Patient's first name."
              onChange={(v) => onUpdateClinic({ ...clinic, patientStoryName: v })}
            />
            <Field
              label="Patient Demographic / Activity"
              value={clinic.patientStoryRole || 'Tennis Player & Architect'}
              helperText="e.g. Marathon Runner, Working Parent, Software Engineer."
              onChange={(v) => onUpdateClinic({ ...clinic, patientStoryRole: v })}
            />
            <Field
              label="Direct Quote on Recovery"
              textarea
              value={clinic.patientStoryQuote || ''}
              helperText="Their own words describing how chiropractic treatment helped them."
              onChange={(v) => onUpdateClinic({ ...clinic, patientStoryQuote: v })}
            />
          </div>

          <div className="space-y-3">
            {reviewList.map((r, i) => (
              <div key={i} className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">Review #{i + 1}</span>
                  <button
                    type="button"
                    className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                    onClick={() =>
                      onUpdateClinic({
                        ...clinic,
                        customTestimonials: reviewList.filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Quote"
                  textarea
                  value={r.quote || ''}
                  helperText="Patient review testimonial."
                  onChange={(v) => {
                    const next = [...reviewList];
                    next[i] = { ...r, quote: v };
                    onUpdateClinic({ ...clinic, customTestimonials: next });
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Field
                    label="Patient Name / Author"
                    value={r.author || ''}
                    helperText="e.g. Sarah M."
                    onChange={(v) => {
                      const next = [...reviewList];
                      next[i] = { ...r, author: v };
                      onUpdateClinic({ ...clinic, customTestimonials: next });
                    }}
                  />
                  <Field
                    label="Condition Tag"
                    value={r.condition || ''}
                    helperText="e.g. Sciatica, Desk Posture"
                    onChange={(v) => {
                      const next = [...reviewList];
                      next[i] = { ...r, condition: v };
                      onUpdateClinic({ ...clinic, customTestimonials: next });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SANCTUARY ENVIRONMENT STANDARDS */}
      {activeCategory === 'sanctuary' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Practice Environment & Sanctuary Standards</span>
            </h3>
            <p className="text-[11px] text-stone-400">Highlight your clinic's acoustic suites, air purification, and calm vibe.</p>
          </div>

          <Field
            label="Section Title"
            value={clinic.clinicSectionTitle || ''}
            placeholder="A Sanctuary Designed for Focused Healing"
            helperText="Main header for the clinic atmosphere section."
            onChange={(v) => onUpdateClinic({ ...clinic, clinicSectionTitle: v })}
          />
          <Field
            label="Doctor Environmental Quote"
            textarea
            value={clinic.clinicQuote || ''}
            placeholder="The clinical environment directly affects the nervous system."
            helperText="Quote regarding patient comfort and healing space."
            onChange={(v) => onUpdateClinic({ ...clinic, clinicQuote: v })}
          />
          <Field
            label="Quote Description"
            textarea
            value={clinic.clinicQuoteDescription || ''}
            placeholder="A calm, quiet clinic environment designed for focused diagnostic assessment..."
            helperText="Supporting narrative describing the peaceful clinic interior."
            onChange={(v) => onUpdateClinic({ ...clinic, clinicQuoteDescription: v })}
          />
        </div>
      )}

      {/* SECTION: FREQUENTLY ASKED QUESTIONS */}
      {activeCategory === 'faqs' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Frequently Asked Questions ({faqList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Answers to common new patient hesitations.</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() => onUpdateClinic({ ...clinic, customFaqs: [...faqList, { q: 'New question', a: 'Answer' }] })}
            >
              + Add FAQ
            </button>
          </div>

          <div className="space-y-3">
            {faqList.map((f, i) => (
              <div key={i} className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">FAQ #{i + 1}</span>
                  <button
                    type="button"
                    className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                    onClick={() => onUpdateClinic({ ...clinic, customFaqs: faqList.filter((_, idx) => idx !== i) })}
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Question"
                  value={f.q}
                  helperText="Patient inquiry question."
                  onChange={(v) => {
                    const next = [...faqList];
                    next[i] = { ...f, q: v };
                    onUpdateClinic({ ...clinic, customFaqs: next });
                  }}
                />
                <Field
                  label="Answer"
                  textarea
                  value={f.a}
                  helperText="Clear, reassuring doctor answer."
                  onChange={(v) => {
                    const next = [...faqList];
                    next[i] = { ...f, a: v };
                    onUpdateClinic({ ...clinic, customFaqs: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: FIRST VISIT */}
      {activeCategory === 'first-visit' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>First Visit Guide (/first-visit)</span>
            </h3>
            <p className="text-[11px] text-stone-400">Step-by-step walkthrough of what new patients experience.</p>
          </div>

          <Field
            label="Page Headline"
            value={clinic.firstVisitTitle || ''}
            helperText="Main header on the /first-visit page."
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitTitle: v })}
          />
          <Field
            label="Visit Duration"
            value={extra.firstVisitDuration || ''}
            placeholder="45–60 minutes"
            helperText="Expected total appointment time."
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitDuration: v } as ClinicInfo)}
          />
          <Field
            label="What to Bring"
            textarea
            value={extra.firstVisitBring || ''}
            placeholder="Photo ID, list of medications, previous imaging reports if available."
            helperText="Items new patients should bring to their initial appointment."
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitBring: v } as ClinicInfo)}
          />
          <Field
            label="What to Wear"
            textarea
            value={extra.firstVisitWear || ''}
            placeholder="Comfortable, loose-fitting athletic or casual clothing."
            helperText="Guidance on comfortable attire for movement assessment."
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitWear: v } as ClinicInfo)}
          />
        </div>
      )}

      {/* SECTION: INSURANCE */}
      {activeCategory === 'insurance' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Accepted Insurances ({insuranceList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Payer networks and insurance badges displayed on the site.</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() => onUpdateClinic({ ...clinic, customInsurances: [...insuranceList, 'New Insurer'] })}
            >
              + Add Insurer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {insuranceList.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                  value={name}
                  onChange={(e) => {
                    const next = [...insuranceList];
                    next[i] = e.target.value;
                    onUpdateClinic({ ...clinic, customInsurances: next });
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300 px-2 cursor-pointer"
                  onClick={() =>
                    onUpdateClinic({
                      ...clinic,
                      customInsurances: insuranceList.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PRICING */}
      {activeCategory === 'pricing' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-3">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Pricing & Fee Transparency</span>
            </h3>
            <p className="text-[11px] text-stone-400">Published fee schedule to build upfront trust with self-pay patients.</p>
          </div>
          <Field
            label="New Patient Exam Fee"
            value={(clinic as ClinicInfo & { examFee?: string }).examFee || ''}
            placeholder="$49 Initial Exam & Consultation"
            helperText="Full price for initial visit."
            onChange={(v) => onUpdateClinic({ ...clinic, examFee: v })}
          />
          <Field
            label="Follow-up Visit Fee"
            value={(clinic as ClinicInfo & { followUpFee?: string }).followUpFee || ''}
            placeholder="$45 Follow-up Adjustment"
            helperText="Standard routine adjustment price."
            onChange={(v) => onUpdateClinic({ ...clinic, followUpFee: v })}
          />
        </div>
      )}

      {/* SECTION: IMAGES */}
      {activeCategory === 'images' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-3">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Photos & Image URLs</span>
            </h3>
            <p className="text-[11px] text-stone-400">Direct image links for doctor portrait, clinic sanctuary, and hero.</p>
          </div>
          <Field
            label="Hero Background Photo URL"
            value={clinic.heroImage || ''}
            helperText="Main backdrop image URL."
            onChange={(v) => onUpdateClinic({ ...clinic, heroImage: v })}
          />
          <Field
            label="Lead Doctor Portrait Photo URL"
            value={clinic.doctorImage || ''}
            helperText="Headshot photo of the lead doctor."
            onChange={(v) => onUpdateClinic({ ...clinic, doctorImage: v })}
          />
          <Field
            label="Clinic Room / Sanctuary Photo URL"
            value={clinic.clinicImage || ''}
            helperText="Interior photography of adjustment suite."
            onChange={(v) => onUpdateClinic({ ...clinic, clinicImage: v })}
          />
          <Field
            label="Patient Comeback Story Photo URL"
            value={clinic.patientImage || ''}
            helperText="Active patient lifestyle photo."
            onChange={(v) => onUpdateClinic({ ...clinic, patientImage: v })}
          />
        </div>
      )}
    </div>
  );
}
