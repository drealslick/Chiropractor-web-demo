import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { defaultPublicTeamMembers } from '../data/defaultTeamData';
import { isExplicitDemo } from '../lib/mode';
import type { PublicTeamMember, BlogBlock } from '../types';

function BioBlock({ block }: { block: BlogBlock }) {
  if (block.type === 'paragraph') return <p>{block.content}</p>;
  if (block.type === 'heading') return block.level === 'h3' ? <h3>{block.headingText}</h3> : <h2>{block.headingText}</h2>;
  if (block.type === 'list') return <ul>{block.items?.map((item,i)=><li key={i}>{item}</li>)}</ul>;
  if (block.type === 'quote') return <blockquote>“{block.quoteText}”{block.quoteAuthor && <footer>{block.quoteAuthor}</footer>}</blockquote>;
  if (block.type === 'image' && block.imageUrl) return <figure><img src={block.imageUrl} alt={block.imageAlt || ''} loading="lazy" /><figcaption>{block.caption}</figcaption></figure>;
  if (block.type === 'callout') return <aside><strong>{block.calloutTitle}</strong><p>{block.calloutText}</p></aside>;
  return null;
}

export default function TeamMemberDetail() {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const { clinicData: clinic, openBookingModal } = useClinic();
  const custom: PublicTeamMember[] = clinic.publicTeamMembers || [];
  const practitioners: PublicTeamMember[] = custom.length ? custom : isExplicitDemo() ? defaultPublicTeamMembers : [];
  const member = practitioners.find(item => item.slug === memberSlug || item.id === memberSlug);
  usePageMeta(member ? member.name + ' | ' + (clinic.name || 'The practice') : 'Team member',
    member?.shortSummary || 'Get to know the people behind the practice.');

  if (!member) return <div className="pv2-interior pv2-missing"><div className="pv2-wrap">
    <h1>We couldn't find this profile.</h1><p>It may have been moved or updated.</p>
    <Link to="/team" className="pv2-btn pv2-btn-primary">Meet the team ↗</Link>
  </div></div>;

  const focus = member.areasOfFocus || [];
  const bio: BlogBlock[] = member.bioBlocks || [];
  return (
    <div className="page-v2 pv2-interior pv2-profile">
      <div className="pv2-wrap">
        <div className="pv2-breadcrumb"><Link to="/team">← Our people</Link><span>{member.name}</span></div>
        <header className="pv2-profile-header">
          <figure className="pv2-profile-photo">
            {member.photoUrl
              ? <img src={member.photoUrl} alt={member.photoAlt || 'Portrait of ' + member.name}
                  loading="eager" decoding="async" />
              : <div className="pv2-empty-photo" aria-label="Portrait not available">{member.name.charAt(0)}</div>}
            <figcaption>{isExplicitDemo() && !custom.length ? 'Illustrative demo practitioner' : member.role}</figcaption>
          </figure>
          <div className="pv2-profile-intro">
            <span className="pv2-kicker">The people behind the practice</span>
            <h1>{member.name}</h1>
            <p className="pv2-profile-role">{member.role}</p>
            <p className="pv2-profile-summary">{member.shortSummary}</p>
            {member.quote && <blockquote>“{member.quote}”</blockquote>}
            <button className="pv2-btn pv2-btn-primary" type="button"
              onClick={() => openBookingModal(focus[0] || ('Consultation with ' + member.name),
                'initial', undefined, undefined, member.id)}>Request a visit ↗</button>
          </div>
        </header>
        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-profile-about">
          <div className="pv2-content-heading"><span className="pv2-kicker">01 / Profile</span><h2 id="pv2-profile-about">Get to know {member.name.split(' ')[0]}.</h2></div>
          <div className="pv2-prose">
            {bio.length ? bio.map(block => <BioBlock key={block.id} block={block} />)
              : <p>{member.shortSummary || 'Contact the practice to learn more about the team.'}</p>}
          </div>
        </section>
        {(focus.length > 0 || member.education) && <section className="pv2-content-section pv2-two-col">
          <div className="pv2-content-heading"><span className="pv2-kicker">02 / Experience</span><h2>Areas of focus.</h2></div>
          <div className="pv2-contact-details">
            {focus.map((item,i) => <div key={i}><span>{String(i+1).padStart(2,'0')}</span><strong>{item}</strong></div>)}
            {member.education && <div><span>Education</span><strong>{member.education}</strong></div>}
          </div>
        </section>}
        <section className="pv2-inline-cta">
          <div><span className="pv2-kicker">The next step</span><h2>Let's talk about your visit.</h2>
            <p>Find out more about the first appointment, or contact the practice.</p></div>
          <div className="pv2-cta-group">
            <button type="button" className="pv2-btn pv2-btn-primary" onClick={() =>
              openBookingModal(focus[0] || 'Initial consultation','initial',undefined,undefined,member.id)}>Book a visit ↗</button>
            <Link className="pv2-text-link" to="/first-visit">The first-visit guide ↗</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
