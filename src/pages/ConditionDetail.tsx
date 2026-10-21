import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';
import { usePageMeta } from '../data/usePageMeta';
import type { ProblemCondition, BlogBlock } from '../types';

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function CareBlock({ block }: { block: BlogBlock }) {
  if (block.type === 'paragraph') return <p>{block.content}</p>;
  if (block.type === 'heading') return block.level === 'h3'
    ? <h3>{block.headingText}</h3> : <h2>{block.headingText}</h2>;
  if (block.type === 'list') return <ul>{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>;
  if (block.type === 'image' && block.imageUrl) return (
    <figure><img src={block.imageUrl} alt={block.imageAlt || ''} loading="lazy" /><figcaption>{block.caption}</figcaption></figure>
  );
  if (block.type === 'quote') return <blockquote>“{block.quoteText}”{block.quoteAuthor && <footer>{block.quoteAuthor}</footer>}</blockquote>;
  if (block.type === 'callout') return <aside><strong>{block.calloutTitle}</strong><p>{block.calloutText}</p></aside>;
  if (block.type === 'cta') return <div><strong>{block.ctaHeadline}</strong><p>{block.ctaSubtitle}</p></div>;
  return null;
}

export default function ConditionDetail() {
  const { conditionId } = useParams<{ conditionId: string }>();
  const { clinicData: clinic, openBookingModal } = useClinic();
  const conditions: ProblemCondition[] = clinic.customConditions?.length ? clinic.customConditions : conditionsData;
  const condition = conditions.find(item =>
    item.id === conditionId || (item.slug || slugify(item.title || item.id || '')) === conditionId);
  usePageMeta(condition?.title || 'Area of Care',
    condition?.description || 'Learn about the practice and book a consultation.');

  if (!condition) return (
    <div className="pv2-interior pv2-missing"><div className="pv2-wrap">
      <h1>We couldn't find that topic.</h1><p>It may have moved or been renamed.</p>
      <Link className="pv2-btn pv2-btn-primary" to="/conditions">Browse all areas of care ↗</Link>
    </div></div>
  );

  const clinicalSteps: string[] = condition.carePlan || [];
  const symptoms: string[] = condition.symptoms || [];
  const clinicalBlocks: BlogBlock[] = condition.blocks || [];

  return (
    <div className="page-v2 pv2-interior pv2-condition-detail">
      <div className="pv2-wrap">
        <div className="pv2-breadcrumb"><Link to="/conditions">← Areas of care</Link><span>{condition.title}</span></div>
        <header className="pv2-page-header">
          <span className="pv2-kicker">Understanding your concerns / {condition.title}</span>
          <div className="pv2-page-header-grid">
            <h1>{condition.title}</h1>
            <div className="pv2-header-aside">
              <p>{condition.description || 'Understand what an assessment may involve and how to ask about the care options available.'}</p>
              <button type="button" onClick={() => openBookingModal(condition.title || 'Consultation')}
                className="pv2-btn pv2-btn-primary">Arrange a consultation ↗</button>
            </div>
          </div>
        </header>
        {condition.heroImage && <figure className="pv2-feature-photo">
          <img src={condition.heroImage} alt={condition.heroImageAlt || 'Illustrative image for ' + condition.title}
            loading="eager" decoding="async" />
          <figcaption>An introduction to {condition.title}</figcaption>
        </figure>}
        {symptoms.length > 0 && <section className="pv2-content-section pv2-two-col">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">01 / What to discuss</span>
            <h2>Some things patients mention.</h2>
            <p>Your clinician will ask about your symptoms and health history. These examples are not a diagnosis.</p>
          </div>
          <ul className="pv2-simple-list">
            {symptoms.map((item,i) => <li key={i}><span className="pv2-index-number">{String(i + 1).padStart(2,'0')}</span><span>{item}</span></li>)}
          </ul>
        </section>}
        <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-care-approach">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">02 / In the consultation</span>
            <h2 id="pv2-care-approach">An individual assessment.</h2>
          </div>
          <div className="pv2-prose">
            <p>{condition.ourApproach || condition.approach || 'We start with your history and an appropriate assessment, then discuss what we find and which next steps could be helpful.'}</p>
            {clinicalSteps.length > 0 && <div className="pv2-care-stages">
              <h3>Possible elements of care</h3>
              <ol>{clinicalSteps.map((item,i)=><li key={i}>{item}</li>)}</ol>
            </div>}
          </div>
        </section>
        {(condition.homeCareAdvice || clinicalBlocks.length > 0) && <section className="pv2-content-section pv2-two-col" aria-labelledby="pv2-care-reading">
          <div className="pv2-content-heading">
            <span className="pv2-kicker">03 / Useful information</span>
            <h2 id="pv2-care-reading">Further reading.</h2>
            <p>General information only. Ask your practitioner which advice is appropriate for your circumstances.</p>
          </div>
          <div className="pv2-prose">
            {condition.homeCareAdvice && <p>{condition.homeCareAdvice}</p>}
            {clinicalBlocks.map(block => <CareBlock key={block.id} block={block} />)}
          </div>
        </section>}
        <section className="pv2-inline-cta">
          <div><span className="pv2-kicker">When you're ready</span><h2>Come in and talk it through.</h2>
            <p>You do not have to work out what's wrong before getting in touch.</p>
          </div>
          <div className="pv2-cta-group">
            <button className="pv2-btn pv2-btn-primary" type="button" onClick={() => openBookingModal(condition.title || 'Consultation')}>Book a visit ↗</button>
            {condition.showPricingLink !== false && <Link to="/pricing" className="pv2-text-link">See appointment fees ↗</Link>}
          </div>
        </section>
      </div>
    </div>
  );
}
