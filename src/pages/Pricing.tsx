import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { defaultPricingFees } from '../data/defaultPricingFees';
import { isExplicitDemo, isUnconfiguredMode } from '../lib/mode';
import type { PricingFeeItem } from '../types';

export default function Pricing() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const demo = isExplicitDemo() || isUnconfiguredMode();
  const demoSymbol = clinic.currencySymbol || '
  const fees: PricingFeeItem[] = clinic.customFeeItems?.length
    ? clinic.customFeeItems
    : demo ? defaultPricingFees.map((fee, index) => ({
        ...fee,
        price: formatSampleFee(index === 0 ? (clinic.examFee || fee.price) : index === 1 ? (clinic.followUpFee || fee.price) : fee.price),
      }))
      : [
          ...(clinic.examFee ? [{ id: 'initial', title: 'Initial visit', price: clinic.examFee, description: 'Initial consultation and assessment', features: [] }] : []),
          ...(clinic.followUpFee ? [{ id: 'follow-up', title: 'Follow-up visit', price: clinic.followUpFee, description: 'Follow-up appointment', features: [] }] : []),
        ];
  const insurers: string[] = clinic.customInsurances || [];
  const financing = clinic.financing;
  const faq = [
    { question: clinic.pricingFaq1q, answer: clinic.pricingFaq1a },
    { question: clinic.pricingFaq2q, answer: clinic.pricingFaq2a },
    { question: clinic.pricingFaq3q, answer: clinic.pricingFaq3a },
    { question: clinic.pricingFaq4q, answer: clinic.pricingFaq4a },
  ].filter((item) => item.question && item.answer);

  usePageMeta(clinic.pricingTitle || 'Fees & Payment',
    clinic.pricingSubtitle || 'Information about appointment fees, payment, and insurance.');

  return (
    <div className="page-v2 pv2-interior pv2-pricing">
      <div className="pv2-wrap">
        <header className="pv2-page-header">
          <span className="pv2-kicker">Planning your visit / Fees</span>
          <div className="pv2-page-header-grid">
            <h1>{clinic.pricingTitle || 'Fees, without the guesswork.'}</h1>
            <div className="pv2-header-aside">
              <p>{clinic.pricingSubtitle || 'An overview of appointment fees and ways to pay. Please contact the practice if you need help choosing an appointment.'}</p>
              <Link to="/first-visit" className="pv2-text-link">What to expect on your first visit ↗</Link>
            </div>
          </div>
        </header>
        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-fee-title">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">Appointments / 01</span>
            <h2 id="pv2-fee-title">The fee schedule.</h2>
            <p>Fees reflect the information configured by this practice. Confirm the details when booking.</p>
            {demo && !clinic.customFeeItems?.length && <p className="pv2-demo-note">Illustrative fees shown for this demonstration.</p>}
          </div>
          <div className="pv2-fee-table">
            {fees.length ? fees.map((fee) => (
              <div key={fee.id} className="pv2-fee-row">
                <div>
                  <h3>{fee.title}</h3>
                  {fee.description && <p>{fee.description}</p>}
                  {fee.features?.length > 0 && <details><summary>What's included</summary><ul>{fee.features.map((item, i) => <li key={i}>{item}</li>)}</ul></details>}
                </div>
                <strong>{fee.price}</strong>
              </div>
            )) : <div className="pv2-empty-state"><p>Appointment fees are being updated. Please contact the practice for current pricing.</p></div>}
            <button type="button" className="pv2-btn pv2-btn-primary" onClick={() => openBookingModal()}>Arrange an appointment ↗</button>
          </div>
        </section>
        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-payments-title">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">Payment and cover / 02</span>
            <h2 id="pv2-payments-title">A few practical things.</h2>
          </div>
          <div className="pv2-notes">
            {insurers.length > 0 && <>
              <h3>Insurance providers</h3>
              <p>Contact your insurer to confirm your eligibility and any approval required before the appointment.</p>
              <ul className="pv2-inline-list">{insurers.map((item) => <li key={item}>{item}</li>)}</ul>
            </>}
            {financing?.enabled && (financing.headline || financing.description || financing.provider) && <>
              <h3>{financing.headline || 'Payment plans'}</h3>
              {financing.provider && <p className="pv2-small-detail">{financing.provider}</p>}
              {financing.description && <p>{financing.description}</p>}
              {financing.terms && <p className="pv2-small-detail">{financing.terms}</p>}
            </>}
            {!insurers.length && !financing?.enabled && <p>For payment methods, insurance queries, or a full fee breakdown, please contact the practice.</p>}
            <Link to="/contact" className="pv2-text-link">Ask a question about fees ↗</Link>
          </div>
        </section>
        {faq.length > 0 && <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-pricing-faq">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">Questions / 03</span>
            <h2 id="pv2-pricing-faq">Things you might want to know.</h2>
          </div>
          <div className="pv2-detail-list">
            {faq.map((item, i) => <details key={i}>
              <summary>{item.question}</summary><p>{item.answer}</p>
            </details>)}
          </div>
        </section>}
        <section className="pv2-inline-cta">
          <div><span className="pv2-kicker">When you're ready</span><h2>Let's get you booked.</h2>
            <p>Start with a first appointment, or contact the clinic if you're unsure.</p>
          </div>
          <button type="button" onClick={() => openBookingModal()} className="pv2-btn pv2-btn-primary">Book an appointment ↗</button>
        </section>
      </div>
    </div>
  );
}
;
  const formatSampleFee = (price?: string) => demoSymbol + (String(price || '').match(/[\\d,.]+/)?.[0] || '—');
  const fees: PricingFeeItem[] = clinic.customFeeItems?.length
    ? clinic.customFeeItems
    : demo ? defaultPricingFees.map((fee, index) => ({
        ...fee,
        price: index === 0 ? (clinic.examFee || fee.price) : index === 1 ? (clinic.followUpFee || fee.price) : fee.price,
      }))
      : [
          ...(clinic.examFee ? [{ id: 'initial', title: 'Initial visit', price: clinic.examFee, description: 'Initial consultation and assessment', features: [] }] : []),
          ...(clinic.followUpFee ? [{ id: 'follow-up', title: 'Follow-up visit', price: clinic.followUpFee, description: 'Follow-up appointment', features: [] }] : []),
        ];
  const insurers: string[] = clinic.customInsurances || [];
  const financing = clinic.financing;
  const faq = [
    { question: clinic.pricingFaq1q, answer: clinic.pricingFaq1a },
    { question: clinic.pricingFaq2q, answer: clinic.pricingFaq2a },
    { question: clinic.pricingFaq3q, answer: clinic.pricingFaq3a },
    { question: clinic.pricingFaq4q, answer: clinic.pricingFaq4a },
  ].filter((item) => item.question && item.answer);

  usePageMeta(clinic.pricingTitle || 'Fees & Payment',
    clinic.pricingSubtitle || 'Information about appointment fees, payment, and insurance.');

  return (
    <div className="page-v2 pv2-interior pv2-pricing">
      <div className="pv2-wrap">
        <header className="pv2-page-header">
          <span className="pv2-kicker">Planning your visit / Fees</span>
          <div className="pv2-page-header-grid">
            <h1>{clinic.pricingTitle || 'Fees, without the guesswork.'}</h1>
            <div className="pv2-header-aside">
              <p>{clinic.pricingSubtitle || 'An overview of appointment fees and ways to pay. Please contact the practice if you need help choosing an appointment.'}</p>
              <Link to="/first-visit" className="pv2-text-link">What to expect on your first visit ↗</Link>
            </div>
          </div>
        </header>
        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-fee-title">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">Appointments / 01</span>
            <h2 id="pv2-fee-title">The fee schedule.</h2>
            <p>Fees reflect the information configured by this practice. Confirm the details when booking.</p>
            {demo && !clinic.customFeeItems?.length && <p className="pv2-demo-note">Illustrative fees shown for this demonstration.</p>}
          </div>
          <div className="pv2-fee-table">
            {fees.length ? fees.map((fee) => (
              <div key={fee.id} className="pv2-fee-row">
                <div>
                  <h3>{fee.title}</h3>
                  {fee.description && <p>{fee.description}</p>}
                  {fee.features?.length > 0 && <details><summary>What's included</summary><ul>{fee.features.map((item, i) => <li key={i}>{item}</li>)}</ul></details>}
                </div>
                <strong>{fee.price}</strong>
              </div>
            )) : <div className="pv2-empty-state"><p>Appointment fees are being updated. Please contact the practice for current pricing.</p></div>}
            <button type="button" className="pv2-btn pv2-btn-primary" onClick={() => openBookingModal()}>Arrange an appointment ↗</button>
          </div>
        </section>
        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-payments-title">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">Payment and cover / 02</span>
            <h2 id="pv2-payments-title">A few practical things.</h2>
          </div>
          <div className="pv2-notes">
            {insurers.length > 0 && <>
              <h3>Insurance providers</h3>
              <p>Contact your insurer to confirm your eligibility and any approval required before the appointment.</p>
              <ul className="pv2-inline-list">{insurers.map((item) => <li key={item}>{item}</li>)}</ul>
            </>}
            {financing?.enabled && (financing.headline || financing.description || financing.provider) && <>
              <h3>{financing.headline || 'Payment plans'}</h3>
              {financing.provider && <p className="pv2-small-detail">{financing.provider}</p>}
              {financing.description && <p>{financing.description}</p>}
              {financing.terms && <p className="pv2-small-detail">{financing.terms}</p>}
            </>}
            {!insurers.length && !financing?.enabled && <p>For payment methods, insurance queries, or a full fee breakdown, please contact the practice.</p>}
            <Link to="/contact" className="pv2-text-link">Ask a question about fees ↗</Link>
          </div>
        </section>
        {faq.length > 0 && <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-pricing-faq">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">Questions / 03</span>
            <h2 id="pv2-pricing-faq">Things you might want to know.</h2>
          </div>
          <div className="pv2-detail-list">
            {faq.map((item, i) => <details key={i}>
              <summary>{item.question}</summary><p>{item.answer}</p>
            </details>)}
          </div>
        </section>}
        <section className="pv2-inline-cta">
          <div><span className="pv2-kicker">When you're ready</span><h2>Let's get you booked.</h2>
            <p>Start with a first appointment, or contact the clinic if you're unsure.</p>
          </div>
          <button type="button" onClick={() => openBookingModal()} className="pv2-btn pv2-btn-primary">Book an appointment ↗</button>
        </section>
      </div>
    </div>
  );
}
