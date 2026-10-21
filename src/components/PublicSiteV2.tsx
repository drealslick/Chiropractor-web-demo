import React from 'react';
import { Link } from 'react-router-dom';
import type { ClinicInfo, ProblemCondition } from '../types';
import { conditionsData, firstVisitSteps } from '../data/clinicData';

type BookAction = () => void;

interface PublicSectionProps {
  clinic: ClinicInfo;
  onBookClick: BookAction;
}

const conditionSlug = (condition: ProblemCondition) =>
  condition.slug || condition.id || (condition.title || 'care').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function PracticeHero({ clinic, onBookClick }: PublicSectionProps) {
  const location = clinic.cityState || clinic.city || 'your neighbourhood';
  return (
    <section className="pv2-hero" aria-labelledby="practice-hero-title">
      <div className="pv2-wrap pv2-hero-grid">
        <div className="pv2-hero-copy">
          <div className="pv2-hero-overline"><span className="pv2-rule" aria-hidden="true" /> {clinic.heroBadge || 'A different kind of first visit'}</div>
          <h1 id="practice-hero-title">{clinic.heroHeadline || 'Care begins with a conversation.'}</h1>
          <p className="pv2-lead">
            {clinic.heroSubheadline ||
              ('Chiropractic care in ' + location + '. Come as you are. We will take the time to understand your concerns and talk through the next steps together.')}
          </p>
          <div className="pv2-action-row">
            <button id="hero-book-first-visit-btn" className="pv2-btn pv2-btn-primary" onClick={onBookClick} type="button">
              {clinic.heroCtaText || 'Book your first visit'} <span aria-hidden="true">↗</span>
            </button>
            <Link className="pv2-text-link" to="/first-visit">What to expect <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="pv2-hero-baseline">
            <span className="pv2-small-label">Your local practice</span>
            <span>{location}</span>
            {clinic.phone && <a href={'tel:' + (clinic.phoneRaw || clinic.phone)}>{clinic.phone}</a>}
          </div>
        </div>
        <figure className="pv2-hero-figure">
          <div className="pv2-hero-photograph">
            <img src={clinic.heroImage || '/images/clinic_hero_care.jpg'}
              alt={clinic.heroImageAlt || 'Illustrative image of a healthcare consultation'}
              loading="eager" fetchPriority="high" decoding="async" />
          </div>
          <figcaption><span>01 / The practice</span><span>{clinic.name || 'Chiropractic care'}</span></figcaption>
        </figure>
      </div>
    </section>
  );
}

export function PracticeCareIndex({ clinic, onBookClick }: PublicSectionProps) {
  const conditions = (clinic.customConditions?.length ? clinic.customConditions : conditionsData).slice(0, 6);
  const triage = clinic.showHeroTriage !== false && clinic.customTriageOptions?.length
    ? clinic.customTriageOptions : [];
  return (
    <section id="care" className="pv2-section pv2-care" aria-labelledby="pv2-care-title">
      <div className="pv2-wrap pv2-editorial-split">
        <div className="pv2-section-intro">
          <span className="pv2-kicker">Areas of care / 02</span>
          <h2 id="pv2-care-title">{clinic.conditionsTitle || 'Start with what is bothering you.'}</h2>
          <p>{clinic.conditionsIntro || 'Explore some of the reasons people come to see us. A conversation and assessment help determine what care may be appropriate.'}</p>
          <Link className="pv2-text-link" to="/conditions">Explore all areas of care <span aria-hidden="true">↗</span></Link>
        </div>
        <div>
          <div className="pv2-index">
            {conditions.map((condition, index) =>
              <Link to={'/conditions/' + conditionSlug(condition)} className="pv2-index-item" key={condition.slug || condition.id || index}>
                <span className="pv2-index-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="pv2-index-name">{condition.title || 'Care and assessment'}</span>
                <span className="pv2-index-arrow" aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
          {triage.length > 0 && (
            <div className="pv2-triage" aria-label="Appointment starting points">
              <span>Not sure where to begin?</span>
              {triage.map((option) =>
                <button type="button" key={option.id} onClick={onBookClick}>{option.shortLabel || option.label}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function PracticeApproach({ clinic }: { clinic: ClinicInfo }) {
  const entries = [
    { title: clinic.whyUsPillar1Title || 'A proper introduction', text: clinic.whyUsPillar1Desc || 'Tell us what has been going on, what you have tried, and what you want to get back to.' },
    { title: clinic.whyUsPillar2Title || 'Clear explanations', text: clinic.whyUsPillar2Desc || 'Understand the findings and the options available before deciding on your next step.' },
    { title: clinic.whyUsPillar3Title || 'Care that makes sense', text: clinic.whyUsPillar3Desc || 'Make decisions together, with space to ask questions and revisit the plan.' },
  ];
  return (
    <section className="pv2-section pv2-approach" aria-labelledby="pv2-approach-title">
      <div className="pv2-wrap">
        <div className="pv2-heading-row">
          <span className="pv2-kicker">Our approach / 03</span>
          <h2 id="pv2-approach-title">{clinic.whyUsTitle || 'Good care starts by listening.'}</h2>
        </div>
        <div className="pv2-principle-grid">
          {entries.map((entry, index) => (
            <div className="pv2-principle" key={index}>
              <span className="pv2-index-number">0{index + 1}</span>
              <h3>{entry.title}</h3>
              <p>{entry.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PracticeJourney({ clinic }: { clinic: ClinicInfo }) {
  const steps = (clinic.customFirstVisitSteps?.length ? clinic.customFirstVisitSteps : firstVisitSteps).slice(0, 4);
  return (
    <section className="pv2-section pv2-journey" aria-labelledby="pv2-journey-title">
      <div className="pv2-wrap pv2-editorial-split">
        <div className="pv2-section-intro">
          <span className="pv2-kicker">Your first visit / 04</span>
          <h2 id="pv2-journey-title">{clinic.firstVisitTitle || 'Know what to expect.'}</h2>
          <p>{clinic.firstVisitSubtitle || 'Here is how an initial appointment usually works. Your clinician will explain any recommended next steps.'}</p>
          <Link to="/first-visit" className="pv2-text-link">Read the first-visit guide <span aria-hidden="true">↗</span></Link>
        </div>
        <ol className="pv2-timeline">
          {steps.map((step, i) => (
            <li key={String(step.number || i)}>
              <span className="pv2-timeline-marker">{String(i + 1).padStart(2, '0')}</span>
              <div><h3>{step.title}</h3><p>{step.description}</p></div>
              {step.duration && <span className="pv2-timeline-duration">{step.duration}</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PracticePeople({ clinic }: { clinic: ClinicInfo }) {
  return (
    <section className="pv2-section pv2-people" aria-labelledby="pv2-people-title">
      <div className="pv2-wrap pv2-people-grid">
        <figure className="pv2-photo pv2-portrait">
          <img src={clinic.doctorImage || '/images/doctor_portrait.jpg'}
            alt={clinic.doctorImageAlt || 'Illustrative practitioner portrait for this demo'}
            loading="lazy" decoding="async" />
          <figcaption>Our people / {clinic.name || 'The practice'}</figcaption>
        </figure>
        <div className="pv2-people-copy">
          <span className="pv2-kicker">Meet the people / 05</span>
          <h2 id="pv2-people-title">{clinic.doctorSectionTitle || 'A person to talk things through with.'}</h2>
          <p>{clinic.doctorBio || 'Your first visit is a chance to discuss your concerns, understand the assessment and ask questions before deciding what happens next.'}</p>
          <div className="pv2-byline">
            <span>{clinic.doctorName || 'Meet the practitioner'}</span>
            <span>{clinic.doctorTitle || 'Chiropractic practitioner'}</span>
          </div>
          <Link to="/team" className="pv2-text-link">Meet the team <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}

export function PracticeSpace({ clinic }: { clinic: ClinicInfo }) {
  return (
    <section className="pv2-section pv2-space" aria-labelledby="pv2-space-title">
      <div className="pv2-wrap">
        <div className="pv2-space-heading">
          <span className="pv2-kicker">The space / 06</span>
          <h2 id="pv2-space-title">{clinic.clinicSectionTitle || 'Feel comfortable from the moment you arrive.'}</h2>
          <p>{clinic.clinicQuoteDescription || 'Get to know the setting before your first appointment, including how to find us and what to expect when you arrive.'}</p>
        </div>
        <figure className="pv2-wide-photo">
          <img src={clinic.clinicImage || '/images/clinic_interior_room.jpg'} alt={clinic.clinicImageAlt || 'Illustrative treatment-room interior'} loading="lazy" decoding="async" />
          <figcaption><span>Inside the practice</span><Link to="/about">More about the clinic <span aria-hidden="true">↗</span></Link></figcaption>
        </figure>
      </div>
    </section>
  );
}

export function PracticeFees({ clinic }: { clinic: ClinicInfo }) {
  return (
    <section className="pv2-section pv2-fees" aria-labelledby="pv2-fees-title">
      <div className="pv2-wrap pv2-editorial-split">
        <div className="pv2-section-intro">
          <span className="pv2-kicker">Fees and information / 07</span>
          <h2 id="pv2-fees-title">Know the practical details.</h2>
          <p>Find information about appointment fees, payment options, and preparing for your first visit.</p>
          <Link to="/pricing" className="pv2-text-link">View fees & payment information <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="pv2-fee-list">
          {clinic.examFee && <div><span>First appointment</span><strong>{clinic.examFee}</strong></div>}
          {clinic.followUpFee && <div><span>Follow-up appointment</span><strong>{clinic.followUpFee}</strong></div>}
          <div><span>Before your visit</span><Link to="/first-visit">Read the appointment guide ↗</Link></div>
          <div><span>Questions?</span><Link to="/contact">Contact the practice ↗</Link></div>
        </div>
      </div>
    </section>
  );
}

export function PracticeFinal({ clinic, onBookClick }: PublicSectionProps) {
  return (
    <section className="pv2-last" aria-labelledby="pv2-last-title">
      <div className="pv2-wrap pv2-last-grid">
        <div>
          <span className="pv2-kicker">Whenever you're ready</span>
          <h2 id="pv2-last-title">{clinic.finalCtaHeadline || 'Make room for feeling better.'}</h2>
          <p>{clinic.finalCtaSubheadline || 'Arrange an initial visit or speak with the practice about what happens next.'}</p>
        </div>
        <div className="pv2-last-actions">
          <button type="button" className="pv2-btn pv2-btn-light" onClick={onBookClick}>Book a visit <span aria-hidden="true">↗</span></button>
          {clinic.phone && <a href={'tel:' + (clinic.phoneRaw || clinic.phone)}>{clinic.phone}</a>}
        </div>
      </div>
    </section>
  );
}
