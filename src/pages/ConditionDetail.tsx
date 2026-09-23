import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ConditionDetail() {
  const { conditionId } = useParams<{ conditionId: string }>();
  const { clinicData: clinic, openBookingModal } = useClinic();
  const list = clinic.customConditions?.length ? clinic.customConditions : conditionsData;

  const condition = list.find((c) => {
    const slug = slugify(c.title || c.id || '');
    return slug === conditionId || c.id === conditionId;
  });

  if (!condition) {
    return (
      <div className="py-16 text-center space-y-4 max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-stone-900">Condition not found</h1>
        <Link to="/conditions" className="text-emerald-700 font-semibold">
          ← All conditions
        </Link>
      </div>
    );
  }

  const extra = condition as typeof condition & { treatment?: string };
  const symptoms = condition.symptoms?.length ? condition.symptoms : [];

  return (
    <div className="py-10 px-4 max-w-4xl mx-auto space-y-8">
      <Link to="/conditions" className="text-sm font-semibold text-emerald-700">
        ← All conditions
      </Link>

      <section className="space-y-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
          {clinic.name}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">{condition.title}</h1>
        <p className="text-lg text-stone-600 leading-relaxed">{condition.description}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-stone-200 rounded-2xl">
          <h2 className="font-bold text-xl text-stone-900 mb-3">Common signs</h2>
          {symptoms.length ? (
            <ul className="space-y-2">
              {symptoms.map((s) => (
                <li key={s} className="text-sm text-stone-600">
                  • {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-600">We’ll confirm this on examination, not from a web form.</p>
          )}
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <h2 className="font-bold text-xl text-stone-900 mb-3">How we treat it</h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            {condition.howWeHelp ||
              `Care at ${clinic.name} in ${clinic.cityState || clinic.city}.`}
          </p>
        </div>
      </div>

      <div className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-4">
        <h3 className="text-2xl font-bold">Start with an exam</h3>
        <p className="text-stone-300 text-sm">{clinic.offerSubtext || `Initial comprehensive consultation and spinal examination.`}</p>
        <button
          type="button"
          onClick={() => openBookingModal(condition.title)}
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer"
        >
          {clinic.offerCtaText || `Request Exam for ${condition.title}`}
        </button>
      </div>
    </div>
  );
}