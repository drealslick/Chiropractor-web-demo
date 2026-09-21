import React from 'react';
import { useClinic } from '../data/ClinicContext';
import { firstVisitSteps, processSteps } from '../data/clinicData';

export default function FirstVisit() {
  const { clinicData: clinic } = useClinic();
  const steps = clinic.customFirstVisitSteps?.length
    ? clinic.customFirstVisitSteps
    : clinic.customProcessSteps?.length
      ? clinic.customProcessSteps
      : firstVisitSteps.length
        ? firstVisitSteps
        : processSteps;

  return (
    <div className="space-y-12 py-8 px-4 max-w-5xl mx-auto">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900">
          {clinic.firstVisitTitle || 'Your First Visit Guide'}
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          {clinic.firstVisitSubtitle ||
            `Here is exactly what to expect at ${clinic.name}.`}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div
            key={`${step.number}-${i}`}
            className={`p-5 border rounded-xl ${
              i === 2 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'
            }`}
          >
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {String(step.number || `Step ${i + 1}`)}
            </span>
            <h3 className="font-semibold text-lg text-stone-900 mt-1">{step.title}</h3>
            <p className="text-sm text-stone-500 mt-2">{step.description}</p>
          </div>
        ))}
      </section>

      <section className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Save Time Before You Arrive</h2>
        <p className="text-stone-300 max-w-lg mx-auto text-sm">
          Call {clinic.phone} or book from the homepage so the team can prepare for your visit.
        </p>
        <a
          href={`tel:${clinic.phoneRaw || clinic.phone}`}
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold px-6 py-3 rounded-lg transition"
        >
          Call {clinic.phone}
        </a>
      </section>
    </div>
  );
}