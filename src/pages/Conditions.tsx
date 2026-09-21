import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Conditions() {
  const { clinicData: clinic } = useClinic();
  const list = (clinic.customConditions && clinic.customConditions.length
    ? clinic.customConditions
    : conditionsData
  ).map((item, i) => ({
    id: item.id || slugify(item.title || `condition-${i}`),
    title: item.title,
    desc: item.description,
  }));

  return (
    <div className="space-y-10 py-8 px-4 max-w-6xl mx-auto">
      <section className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Specialized Care</span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">
          {clinic.conditionsTitle || 'Conditions We Treat'}
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          {clinic.conditionsSubtitle || clinic.tagline}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((item) => (
          <Link
            key={item.id}
            to={`/conditions/${item.id}`}
            className="block p-6 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition group"
          >
            <h3 className="text-xl font-semibold text-stone-900 group-hover:text-emerald-600 transition mb-2">
              {item.title} →
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}