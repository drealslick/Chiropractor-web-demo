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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block mb-2">
      <span className="block text-[11px] text-stone-500 mb-1">{label}</span>
      {textarea ? (
        <textarea
          rows={2}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
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
  const [activeCategory, setActiveCategory] = useState<string>('all');

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
    { id: 'all', label: 'All Content', icon: Layers, count: undefined },
    { id: 'conditions', label: 'Conditions', icon: Activity, count: condList.length },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, count: reviewList.length },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, count: faqList.length },
    { id: 'process', label: '3-Step Process', icon: Clock, count: processList.length },
    { id: 'first-visit', label: 'First Visit Page', icon: FileText, count: firstVisitList.length },
    { id: 'insurance', label: 'Insurances', icon: Shield, count: insuranceList.length },
    { id: 'why-us', label: 'Why Choose Us', icon: Heart, count: 3 },
    { id: 'pricing', label: 'Pricing & Fees', icon: DollarSign, count: undefined },
    { id: 'images', label: 'Photos & URLs', icon: ImageIcon, count: undefined },
    { id: 'blog', label: 'Blog Posts', icon: FileText, count: ((clinic as ClinicInfo & { customPosts?: unknown[] }).customPosts || []).length },
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
                  <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-800 text-stone-400'}`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: CONDITIONS TREATED */}
      {(activeCategory === 'all' || activeCategory === 'conditions') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Conditions Treated ({condList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Shown in the hero diagnosis picker and Conditions section.</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() =>
                onUpdateClinic({
                  ...clinic,
                  customConditions: [
                    ...condList,
                    { id: `cond-${Date.now()}`, title: 'New condition', description: 'Short description', symptoms: [] },
                  ],
                })
              }
            >
              + Add Condition
            </button>
          </div>

          <div className="space-y-3">
            {condList.map((c, i) => (
              <div key={c.id || i} className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">#{i + 1} {c.title || 'Untitled'}</span>
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
                  label="Title"
                  value={c.title || ''}
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = { ...c, title: v };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
                <Field
                  label="Short Description"
                  textarea
                  value={c.description || ''}
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = { ...c, description: v };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
                <Field
                  label="How We Help"
                  textarea
                  value={c.howWeHelp || ''}
                  onChange={(v) => {
                    const next = [...condList];
                    next[i] = { ...c, howWeHelp: v };
                    onUpdateClinic({ ...clinic, customConditions: next });
                  }}
                />
                <Field
                  label="Symptoms (comma separated)"
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

      {/* SECTION: PATIENT REVIEWS & TESTIMONIALS */}
      {(activeCategory === 'all' || activeCategory === 'reviews') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Patient Reviews & Testimonials ({reviewList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Social proof quotes displayed across the homepage.</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() =>
                onUpdateClinic({
                  ...clinic,
                  customTestimonials: [...reviewList, { quote: 'New review quote', author: 'Patient Name', rating: 5 }],
                })
              }
            >
              + Add Review
            </button>
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
                <Field
                  label="Patient Name / Author"
                  value={r.author || ''}
                  onChange={(v) => {
                    const next = [...reviewList];
                    next[i] = { ...r, author: v };
                    onUpdateClinic({ ...clinic, customTestimonials: next });
                  }}
                />
              </div>
            ))}
          </div>

          {/* Featured Case Study */}
          <div className="pt-3 border-t border-stone-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Featured Case Study Card</h4>
            <Field label="Patient Name" value={clinic.patientStoryName || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStoryName: v })} />
            <Field label="Condition Summary" textarea value={clinic.patientStorySummary || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStorySummary: v })} />
            <Field label="Treatment Timeline" textarea value={clinic.patientStoryTimeline || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStoryTimeline: v })} />
            <Field label="Outcome" value={clinic.patientStoryOutcome || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStoryOutcome: v })} />
          </div>
        </div>
      )}

      {/* SECTION: FREQUENTLY ASKED QUESTIONS */}
      {(activeCategory === 'all' || activeCategory === 'faqs') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Frequently Asked Questions ({faqList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">Answers to common patient objections and questions.</p>
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

      {/* SECTION: 3-STEP PROCESS */}
      {(activeCategory === 'all' || activeCategory === 'process') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>3-Step Patient Process</span>
            </h3>
            <p className="text-[11px] text-stone-400">Explain how simple it is to get started at the clinic.</p>
          </div>

          <div className="space-y-3">
            {processList.map((s, i) => (
              <div key={i} className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-2">
                <div className="text-xs font-bold text-emerald-400">Step {s.number || i + 1}</div>
                <Field
                  label="Title"
                  value={s.title || ''}
                  onChange={(v) => {
                    const next = [...processList];
                    next[i] = { ...s, title: v };
                    onUpdateClinic({ ...clinic, customProcessSteps: next });
                  }}
                />
                <Field
                  label="Description"
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

      {/* SECTION: FIRST VISIT PAGE & PROTOCOL */}
      {(activeCategory === 'all' || activeCategory === 'first-visit') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>First Visit Guide (/first-visit)</span>
            </h3>
            <p className="text-[11px] text-stone-400">Detailed onboarding copy to remove anxiety before appointment.</p>
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
          <Field
            label="Intake & Forms Notice"
            textarea
            value={extra.firstVisitForms || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitForms: v } as ClinicInfo)}
          />
          <Field
            label="What Happens After First Visit"
            textarea
            value={extra.firstVisitAfter || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, firstVisitAfter: v } as ClinicInfo)}
          />

          <div className="pt-2 border-t border-stone-800 space-y-3">
            <h4 className="text-xs font-bold text-stone-300">First Visit 3-Step Cards</h4>
            {firstVisitList.map((s, i) => (
              <div key={i} className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-2">
                <Field
                  label="Step Title"
                  value={s.title || ''}
                  onChange={(v) => {
                    const next = [...firstVisitList];
                    next[i] = { ...s, title: v };
                    onUpdateClinic({ ...clinic, customFirstVisitSteps: next });
                  }}
                />
                <Field
                  label="Step Description"
                  textarea
                  value={s.description || ''}
                  onChange={(v) => {
                    const next = [...firstVisitList];
                    next[i] = { ...s, description: v };
                    onUpdateClinic({ ...clinic, customFirstVisitSteps: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: INSURANCE & PAYMENT */}
      {(activeCategory === 'all' || activeCategory === 'insurance') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Accepted Insurances ({insuranceList.length})</span>
              </h3>
              <p className="text-[11px] text-stone-400">List of insurance providers and payment policies.</p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() => onUpdateClinic({ ...clinic, customInsurances: [...insuranceList, 'New Insurer'] })}
            >
              + Add Insurer
            </button>
          </div>

          <Field
            label="Section Title"
            value={clinic.insuranceTitle || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, insuranceTitle: v })}
          />
          <Field
            label="Subtitle / Insurance Policy Note"
            textarea
            value={clinic.insuranceSubtitle || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, insuranceSubtitle: v })}
          />

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

      {/* SECTION: WHY CHOOSE US & PILLARS */}
      {(activeCategory === 'all' || activeCategory === 'why-us') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-3">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Why Choose Us Pillars</span>
            </h3>
          </div>
          <Field label="Section title" value={clinic.whyUsTitle || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsTitle: v })} />
          <Field label="Pillar 1 title" value={clinic.whyUsPillar1Title || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar1Title: v })} />
          <Field label="Pillar 1 text" textarea value={clinic.whyUsPillar1Desc || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar1Desc: v })} />
          <Field label="Pillar 2 title" value={clinic.whyUsPillar2Title || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar2Title: v })} />
          <Field label="Pillar 2 text" textarea value={clinic.whyUsPillar2Desc || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar2Desc: v })} />
          <Field label="Pillar 3 title" value={clinic.whyUsPillar3Title || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar3Title: v })} />
          <Field label="Pillar 3 text" textarea value={clinic.whyUsPillar3Desc || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar3Desc: v })} />
        </div>
      )}

      {/* SECTION: PRICING & FEES */}
      {(activeCategory === 'all' || activeCategory === 'pricing') && (
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
            onChange={(v) => onUpdateClinic({ ...clinic, examFee: v } as ClinicInfo)}
          />
          <Field
            label="Follow-up Visit Fee (e.g. $45 Follow-up)"
            value={(clinic as ClinicInfo & { followUpFee?: string }).followUpFee || ''}
            onChange={(v) => onUpdateClinic({ ...clinic, followUpFee: v } as ClinicInfo)}
          />
        </div>
      )}

      {/* SECTION: DIRECT PHOTO URLS */}
      {(activeCategory === 'all' || activeCategory === 'images') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-3">
          <div className="border-b border-stone-800 pb-2">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Direct Photo URLs</span>
            </h3>
          </div>
          <Field
            label="Hero Background Image URL"
            value={typeof clinic.heroImage === 'string' ? clinic.heroImage : ''}
            onChange={(v) => onUpdateClinic({ ...clinic, heroImage: v })}
          />
          <Field
            label="Doctor Portrait Image URL"
            value={typeof clinic.doctorImage === 'string' ? clinic.doctorImage : ''}
            onChange={(v) => onUpdateClinic({ ...clinic, doctorImage: v })}
          />
          <Field
            label="Clinic Interior Photo URL"
            value={typeof clinic.clinicImage === 'string' ? clinic.clinicImage : ''}
            onChange={(v) => onUpdateClinic({ ...clinic, clinicImage: v })}
          />
        </div>
      )}

      {/* SECTION: BLOG POSTS */}
      {(activeCategory === 'all' || activeCategory === 'blog') && (
        <div className="p-4 bg-stone-850 border border-stone-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Practice Blog & Patient Education</span>
              </h3>
            </div>
            <button
              type="button"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              onClick={() => {
                const posts =
                  ((clinic as ClinicInfo & { customPosts?: { slug: string; title: string; body?: string }[] }).customPosts) ||
                  [];
                onUpdateClinic({
                  ...clinic,
                  customPosts: [
                    ...posts,
                    { slug: `post-${Date.now()}`, title: 'New Article', excerpt: '', body: 'Write the post content here.' },
                  ],
                } as ClinicInfo);
              }}
            >
              + Add Post
            </button>
          </div>

          <div className="space-y-3">
            {(((clinic as ClinicInfo & { customPosts?: { slug: string; title: string; date?: string; excerpt?: string; body?: string }[] }).customPosts) || []).map((p, i) => {
              const posts = ((clinic as ClinicInfo & { customPosts?: typeof p[] }).customPosts) || [];
              return (
                <div key={p.slug || i} className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-300">Article #{i + 1}</span>
                    <button
                      type="button"
                      className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                      onClick={() =>
                        onUpdateClinic({
                          ...clinic,
                          customPosts: posts.filter((_, idx) => idx !== i),
                        } as ClinicInfo)
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <Field
                    label="Article Title"
                    value={p.title}
                    onChange={(title) => {
                      const next = [...posts];
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || p.slug;
                      next[i] = { ...p, title, slug };
                      onUpdateClinic({ ...clinic, customPosts: next } as ClinicInfo);
                    }}
                  />
                  <Field
                    label="Excerpt"
                    value={p.excerpt || ''}
                    onChange={(excerpt) => {
                      const next = [...posts];
                      next[i] = { ...p, excerpt };
                      onUpdateClinic({ ...clinic, customPosts: next } as ClinicInfo);
                    }}
                  />
                  <Field
                    label="Full Body"
                    textarea
                    value={p.body || ''}
                    onChange={(body) => {
                      const next = [...posts];
                      next[i] = { ...p, body };
                      onUpdateClinic({ ...clinic, customPosts: next } as ClinicInfo);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}