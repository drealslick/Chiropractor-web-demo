import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Conditions() {
  const { clinicData: clinic } = useClinic();
  const extra = clinic as typeof clinic & { conditionsIntro?: string };
  const list = clinic.customConditions?.length ? clinic.customConditions : conditionsData;

  return (
    <div className="space-y-12 py-10 px-4 max-w-6xl mx-auto">
      <section className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          {clinic.conditionsSubtitle || 'Specialized care'}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">
          {clinic.conditionsTitle || 'Conditions we treat'}
        </h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          {extra.conditionsIntro ||
            clinic.conditionsSubtitle ||
            `${clinic.name} treats the problems that actually walk in the door — not a generic menu.`}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((item, i) => {
          const slug = slugify(item.title || item.id || `condition-${i}`);
          return (
            <Link
              key={item.id || slug}
              to={`/conditions/${slug}`}
              className="block p-6 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition group"
            >
              <h3 className="text-xl font-semibold text-stone-900 group-hover:text-emerald-700 mb-2">
                {item.title} →
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">{item.description}</p>
              {item.symptoms?.length ? (
                <p className="text-xs text-stone-400 mt-3">
                  {item.symptoms.slice(0, 3).join(' · ')}
                </p>
              ) : null}
            </Link>
          );
        })}
      </section>

      <section className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-3">
        <h2 className="text-2xl font-bold">Not sure which applies?</h2>
        <p className="text-stone-300 text-sm">Describe it on the first visit. We’ll examine before we label it.</p>
        <Link to="/first-visit" className="inline-block bg-emerald-500 text-stone-950 font-bold px-6 py-3 rounded-lg">
          First visit guide
        </Link>
      </section>
    </div>
  );
}