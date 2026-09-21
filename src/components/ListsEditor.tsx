import React from 'react';
import { ClinicInfo, ProblemCondition, PatientTestimonial } from '../types';
import { conditionsData, faqs, testimonials } from '../data/clinicData';

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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-stone-200 text-base">Reviews</h3>
        <p className="text-xs text-stone-400 mb-3">Quote cards on the homepage Patients section.</p>
        {reviewList.map((r, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
            <textarea
              rows={3}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={r.quote || ''}
              placeholder="Quote"
              onChange={(e) => {
                const next = [...reviewList];
                next[i] = { ...r, quote: e.target.value };
                onUpdateClinic({ ...clinic, customTestimonials: next });
              }}
            />
            <input
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={r.author || ''}
              placeholder="Name"
              onChange={(e) => {
                const next = [...reviewList];
                next[i] = { ...r, author: e.target.value };
                onUpdateClinic({ ...clinic, customTestimonials: next });
              }}
            />
            <input
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={r.condition || ''}
              placeholder="Condition label"
              onChange={(e) => {
                const next = [...reviewList];
                next[i] = { ...r, condition: e.target.value };
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
              customTestimonials: [
                ...reviewList,
                { quote: 'New review', author: 'Patient', rating: 5, condition: '' },
              ],
            })
          }
        >
          + Add review
        </button>
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">Featured patient story</h3>
        <p className="text-xs text-stone-400 mb-3">The bigger case study under the quote cards.</p>
        <input
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          value={clinic.patientStoryName || ''}
          placeholder="Patient name"
          onChange={(e) => onUpdateClinic({ ...clinic, patientStoryName: e.target.value })}
        />
        <textarea
          rows={3}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          value={clinic.patientStorySummary || ''}
          placeholder="Summary"
          onChange={(e) => onUpdateClinic({ ...clinic, patientStorySummary: e.target.value })}
        />
        <textarea
          rows={2}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200 mb-2"
          value={clinic.patientStoryTimeline || ''}
          placeholder="Timeline"
          onChange={(e) => onUpdateClinic({ ...clinic, patientStoryTimeline: e.target.value })}
        />
        <input
          className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
          value={clinic.patientStoryOutcome || ''}
          placeholder="Outcome"
          onChange={(e) => onUpdateClinic({ ...clinic, patientStoryOutcome: e.target.value })}
        />
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">FAQs</h3>
        <p className="text-xs text-stone-400 mb-3">Edit the questions patients see on the homepage. Add or remove freely.</p>
        {faqList.map((f, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
            <input
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={f.q}
              placeholder="Question"
              onChange={(e) => {
                const next = [...faqList];
                next[i] = { ...f, q: e.target.value };
                onUpdateClinic({ ...clinic, customFaqs: next });
              }}
            />
            <textarea
              rows={3}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={f.a}
              placeholder="Answer"
              onChange={(e) => {
                const next = [...faqList];
                next[i] = { ...f, a: e.target.value };
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
          onClick={() =>
            onUpdateClinic({
              ...clinic,
              customFaqs: [...faqList, { q: 'New question', a: 'Answer' }],
            })
          }
        >
          + Add FAQ
        </button>
      </div>

      <div>
        <h3 className="font-bold text-stone-200 text-base">Conditions</h3>
        <p className="text-xs text-stone-400 mb-3">These cards drive the conditions section on the homepage.</p>
        {condList.map((c, i) => (
          <div key={c.id || i} className="mb-3 p-3 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
            <input
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={c.title || ''}
              placeholder="Condition title"
              onChange={(e) => {
                const next = [...condList];
                next[i] = { ...c, title: e.target.value };
                onUpdateClinic({ ...clinic, customConditions: next });
              }}
            />
            <textarea
              rows={2}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
              value={c.description || ''}
              placeholder="Short description"
              onChange={(e) => {
                const next = [...condList];
                next[i] = { ...c, description: e.target.value };
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