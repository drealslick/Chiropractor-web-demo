import React from 'react';
import { useClinic } from '../data/ClinicContext';

export default function About() {
  const { clinicData: clinic } = useClinic();

  return (
    <div className="space-y-12 py-8 px-4 max-w-5xl mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white p-8 border border-stone-200 rounded-2xl shadow-sm">
        <div className="md:col-span-1">
          <img
            src={clinic.doctorImage}
            alt={clinic.doctorName}
            className="w-full h-72 object-cover rounded-xl border border-stone-100"
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lead Practitioner</span>
          <h1 className="text-3xl font-bold text-stone-900">
            {clinic.doctorName}
            {clinic.doctorCredentials ? `, ${clinic.doctorCredentials}` : ''}
          </h1>
          <p className="text-stone-600 leading-relaxed text-sm">
            {clinic.doctorQuote ||
              `With over ${clinic.doctorYears || '10'} years of clinical experience at ${clinic.name}.`}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-stone-500 border-t border-stone-100">
            <div>
              <span className="font-bold text-stone-800 block">Practice</span>
              {clinic.name}
            </div>
            <div>
              <span className="font-bold text-stone-800 block">Location</span>
              {clinic.cityState || clinic.city}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Inside Our Practice</h2>
        <p className="text-stone-600 text-sm">{clinic.clinicQuoteDescription || clinic.tagline}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[clinic.clinicImage, clinic.heroImage, clinic.doctorImage].filter(Boolean).map((src, i) => (
            <img
              key={i}
              src={src as string}
              alt={`${clinic.name} clinic`}
              className="w-full h-48 object-cover rounded-xl border border-stone-200"
            />
          ))}
        </div>
      </section>
    </div>
  );
}