import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { isExplicitDemo, isUnconfiguredMode } from '../lib/mode';
import type { PublicTeamMember, SupportStaffMember } from '../types';

export default function Team() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const preview = isExplicitDemo() || isUnconfiguredMode();
  const hasPublishedTeam = Boolean(clinic.publicTeamMembers?.length);
  const clinicians: PublicTeamMember[] = hasPublishedTeam
    ? clinic.publicTeamMembers.filter((m: PublicTeamMember) => m.showOnWebsite !== false)
    : preview ? [{
        id: 'sample-practitioner', slug: 'sample-practitioner',
        name: clinic.doctorName || 'Example practitioner',
        role: clinic.doctorTitle || 'Illustrative clinician profile',
        photoUrl: clinic.doctorImage || '/images/doctor_portrait.jpg',
        shortSummary: 'Illustrative practitioner profile for this demonstration. A clinic owner replaces the name, image and biography with their own details.',
        areasOfFocus: [], showOnWebsite: true,
      }] : [];
  const staff: SupportStaffMember[] = clinic.supportStaff?.length ? clinic.supportStaff : [];
  usePageMeta(clinic.teamPageTitle || 'Meet the Team',
    clinic.teamPageHeroText || 'Get to know the people behind the practice.');

  return (
    <div className="page-v2 pv2-interior pv2-team">
      <div className="pv2-wrap">
        <header className="pv2-page-header">
          <span className="pv2-kicker">The practice / People</span>
          <div className="pv2-page-header-grid">
            <h1>{clinic.teamPageTitle || 'Get to know us.'}</h1>
            <p>{clinic.teamPageHeroText || 'The people you meet shape the experience of visiting any practice. Find out more about the team and how they approach care.'}</p>
          </div>
        </header>
        <section className="pv2-content-section" aria-labelledby="clinicians-title">
          <div className="pv2-content-heading pv2-content-heading-wide">
            <span className="pv2-kicker">01 / Clinical team</span>
            <h2 id="clinicians-title">The people behind the care.</h2>
            {!hasPublishedTeam && preview && <p>Illustrative profiles for the demonstration site. Real clinics replace these with their own people.</p>}
          </div>
          {clinicians.length ? (
            <div className="pv2-team-list">
              {clinicians.map((member, index) => (
                <article className="pv2-team-member" key={member.id || index}>
                  <Link className="pv2-member-photo" to={'/team/' + (member.slug || member.id)}>
                    {member.photoUrl
                      ? <img src={member.photoUrl} alt={member.photoAlt || ('Portrait for ' + member.name)} loading="lazy" />
                      : <div className="pv2-member-initials" aria-hidden="true">{member.name?.charAt(0) || '?'}</div>}
                  </Link>
                  <div className="pv2-member-information">
                    <span className="pv2-kicker">{member.role || 'Clinician'}</span>
                    <h3><Link to={'/team/' + (member.slug || member.id)}>{member.name}</Link></h3>
                    {member.shortSummary && <p>{member.shortSummary}</p>}
                    {member.areasOfFocus?.length > 0 && (
                      <p className="pv2-small-detail"><strong>Areas of interest:</strong> {member.areasOfFocus.slice(0, 3).join(', ')}</p>
                    )}
                    <div className="pv2-member-actions">
                      <Link className="pv2-text-link" to={'/team/' + (member.slug || member.id)}>Read profile ↗</Link>
                      <button type="button" className="pv2-text-link" onClick={() =>
                        openBookingModal(member.areasOfFocus?.[0] || ('Consultation with ' + member.name),
                          'initial', undefined, undefined, member.id)}>Request a visit ↗</button>
                    </div>
                  </div>
                  <span className="pv2-member-index">{String(index + 1).padStart(2, '0')}</span>
                </article>
              ))}
            </div>
          ) : (
            <div className="pv2-empty-state"><h3>Team profiles are being prepared.</h3><p>Please contact the practice if you would like to know who you will meet.</p></div>
          )}
        </section>
        {staff.length > 0 && <section className="pv2-content-section pv2-two-col" aria-labelledby="support-team">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">02 / Here to help</span>
            <h2 id="support-team">Beyond the treatment room.</h2>
          </div>
          <div className="pv2-support-list">
            {staff.map((member, i) => <div key={member.id || i}><strong>{member.name}</strong><span>{member.role || 'Practice team'}</span></div>)}
          </div>
        </section>}
        <section className="pv2-inline-cta">
          <div>
            <span className="pv2-kicker">Your visit</span>
            <h2>Questions for the team?</h2>
            <p>Get in touch before your appointment or read about your first visit.</p>
          </div>
          <Link to="/first-visit" className="pv2-btn pv2-btn-primary">What to expect <span aria-hidden="true">↗</span></Link>
        </section>
      </div>
    </div>
  );
}
