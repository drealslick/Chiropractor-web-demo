import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';

export default function Pricing() {
  const { clinicData: clinic } = useClinic();
  const extra = clinic as typeof clinic & {
    customInsurances?: string[];
    pricingTitle?: string;
    pricingSubtitle?: string;
    examFee?: string;
    examFeeNote?: string;
    followUpFee?: string;
    followUpFeeNote?: string;
    pricingFaq1q?: string;
    pricingFaq1a?: string;
    pricingFaq2q?: string;
    pricingFaq2a?: string;
    pricingFaq3q?: string;
    pricingFaq3a?: string;
  };

  const insurers = extra.customInsurances?.length
    ? extra.customInsurances
    : ['Most major insurers', 'HSA / FSA', 'Cash-pay'];

  const faqs = [
    {
      q: extra.pricingFaq1q || 'Do I need a referral?',
      a: extra.pricingFaq1a || 'Usually no. Call if your insurer requires one.',
    },
    {
      q: extra.pricingFaq2q || 'Will you surprise me with extras?',
      a: extra.pricingFaq2a || 'No. You get the plan and the cost before you continue.',
    },
    {
      q: extra.pricingFaq3q || 'Can I use insurance?',
      a: extra.pricingFaq3a ||
        (clinic.insuranceSubtitle || 'We can check benefits when you book. Cash-pay is always available.'),
    },
  ];

  return (
    <div className="space-y-12 py-10 px-4 max-w-5xl mx-auto">
      <section className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Fees & cover</span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900">
          {extra.pricingTitle || 'Pricing, insurance & financing'}
        </h1>
        <p className="text-stone-600 max-w-xl mx-auto">
          {extra.pricingSubtitle ||
            extra.insuranceSubtitle ||
            `Clear fees at ${clinic.name}. Confirm cover when you book.`}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-stone-200 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New patient</p>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {extra.examFee || clinic.offerHeadline || 'Initial exam'}
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            {extra.examFeeNote || clinic.offerSubtext || 'Assessment and a written plan on visit one.'}
          </p>
        </div>
        <div className="p-6 bg-white border border-stone-200 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Follow-up</p>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-2">
            {extra.followUpFee || 'Quoted after the exam'}
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            {extra.followUpFeeNote || 'No packages you have to buy today. Frequency is based on the exam.'}
          </p>
        </div>
      </section>

      <section className="p-6 bg-white border border-stone-200 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-stone-900">{clinic.insuranceTitle || 'Insurance & payment'}</h2>
        <p className="text-sm text-stone-600">
          {clinic.insuranceSubtitle || 'We can check benefits when you call.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {insurers.map((name) => (
            <span key={name} className="text-xs px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
              {name}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">Cost questions</h2>
        {faqs.map((f) => (
          <div key={f.q} className="p-4 bg-white border border-stone-200 rounded-xl">
            <p className="font-semibold text-stone-900 text-sm">{f.q}</p>
            <p className="text-sm text-stone-600 mt-1">{f.a}</p>
          </div>
        ))}
      </section>

      <section className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Questions about cost?</h2>
        <p className="text-stone-300 text-sm">Call {clinic.phone} before you book.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`tel:${clinic.phoneRaw || clinic.phone}`}
            className="inline-block bg-emerald-500 text-stone-950 font-bold px-6 py-3 rounded-lg"
          >
            Call {clinic.phone}
          </a>
          <Link to="/first-visit" className="inline-block bg-stone-800 font-bold px-6 py-3 rounded-lg">
            First visit guide
          </Link>
        </div>
      </section>
    </div>
  );
}