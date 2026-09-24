import React, { useState } from 'react';
import { ClinicInfo, ProblemCondition, PatientTestimonial, ProcessStep } from '../types';
import {
  conditionsData,
  faqs,
  testimonials,
  processSteps,
  firstVisitSteps,
} from '../data/clinicData';
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
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  VolumeX,
  Wind,
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

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block mb-2">
      <span className="block text-[11px] text-stone-400 mb-1">{label}</span>
      {textarea ? (
        <textarea
          rows={2}
          placeholder={placeholder}
          className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          placeholder={placeholder}
          className="w-full bg-stone-900 border border-stone-750 rounded-lg p-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function ListsEditor({
  clinic,
  onUpdateClinic,
}: {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('conditions');

  const faqList = seedFaqs(clinic);
  const condList = seedConditions(clinic);
  const reviewList = seedReviews(clinic);
  const processList = seedProcess(clinic);
  const firstVisitList = seedFirstVisit(clinic);
  const insuranceList = seedInsurances(clinic);

  const extra = clinic as ClinicInfo & {
    firstVisitDuration?: string;
    firstVisitBring?: string;
    firstVisitWear?: string;
    firstVisitAfter?: string;
    firstVisitForms?: string;
  };

  const categories = [
    { id: 'conditions', label: 'Conditions & Protocols', icon: Activity, count: condList.length },
    { id: 'why-us', label: 'Care Contrast Matrix', icon: Heart, count: 4 },
    { id: 'process', label: '3-Phase Journey', icon: Clock, count: processList.length },
    { id: 'reviews', label: 'Case Studies & Reviews', icon: MessageSquare, count: reviewList.length },
    { id: 'sanctuary', label: 'Sanctuary Standards', icon: Sparkles, count: 3 },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, count: faqList.length },
    { id: 'first-visit', label: 'First Visit Page', icon: FileText, count: firstVisitList.length },
    { id: 'insurance', label: 'Insurances', icon: Shield, count: insuranceList.length },
    { id: 'pricing', label: 'Pricing & Fees', icon: DollarSign, count: undefined },
    { id: 'images', label: 'Photos & URLs', icon: ImageIcon, count: undefined },
  ];

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
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                <Icon className="w-3 h-3" />
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

      {/* SECTION: CONDITIONS TREATED & PROTOCOLS */}
      {activeCategory === 'conditions' && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Clinical Conditions & Diagnostic Protocols ({condList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Controls the interactive master-detail diagnosis explorer.</p>
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
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = { ...c, approach: v, howWeHelp: v };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
                <Field
                  label="Common Symptoms (comma separated)"
                  value={(c.symptoms || []).join(', ')}
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
              <span>Care Contrast Matrix (Standard Care vs. Your Protocol)</span>
            </h3>
            <p className="text-[11px] text-stone-400">
              The high-conviction side-by-side comparison table that breaks assembly-line healthcare stereotypes.
            </p>
          </div>

          <Field
            label="Section Headline"
            value={clinic.whyUsTitle || ''}
            placeholder="A Deliberate Departure from Assembly-Line Healthcare."
            onChange={(v) => onUpdateClinic({ ...clinic, whyUsTitle: v })}
          />
          <Field
            label="Section Subtitle / Eyebrow"
            value={clinic.whyUsSubtitle || ''}
            placeholder="The Vance Philosophy"
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
            onChange={(v) => onUpdateClinic({ ...clinic, processSectionTitle: v })}
          />

          <div className="space-y-3">
            {processList.map((s, i) => (
              <div key={i} className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-emerald-400">Phase 0{s.number || i + 1}</div>
                <Field
                  label="Phase Title"
                  value={s.title || ''}
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
                <span>Verified Patient Case Studies & Reviews ({reviewList.length})</span>
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
              onChange={(v) => onUpdateClinic({ ...clinic, patientStoryName: v })}
            />
            <Field
              label="Patient Demographic / Activity (e.g. Tennis Player & Architect)"
              value={clinic.patientStoryRole || 'Tennis Player & Architect'}
              onChange={(v) => onUpdateClinic({ ...clinic, patientStoryRole: v })}
            />
            <Field
              label="Direct Quote on Recovery"
              textarea
              value={clinic.patientStoryQuote || ''}
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
                    onChange={(v) => {
                      const next = [...reviewList];
                      next[i] = { ...r, author: v };
                      onUpdateClinic({ ...clinic, customTestimonials: next });
                    }}
                  />
                  <Field
                    label="Condition Tag (e.g. Sciatica, Desk Posture)"
                    value={r.condition || ''}
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
            onChange={(v) => onUpdateClinic({ ...clinic, clinicSectionTitle: v })}
          />
          <Field
            label="Doctor Environmental Quote"
            textarea
            value={clinic.clinicQuote || ''}
            placeholder="The clinical environment directly affects the nervous system."
            onChange={(v) => onUpdateClinic({ ...clinic, clinicQuote: v })}
          />
          <Field
            label="Quote Description"
            textarea
            value={clinic.clinicQuoteDescription || ''}
            placeholder="A calm, quiet clinic environment designed for focused diagnostic assessment..."
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
          </div>

          <Field
            label="Page Headline"
            value={clinic.firstVisitTitle || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitTitle: v })}
          />
          <Field
            label="Visit Duration (e.g. 45-60 minutes)"
            value={extra.firstVisitDuration || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitDuration: v } as ClinicInfo)}
          />
          <Field
            label="What to Bring"
            textarea
            value={extra.firstVisitBring || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitBring: v } as ClinicInfo)}
          />
          <Field
            label="What to Wear"
            textarea
            value={extra.firstVisitWear || ''}
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
          </div>
          <Field
            label="New Patient Exam Fee (e.g. $49 Initial Exam)"
            value={(clinic as ClinicInfo & { examFee?: string }).examFee || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, examFee: v })}
          />
          <Field
            label="Follow-up Visit Fee (e.g. $45 Follow-up)"
            value={(clinic as ClinicInfo & { followUpFee?: string }).followUpFee || ''}
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
          </div>
          <Field
            label="Hero Background Photo URL"
            value={clinic.heroImage || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, heroImage: v })}
          />
          <Field
            label="Lead Doctor Portrait Photo URL"
            value={clinic.doctorImage || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, doctorImage: v })}
          />
          <Field
            label="Clinic Room / Sanctuary Photo URL"
            value={clinic.clinicImage || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, clinicImage: v })}
          />
          <Field
            label="Patient Comeback Story Photo URL"
            value={clinic.patientImage || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, patientImage: v })}
          />
        </div>
      )}
    </div>
  );
}
