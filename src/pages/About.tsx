import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { isExplicitDemo } from '../lib/mode';
import { doctorImg, clinicRoomImg } from '../data/clinicData';
import type { AboutPhilosophyPillar, AboutGalleryImage } from '../types';

export default function About() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const demo = isExplicitDemo();
  const pillars: AboutPhilosophyPillar[] = clinic.aboutPhilosophyPillars?.length
    ? clinic.aboutPhilosophyPillars
    : [
        { id: 'listen', icon: '', title: 'A conversation first', description: 'Your concerns, history, and goals help shape the first appointment.' },
        { id: 'understand', icon: '', title: 'An explanation you understand', description: 'We discuss the assessment and what the findings may mean for you.' },
        { id: 'decide', icon: '', title: 'A plan you agree with', description: 'Ask questions, explore options, and decide what makes sense together.' },
      ];
  const gallery: AboutGalleryImage[] = clinic.aboutGallery || [];
  const doctorPhoto = clinic.doctorImage || (demo ? doctorImg : '');
  const clinicPhoto = clinic.clinicImage || (demo ? clinicRoomImg : '');
  const doctorName = clinic.doctorName || 'Your practitioner';

  usePageMeta('About ' + (clinic.name || 'Our Practice'),
    clinic.aboutDoctorBio || clinic.aboutApproach || 'Meet the practice and learn what to expect from your care.');

  return (
    <div className="page-v2 pv2-interior pv2-about">
      <div className="pv2-wrap">
        <header className="pv2-page-header">
          <span className="pv2-kicker">About the practice / 01</span>
          <div className="pv2-page-header-grid">
            <h1>{clinic.aboutPageTitle || 'A place to be heard.'}</h1>
            <p>{clinic.aboutMission || clinic.aboutApproach ||
              ('Get to know ' + (clinic.name || 'our practice') + ', the people behind it, and the approach to your first appointment.')}</p>
          </div>
        </header>
        <section className="pv2-content-section pv2-about-story" aria-labelledby="pv2-about-story">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">The story / 02</span>
            <h2 id="pv2-about-story">{clinic.aboutStoryTitle || 'Why the practice exists.'}</h2>
          </div>
          <div className="pv2-story-content">
            <p>{clinic.aboutStory || clinic.aboutJourneyParagraph1 ||
              'Good care should leave room for conversation. We want every patient to understand the options available to them and feel comfortable asking questions.'}</p>
            {clinic.aboutJourneyParagraph2 && <p>{clinic.aboutJourneyParagraph2}</p>}
            {clinic.aboutJourneyParagraph3 && <p>{clinic.aboutJourneyParagraph3}</p>}
          </div>
        </section>
        <section className="pv2-content-section pv2-about-person" aria-labelledby="pv2-about-person-title">
          <div className="pv2-about-person-photo">
            {doctorPhoto
              ? <img src={doctorPhoto} alt={clinic.doctorImageAlt || (demo ? 'Illustrative practitioner portrait for this demo' : doctorName)}
                  loading="lazy" decoding="async" />
              : <div className="pv2-empty-photo">Your practitioner</div>}
            <small>{demo && !clinic.doctorImage ? 'Illustrative photograph' : 'The practitioner'}</small>
          </div>
          <div className="pv2-about-person-copy">
            <span className="pv2-kicker">Meet the practitioner / 03</span>
            <h2 id="pv2-about-person-title">{doctorName}</h2>
            <p className="pv2-subheading">{clinic.doctorTitle || 'Chiropractic care'}</p>
            <p>{clinic.aboutDoctorBio || clinic.doctorBio ||
              'At your first visit, we will take time to discuss your concerns and the next steps that may be appropriate.'}</p>
            {clinic.aboutDoctorQuote && <blockquote>“{clinic.aboutDoctorQuote}”</blockquote>}
            <Link to="/team" className="pv2-text-link">Meet the full team ↗</Link>
          </div>
        </section>
        <section className="pv2-content-section" aria-labelledby="pv2-about-approach">
          <div className="pv2-content-heading pv2-content-heading-wide">
            <span className="pv2-kicker">What matters / 04</span>
            <h2 id="pv2-about-approach">How we approach care.</h2>
          </div>
          <div className="pv2-principle-grid pv2-about-pillars">
            {pillars.map((pillar, index) => <div className="pv2-principle" key={pillar.id || index}>
              <span className="pv2-index-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{pillar.title}</h3><p>{pillar.description}</p>
            </div>)}
          </div>
        </section>
        {(gallery.length > 0 || clinicPhoto) && (
          <section className="pv2-content-section" aria-labelledby="pv2-about-spaces">
            <div className="pv2-content-heading pv2-content-heading-wide">
              <span className="pv2-kicker">The environment / 05</span>
              <h2 id="pv2-about-spaces">A look inside.</h2>
            </div>
            <div className="pv2-about-gallery">
              {(gallery.length ? gallery : [{ id: 'clinic', url: clinicPhoto, caption: 'The practice', alt: 'Illustrative treatment space' }]).map((photo) => (
                <figure key={photo.id}>
                  <img src={photo.url} alt={photo.alt || photo.caption || 'Practice photograph'} loading="lazy" />
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
        <section className="pv2-inline-cta">
          <div>
            <span className="pv2-kicker">Visit us</span>
            <h2>Come meet the practice.</h2>
            <p>Find out how appointments work, or arrange a first visit.</p>
          </div>
          <div className="pv2-cta-group">
            <button type="button" onClick={() => openBookingModal()} className="pv2-btn pv2-btn-primary">Arrange a visit ↗</button>
            <Link to="/first-visit" className="pv2-text-link">Your first visit ↗</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
