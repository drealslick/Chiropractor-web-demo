import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { firstVisitSteps, clinicRoomImg } from '../data/clinicData';
import { usePageMeta } from '../data/usePageMeta';

const BRING_ITEMS = [
  'A list of current medications, if applicable',
  'Any relevant previous reports or scans',
  'Comfortable clothing that allows you to move',
  'Questions you would like to ask',
];

export default function FirstVisit() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const steps = clinic.customFirstVisitSteps?.length ? clinic.customFirstVisitSteps : firstVisitSteps;
  const bringList: string[] = clinic.firstVisitBringList?.length
    ? clinic.firstVisitBringList : clinic.firstVisitBring
      ? String(clinic.firstVisitBring).split('\n').filter(Boolean) : BRING_ITEMS;
  const directionsQuery = encodeURIComponent([clinic.address, clinic.cityState || clinic.city, clinic.zip].filter(Boolean).join(', '));
  const directionsUrl = 'https://www.google.com/maps/search/?api=1&query=' + directionsQuery;
  const duration = clinic.firstVisitDuration;
  usePageMeta(clinic.firstVisitTitle || 'Your First Visit',
    clinic.firstVisitSubtitle || 'A straightforward guide to getting ready for your appointment.');

  return (
    <div className="page-v2 pv2-interior pv2-visit">
      <div className="pv2-wrap">
        <header className="pv2-page-header">
          <div className="pv2-kicker">A guide to your visit / 01</div>
          <div className="pv2-page-header-grid">
            <h1>{clinic.firstVisitTitle || 'Come as you are.'}</h1>
            <div className="pv2-header-aside">
              <p>{clinic.firstVisitSubtitle || 'We know visiting somewhere new can raise questions. Here is what to expect and how to get ready.'}</p>
              {duration && <p className="pv2-simple-detail">Appointment length: {duration}</p>}
              <button type="button" onClick={() => openBookingModal('First Visit Consultation')} className="pv2-btn pv2-btn-primary">Book your first visit <span aria-hidden="true">↗</span></button>
            </div>
          </div>
        </header>
        <figure className="pv2-feature-photo">
          <img src={clinic.firstVisitHeroImage || clinic.clinicImage || clinicRoomImg}
            alt={clinic.firstVisitHeroImageAlt || clinic.clinicImageAlt || 'Illustrative image of a chiropractic practice'}
            loading="eager" decoding="async" />
          <figcaption>Getting to know the practice <span>{clinic.cityState || clinic.city || 'Your local clinic'}</span></figcaption>
        </figure>

        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-visit-steps">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">During your appointment / 02</span>
            <h2 id="pv2-visit-steps">The first visit, step by step.</h2>
            <p>Appointments are tailored to your circumstances. Your practitioner will explain what is appropriate for you.</p>
          </div>
          <ol className="pv2-timeline">
            {steps.map((step, i) =>
              <li key={String(step.number || i)}>
                <span className="pv2-timeline-marker">{String(i + 1).padStart(2, '0')}</span>
                <div><h3>{step.title}</h3><p>{step.description}</p></div>
                {step.duration && <span className="pv2-timeline-duration">{step.duration}</span>}
              </li>
            )}
          </ol>
        </section>

        <section className="pv2-content-section pv2-two-col" id="before-you-arrive" aria-labelledby="pv2-arrive-title">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">Before you arrive / 03</span>
            <h2 id="pv2-arrive-title">A few things to bring.</h2>
            <p>{clinic.firstVisitWear || 'Wear something comfortable. You can bring any relevant medical information and questions you would like to discuss.'}</p>
          </div>
          <ul className="pv2-simple-list">
            {bringList.map((item, i) => <li key={i}><span className="pv2-index-number">{String(i + 1).padStart(2, '0')}</span><span>{item}</span></li>)}
          </ul>
        </section>
        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-find-us">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">On the day / 04</span>
            <h2 id="pv2-find-us">Finding the clinic.</h2>
            <p>Plan your journey and get in touch if you need help before coming in.</p>
          </div>
          <div className="pv2-contact-details">
            {clinic.address && <div><span>Address</span><strong>{clinic.address}, {clinic.cityState || clinic.city} {clinic.zip}</strong></div>}
            {clinic.hoursWeekday && <div><span>Weekday hours</span><strong>{clinic.hoursWeekday}</strong></div>}
            {clinic.phone && <div><span>Telephone</span><a href={'tel:' + (clinic.phoneRaw || clinic.phone)}>{clinic.phone}</a></div>}
            <div><span>Directions</span><a href={directionsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a></div>
          </div>
        </section>
        <section className="pv2-inline-cta">
          <div>
            <span className="pv2-kicker">Questions before you book?</span>
            <h2>We're here to help.</h2>
            <p>Contact the practice directly, or read more about our services and fees.</p>
          </div>
          <div className="pv2-cta-group">
            <button type="button" className="pv2-btn pv2-btn-primary" onClick={() => openBookingModal()}>Book a visit <span aria-hidden="true">↗</span></button>
            <Link className="pv2-text-link" to="/contact">Contact the practice ↗</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
