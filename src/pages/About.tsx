import React from 'react';
import { useClinic } from '../data/ClinicContext';

export default function About() {
  const { clinicData: clinic } = useClinic();
  const extra = clinic as typeof clinic & {
    aboutMission?: string;
    aboutApproach?: string;
    aboutStory?: string;
    aboutEducation?: string;
    aboutCertification?: string;
  };

  return (
    <div className="space-y-12 py-10 px-4 max-w-5xl mx-auto">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white p-8 border border-stone-200 rounded-2xl">
        <div className="md:col-span-1">
          <img
            src={clinic.doctorImage}
            alt={clinic.doctorName}
            className="w-full h-72 object-cover rounded-xl border border-stone-100"
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lead practitioner</span>
          <h1 className="text-3xl font-bold text-stone-900">
            {clinic.doctorName}
            {clinic.doctorCredentials ? `, ${clinic.doctorCredentials}` : ''}
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            {clinic.doctorQuote ||
              `${clinic.doctorYears || '10'}+ years at ${clinic.name} in ${clinic.cityState || clinic.city}.`}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-stone-500 border-t border-stone-100">
            <div>
              <span className="font-bold text-stone-800 block">Education</span>
              {extra.aboutEducation || clinic.doctorCredentials || 'Chiropractic doctorate'}
            </div>
            <div>
              <span className="font-bold text-stone-800 block">Focus</span>
              {clinic.cityState || clinic.city}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-stone-200 rounded-2xl space-y-2">
          <h2 className="text-xl font-bold text-stone-900">How we work</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {extra.aboutApproach ||
              clinic.whyUsPillar2Desc ||
              'Listen first, examine properly, then give you a plan with a timeline and a cost.'}
          </p>
        </div>
        <div className="p-6 bg-white border border-stone-200 rounded-2xl space-y-2">
          <h2 className="text-xl font-bold text-stone-900">Why this practice</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {extra.aboutMission ||
              clinic.whyUsTitle ||
              `Private care at ${clinic.name} without rushed visits or long contracts.`}
          </p>
        </div>
      </section>

      <section className="p-6 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
        <h2 className="text-xl font-bold text-stone-900">A short story</h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          {extra.aboutStory ||
            clinic.doctorQuote ||
            `${clinic.doctorName} built ${clinic.name} for people who want a clear diagnosis and a way back to normal training and work.`}
        </p>
      </section>

            {(clinic.clinicImage || clinic.heroImage) && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">The clinic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[clinic.clinicImage, clinic.heroImage].filter(Boolean).map((src, i) => (
              <img
                key={i}
                src={src as string}
                alt={`${clinic.name} clinic`}
                className="w-full h-52 object-cover rounded-xl border border-stone-200"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}