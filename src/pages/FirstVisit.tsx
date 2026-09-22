import React from 'react';
import { useClinic } from '../data/ClinicContext';
import { firstVisitSteps, processSteps } from '../data/clinicData';

export default function FirstVisit() {
  const { clinicData: clinic } = useClinic();
  const extra = clinic as typeof clinic & {
    firstVisitDuration?: string;
    firstVisitBring?: string;
    firstVisitWear?: string;
    firstVisitAfter?: string;
    firstVisitForms?: string;
  };

  const steps = clinic.customFirstVisitSteps?.length
    ? clinic.customFirstVisitSteps
    : clinic.customProcessSteps?.length
      ? clinic.customProcessSteps
      : firstVisitSteps.length
        ? firstVisitSteps
        : processSteps;

  return (
    <div className="space-y-12 py-10 px-4 max-w-5xl mx-auto">
      <section className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
          {clinic.firstVisitSubtitle || 'What to expect'}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">
          {clinic.firstVisitTitle || 'Your first visit'}
        </h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          {extra.firstVisitDuration ||
            `Plan about 45–60 minutes at ${clinic.name}. You’ll leave with a clear plan, not a sales pitch.`}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div key={`${step.number}-${i}`} className="p-5 bg-white border border-stone-200 rounded-xl">
            <span className="text-xs font-bold text-emerald-700 uppercase">
              {String(step.number || `0${i + 1}`)}
            </span>
            <h3 className="font-semibold text-lg text-stone-900 mt-1">{step.title}</h3>
            <p className="text-sm text-stone-500 mt-2">{step.description}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-stone-200 rounded-2xl space-y-3">
          <h2 className="text-xl font-bold text-stone-900">Before you arrive</h2>
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-stone-900">Bring: </span>
            {extra.firstVisitBring || 'Photo ID, insurance card if you have one, and a list of current medications.'}
          </p>
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-stone-900">Wear: </span>
            {extra.firstVisitWear || 'Comfortable clothes you can move in. Avoid restrictive dresses or suits.'}
          </p>
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-stone-900">Forms: </span>
            {extra.firstVisitForms || 'If we sent intake forms, complete them before you arrive so the visit stays on time.'}
          </p>
        </div>
        <div className="p-6 bg-white border border-stone-200 rounded-2xl space-y-3">
          <h2 className="text-xl font-bold text-stone-900">Getting here</h2>
          <p className="text-sm text-stone-600">
            {clinic.address}
            {clinic.cityState ? `, ${clinic.cityState}` : ''}
            {clinic.zip ? ` ${clinic.zip}` : ''}
          </p>
          <p className="text-sm text-stone-600">{clinic.hoursWeekday}</p>
          <p className="text-sm text-stone-600">{clinic.hoursSaturday}</p>
          <p className="text-sm text-stone-600">{clinic.parkingNote || 'Parking details when you book.'}</p>
        </div>
      </section>

      <section className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
        <h2 className="text-xl font-bold text-stone-900">After the visit</h2>
        <p className="text-sm text-stone-700">
          {extra.firstVisitAfter ||
            'You’ll know what we found, what we recommend, how long it usually takes, and what it costs before you commit to a plan.'}
        </p>
      </section>

      <section className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-4">
        <h2 className="text-2xl font-bold">{clinic.offerHeadline || 'Book the first visit'}</h2>
        <p className="text-stone-300 text-sm">{clinic.offerSubtext || `Call ${clinic.phone}`}</p>
        {clinic.externalBookingUrl ? (
          <a
            href={clinic.externalBookingUrl}
            className="inline-block bg-emerald-500 text-stone-950 font-bold px-6 py-3 rounded-lg"
          >
            {clinic.offerCtaText || 'Book now'}
          </a>
        ) : (
          <a
            href={`tel:${clinic.phoneRaw || clinic.phone}`}
            className="inline-block bg-emerald-500 text-stone-950 font-bold px-6 py-3 rounded-lg"
          >
            Call {clinic.phone}
          </a>
        )}
      </section>
    </div>
  );
}