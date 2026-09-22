import React from 'react';
import { ClinicInfo, ProblemCondition, PatientTestimonial, ProcessStep } from '../types';
import {
  conditionsData,
  faqs,
  testimonials,
  processSteps,
  firstVisitSteps,
} from '../data/clinicData';

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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-stone-200 text-base">First visit page</h3>
        <p className="text-xs text-stone-400 mb-3">Copy on /first-visit besides the step cards.</p>
        <input
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          placeholder="Page title"
          value={clinic.firstVisitTitle || ''}
          onChange={(e) => onUpdateClinic({ ...clinic, firstVisitTitle: e.target.value })}
        />
        <input
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          placeholder="How long the visit takes"
          value={extra.firstVisitDuration || ''}
          onChange={(e) => onUpdateClinic({ ...clinic, firstVisitDuration: e.target.value } as ClinicInfo)}
        />
        <textarea
          rows={2}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          placeholder="What to bring"
          value={extra.firstVisitBring || ''}
          onChange={(e) => onUpdateClinic({ ...clinic, firstVisitBring: e.target.value } as ClinicInfo)}
        />
        <textarea
          rows={2}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          placeholder="What to wear"
          value={extra.firstVisitWear || ''}
          onChange={(e) => onUpdateClinic({ ...clinic, firstVisitWear: e.target.value } as ClinicInfo)}
        />
        <textarea
          rows={2}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          placeholder="Forms / intake"
          value={extra.firstVisitForms || ''}
          onChange={(e) => onUpdateClinic({ ...clinic, firstVisitForms: e.target.value } as ClinicInfo)}
        />
        <textarea
          rows={2}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
          placeholder="What happens after"
          value={extra.firstVisitAfter || ''}
          onChange={(e) => onUpdateClinic({ ...clinic, firstVisitAfter: e.target.value } as ClinicInfo)}
        />
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">FAQs</h3>
        <p className="text-xs text-stone-400 mb-3">Paste image URLs. Local uploads can wait.</p>
        <Field
          label="Hero image URL"
          value={typeof clinic.heroImage === 'string' ? clinic.heroImage : ''}
          onChange={(v) => onUpdateClinic({ ...clinic, heroImage: v })}
        />
        <Field
          label="Doctor photo URL"
          value={typeof clinic.doctorImage === 'string' ? clinic.doctorImage : ''}
          onChange={(v) => onUpdateClinic({ ...clinic, doctorImage: v })}
        />
        <Field
          label="Clinic photo URL"
          value={typeof clinic.clinicImage === 'string' ? clinic.clinicImage : ''}
          onChange={(v) => onUpdateClinic({ ...clinic, clinicImage: v })}
        />
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">Why Us</h3>
        <Field label="Section title" value={clinic.whyUsTitle || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsTitle: v })} />
        <Field label="Pillar 1 title" value={clinic.whyUsPillar1Title || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar1Title: v })} />
        <Field label="Pillar 1 text" textarea value={clinic.whyUsPillar1Desc || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar1Desc: v })} />
        <Field label="Pillar 2 title" value={clinic.whyUsPillar2Title || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar2Title: v })} />
        <Field label="Pillar 2 text" textarea value={clinic.whyUsPillar2Desc || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar2Desc: v })} />
        <Field label="Pillar 3 title" value={clinic.whyUsPillar3Title || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar3Title: v })} />
        <Field label="Pillar 3 text" textarea value={clinic.whyUsPillar3Desc || ''} onChange={(v) => onUpdateClinic({ ...clinic, whyUsPillar3Desc: v })} />
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">Process steps</h3>
        {processList.map((s, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
            <Field
              label="Number"
              value={String(s.number || '')}
              onChange={(v) => {
                const next = [...processList];
                next[i] = { ...s, number: v };
                onUpdateClinic({ ...clinic, customProcessSteps: next });
              }}
            />
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

      <div>
        <h3 className="font-bold text-stone-200 text-base">First visit steps</h3>
        {firstVisitList.map((s, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
            <Field
              label="Number"
              value={String(s.number || '')}
              onChange={(v) => {
                const next = [...firstVisitList];
                next[i] = { ...s, number: v };
                onUpdateClinic({ ...clinic, customFirstVisitSteps: next });
              }}
            />
            <Field
              label="Title"
              value={s.title || ''}
              onChange={(v) => {
                const next = [...firstVisitList];
                next[i] = { ...s, title: v };
                onUpdateClinic({ ...clinic, customFirstVisitSteps: next });
              }}
            />
            <Field
              label="Description"
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

      <div>
        <h3 className="font-bold text-stone-200 text-base">Insurance</h3>
        <Field
          label="Title"
          value={clinic.insuranceTitle || ''}
          onChange={(v) => onUpdateClinic({ ...clinic, insuranceTitle: v })}
        />
        <Field
          label="Subtitle"
          textarea
          value={clinic.insuranceSubtitle || ''}
          onChange={(v) => onUpdateClinic({ ...clinic, insuranceSubtitle: v })}
        />
        {insuranceList.map((name, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="flex-1 bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={name}
              onChange={(e) => {
                const next = [...insuranceList];
                next[i] = e.target.value;
                onUpdateClinic({ ...clinic, customInsurances: next });
              }}
            />
            <button
              type="button"
              className="text-[11px] text-red-400"
              onClick={() =>
                onUpdateClinic({
                  ...clinic,
                  customInsurances: insuranceList.filter((_, idx) => idx !== i),
                })
              }
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs text-emerald-400"
          onClick={() => onUpdateClinic({ ...clinic, customInsurances: [...insuranceList, 'New insurer'] })}
        >
          + Add insurer
        </button>
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">Reviews</h3>
        {reviewList.map((r, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
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
              label="Name"
              value={r.author || ''}
              onChange={(v) => {
                const next = [...reviewList];
                next[i] = { ...r, author: v };
                onUpdateClinic({ ...clinic, customTestimonials: next });
              }}
            />
            <button
              type="button"
              className="text-[11px] text-red-400"
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
        ))}
        <button
          type="button"
          className="text-xs text-emerald-400"
          onClick={() =>
            onUpdateClinic({
              ...clinic,
              customTestimonials: [...reviewList, { quote: 'New review', author: 'Patient', rating: 5 }],
            })
          }
        >
          + Add review
        </button>
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">Featured patient story</h3>
        <Field label="Name" value={clinic.patientStoryName || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStoryName: v })} />
        <Field label="Summary" textarea value={clinic.patientStorySummary || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStorySummary: v })} />
        <Field label="Timeline" textarea value={clinic.patientStoryTimeline || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStoryTimeline: v })} />
        <Field label="Outcome" value={clinic.patientStoryOutcome || ''} onChange={(v) => onUpdateClinic({ ...clinic, patientStoryOutcome: v })} />
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">FAQs</h3>
        {faqList.map((f, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
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
            <button
              type="button"
              className="text-[11px] text-red-400"
              onClick={() => onUpdateClinic({ ...clinic, customFaqs: faqList.filter((_, idx) => idx !== i) })}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs text-emerald-400"
          onClick={() => onUpdateClinic({ ...clinic, customFaqs: [...faqList, { q: 'New question', a: 'Answer' }] })}
        >
          + Add FAQ
        </button>
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">Conditions</h3>
        {condList.map((c, i) => (
          <div key={c.id || i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
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
              label="Description"
              textarea
              value={c.description || ''}
              onChange={(v) => {
                const next = [...condList];
                next[i] = { ...c, description: v };
                onUpdateClinic({ ...clinic, customConditions: next });
              }}
            />
            <button
              type="button"
              className="text-[11px] text-red-400"
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
        ))}
        <button
          type="button"
          className="text-xs text-emerald-400"
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
          + Add condition
        </button>
      </div>
    </div>
  );
}