import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';
import { usePageMeta } from '../data/usePageMeta';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Conditions() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const conditions = clinic.customConditions?.length ? clinic.customConditions : conditionsData;
  usePageMeta(clinic.conditionsTitle || 'Areas of Care',
    clinic.conditionsSubtitle || 'Explore common reasons patients seek a chiropractic consultation.');

  return (
    <div className="page-v2 pv2-interior pv2-conditions">
      <div className="pv2-wrap">
        <header className="pv2-page-header">
          <div className="pv2-kicker">The practice / Areas of care</div>
          <div className="pv2-page-header-grid">
            <h1>{clinic.conditionsTitle || 'How can we help?'}</h1>
            <p>{clinic.conditionsIntro || clinic.conditionsSubtitle ||
              'An initial consultation is a chance to discuss your concerns. Explore common topics below, and ask us about anything you are unsure of.'}</p>
          </div>
        </header>
        <section className="pv2-content-section" aria-labelledby="care-index-title">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">01 / Explore</span>
            <h2 id="care-index-title">Choose a topic.</h2>
          </div>
          <div className="pv2-condition-list">
            {conditions.map((condition, index) => (
              <Link className="pv2-condition-row" to={'/conditions/' + (condition.slug || condition.id || slugify(condition.title || 'care'))}
                key={condition.slug || condition.id || index}>
                <span className="pv2-index-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="pv2-condition-detail">
                  <strong>{condition.title || 'Assessment and care'}</strong>
                  {condition.description && <small>{condition.description}</small>}
                </span>
                <span aria-hidden="true" className="pv2-condition-arrow">↗</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="pv2-inline-cta">
          <div>
            <span className="pv2-kicker">Not sure where to start?</span>
            <h2>Tell us what's going on.</h2>
            <p>You don't need to identify a condition yourself. Start with a conversation.</p>
          </div>
          <button type="button" className="pv2-btn pv2-btn-primary" onClick={() => openBookingModal()}>Arrange an initial visit <span aria-hidden="true">↗</span></button>
        </section>
      </div>
    </div>
  );
}
