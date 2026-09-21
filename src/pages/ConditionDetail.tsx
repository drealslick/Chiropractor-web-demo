import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ConditionDetail() {
  const { conditionId } = useParams<{ conditionId: string }>();
  const { clinicData: clinic } = useClinic();
  const list = clinic.customConditions?.length ? clinic.customConditions : conditionsData;

  const condition = list.find((item, i) => {
    const id = item.id || slugify(item.title || `condition-${i}`);
    return id === conditionId;
  });

  if (!condition) {
    return (
      <div className="py-16 text-center space-y-4 max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-stone-900">Condition Not Found</h1>
        <Link to="/conditions" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg">
          ← Back to All Conditions
        </Link>
      </div>
    );
  }

  const symptoms = Array.isArray(condition.symptoms) ? condition.symptoms : [];

  return (
    <div className="py-10 px-4 max-w-4xl mx-auto space-y-8">
      <Link to="/conditions" className="text-sm font-semibold text-emerald-600">
        ← Back to All Conditions
      </Link>

      <section className="space-y-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Specialized Treatment
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">{condition.title}</h1>
        <p className="text-lg text-stone-600 leading-relaxed">{condition.description}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 bg-white border border-stone-200 rounded-2xl">
          <h2 className="font-bold text-xl text-stone-900 mb-3">Common Symptoms</h2>
          {symptoms.length ? (
            <ul className="space-y-2">
              {symptoms.map((symptom, idx) => (
                <li key={idx} className="text-sm text-stone-600">
                  • {typeof symptom === 'string' ? symptom : String(symptom)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">Details provided during consultation.</p>
          )}
        </div>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <h2 className="font-bold text-xl text-stone-900 mb-3">Our Clinical Approach</h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            Care at {clinic.name} in {clinic.cityState || clinic.city}.
          </p>
        </div>
      </div>

      <div className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-4">
        <h3 className="text-2xl font-bold">Ready to start?</h3>
        <p className="text-stone-300 text-sm max-w-md mx-auto">
          {clinic.offerHeadline || `Book with ${clinic.name}`}
        </p>
        <Link to="/" className="inline-block bg-emerald-500 text-stone-950 font-bold px-6 py-3 rounded-lg">
          {clinic.offerCtaText || 'Book from the homepage'}
        </Link>
      </div>
    </div>
  );
}