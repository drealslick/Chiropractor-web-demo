import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { conditionsData } from '../data/clinicData';
import { defaultBlogPosts } from '../data/defaultPosts';
import { defaultPricingFees } from '../data/defaultPricingFees';
import { defaultPublicTeamMembers } from '../data/defaultTeamData';
import {
  ConditionIconBadge,
  ConditionAnatomyDiagram,
} from '../components/ConditionVisual';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Info,
  AlertTriangle,
  Lightbulb,
  Quote,
  Target,
  FileText,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { ClinicPost, BlogBlock, PublicTeamMember } from '../types';
import { usePageMeta } from '../data/usePageMeta';

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function ConditionDetail() {
  const { conditionId } = useParams<{ conditionId: string }>();
  const { clinicData: clinic, openBookingModal } = useClinic();

  const list = clinic.customConditions?.length
    ? clinic.customConditions
    : conditionsData;

  const condition = list.find((c) => {
    const rawSlug = c.slug || slugify(c.title || c.id || '');
    return rawSlug === conditionId || c.id === conditionId;
  });

  usePageMeta(
    condition ? `${condition.title} Protocol` : 'Condition',
    condition?.description || 'Evidence-based chiropractic protocol and clinical recovery guide.'
  );

  if (!condition) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 bg-stone-50">
        <div className="text-center space-y-4 max-w-md mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Condition Protocol Not Found
          </h1>
          <p className="text-stone-600 text-sm">
            The clinical condition or protocol you are looking for may have been updated or renamed.
          </p>
          <Link
            to="/conditions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Conditions</span>
          </Link>
        </div>
      </div>
    );
  }

  // Symptoms & Signs
  const symptoms =
    condition.symptoms && condition.symptoms.length > 0
      ? condition.symptoms
      : [
          'Localized restriction and movement discomfort',
          'Postural compensation and muscular tension',
          'Sharp or dull pain exacerbated by routine physical activities',
        ];

  // How We Treat It Sections
  const ourApproach =
    condition.ourApproach ||
    condition.approach ||
    `At ${clinic.name}, we begin by evaluating the underlying spinal kinematics, nerve entrapments, and muscle imbalances contributing to ${condition.title}. Rather than merely masking symptoms, we employ gentle adjustments and decompression to restore optimal joint mobility and long-term functional stability.`;

  const carePlan =
    condition.carePlan && condition.carePlan.length > 0
      ? condition.carePlan
      : [
          'Phase 1: Targeted spinal manipulation and joint mobilization to relieve acute mechanical restriction',
          'Phase 2: Specialized soft tissue therapy and decompression to reduce localized swelling and muscle splinting',
          'Phase 3: Active kinetic rehabilitation and posture re-education to build lasting resilience',
        ];

  const homeCareAdvice =
    condition.homeCareAdvice ||
    'Apply cold packs for 15 minutes post-activity to soothe inflamed facet joints. Maintain consistent spinal movement throughout the workday with gentle standing micro-extensions every 30 minutes.';

  const homeCareAuthor =
    condition.homeCareQuoteAuthor || 'Lead Clinical Biomechanist';

  // Cross-Linking: Related Blog Articles
  const allPosts: ClinicPost[] =
    clinic.customPosts && clinic.customPosts.length > 0
      ? clinic.customPosts
      : defaultBlogPosts;

  const relatedBlogPosts = allPosts.filter((post) => {
    if (condition.relatedBlogSlugs && condition.relatedBlogSlugs.length > 0) {
      return condition.relatedBlogSlugs.includes(post.slug);
    }
    // Fallback: match by title keywords
    const lowerTitle = (condition.title || '').toLowerCase();
    const postTitle = (post.title || '').toLowerCase();
    const postCat = (post.category || '').toLowerCase();
    return (
      (lowerTitle.includes('back') && (postTitle.includes('disc') || postTitle.includes('sciatica') || postCat.includes('spine'))) ||
      (lowerTitle.includes('neck') && (postTitle.includes('neck') || postTitle.includes('headache') || postTitle.includes('ergonomic'))) ||
      (lowerTitle.includes('head') && postTitle.includes('headache'))
    );
  });

  // Fallback to first 2 articles if none matched
  const finalRelatedPosts =
    relatedBlogPosts.length > 0 ? relatedBlogPosts.slice(0, 2) : allPosts.slice(0, 2);

  // Cross-Linking: Pricing Fees
  const feeItems =
    clinic.customFeeItems && clinic.customFeeItems.length > 0
      ? clinic.customFeeItems
      : defaultPricingFees;

  const examFeeItem =
    feeItems.find((f) => f.title.toLowerCase().includes('new patient') || f.title.toLowerCase().includes('exam')) ||
    feeItems[0];
  const followUpFeeItem =
    feeItems.find((f) => f.title.toLowerCase().includes('follow') || f.title.toLowerCase().includes('adjustment')) ||
    feeItems[1] ||
    feeItems[0];

  // Resolve specialists treating this condition
  const allTeamMembers: PublicTeamMember[] =
    clinic.publicTeamMembers && clinic.publicTeamMembers.length > 0
      ? clinic.publicTeamMembers.filter((m) => m.showOnWebsite !== false)
      : defaultPublicTeamMembers;

  const currentConditionSlug = condition.slug || condition.id;
  const specialists = allTeamMembers.filter((m) => {
    if (!m.assignedConditionSlugs || m.assignedConditionSlugs.length === 0) {
      return m.role.toLowerCase().includes('lead') || m.order === 1;
    }
    return (
      m.assignedConditionSlugs.includes(currentConditionSlug) ||
      m.assignedConditionSlugs.includes(condition.id)
    );
  });
  const displaySpecialists = specialists.length > 0 ? specialists : allTeamMembers.slice(0, 2);

  return (
    <div className="min-h-screen bg-stone-50/60 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <Link
            to="/conditions"
            className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-950 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Conditions & Protocols</span>
          </Link>
          <span className="hidden sm:inline font-mono text-[11px] text-stone-400">
            Clinical Guide #{condition.id || 'REF-402'}
          </span>
        </div>

        {/* Hero Section with Editorial Serif Typography */}
        <header className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <ConditionIconBadge
                type={condition.icon || condition.title}
                size="md"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-md inline-block">
                Clinical Focus Protocol
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {condition.title}
            </h1>

            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-sans max-w-3xl">
              {condition.description}
            </p>
          </div>

          {/* Clinical Anatomical Diagram / Visual directly below H1 */}
          <div className="pt-2">
            <ConditionAnatomyDiagram
              conditionTitle={condition.title || ''}
              conditionIcon={condition.icon || 'spine'}
            />
          </div>

          {/* Optional Clinic Photography Image if uploaded */}
          {condition.heroImage && (
            <div className="rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm bg-stone-100 max-h-96">
              <img
                src={condition.heroImage}
                alt={condition.heroImageAlt || condition.title}
                className="w-full h-full object-cover object-center max-h-96"
              />
            </div>
          )}
        </header>

        {/* "Common Signs" Block: Styled Card with Checkmark Icons */}
        <section className="p-6 sm:p-8 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Symptom Presentation
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Common Signs & Clinical Indicators
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diagnostic Checklist</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {symptoms.map((symptom, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 hover:bg-stone-100/70 transition"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                </div>
                <span className="text-sm font-medium text-stone-800 leading-snug">
                  {symptom}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-stone-500 italic pt-2 border-t border-stone-100">
            Note: Every patient presents differently. A comprehensive physical assessment is required to distinguish spinal facet restriction from disc or extraspinal nerve entrapment.
          </p>
        </section>

        {/* "How We Treat It" Block (The Biggest Fix): Full Editorial Section */}
        <section className="space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Treatment Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              How We Treat It
            </h2>
          </div>

          {/* Section 1: Our Approach (Paragraph) */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                1
              </span>
              <span>Section 1: Our Clinical Approach</span>
            </div>
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-sans">
              {ourApproach}
            </p>
          </div>

          {/* Section 2: Your Care Plan (Bullet list of what treatment involves) */}
          <div className="p-6 sm:p-7 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                2
              </span>
              <span>Section 2: Your Care Plan & Treatment Phases</span>
            </div>
            <div className="space-y-3">
              {carePlan.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Home Care (Pull quote / callout box with exercises) */}
          <div className="p-6 sm:p-7 bg-emerald-900 text-white rounded-3xl shadow-md space-y-3 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Quote className="w-4 h-4 text-emerald-300" />
                <span>Section 3: Prescribed Home Care & Ergonomics</span>
              </div>
              <blockquote className="text-base sm:text-lg font-serif italic text-emerald-50 leading-relaxed">
                "{homeCareAdvice}"
              </blockquote>
              <div className="text-xs text-emerald-300/80 font-mono pt-1">
                — {homeCareAuthor}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Custom Blocks from Mini-Page Builder (if present) */}
        {condition.blocks && condition.blocks.length > 0 && (
          <section className="space-y-6 pt-4 border-t border-stone-200">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Clinical Details & Insights
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Further Guidance for {condition.title}
              </h2>
            </div>

            <div className="space-y-6">
              {condition.blocks.map((block: BlogBlock) => {
                switch (block.type) {
                  case 'heading': {
                    if (block.level === 'h3') {
                      return (
                        <h3
                          key={block.id}
                          className="text-lg sm:text-xl font-serif font-bold text-stone-900 pt-2"
                        >
                          {block.headingText}
                        </h3>
                      );
                    }
                    return (
                      <h2
                        key={block.id}
                        className="text-xl sm:text-2xl font-serif font-bold text-stone-900 pt-4 pb-1 border-b border-stone-200"
                      >
                        {block.headingText}
                      </h2>
                    );
                  }
                  case 'paragraph': {
                    if (!block.content) return null;
                    return (
                      <p
                        key={block.id}
                        className="text-sm sm:text-base leading-relaxed text-stone-700"
                      >
                        {block.content}
                      </p>
                    );
                  }
                  case 'list': {
                    if (!block.items || !block.items.length) return null;
                    return (
                      <ul
                        key={block.id}
                        className="list-disc pl-6 space-y-2 text-sm sm:text-base text-stone-700"
                      >
                        {block.items.map((item, idx) => (
                          <li key={idx} className="pl-1">
                            {item}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  case 'image': {
                    if (!block.imageUrl) return null;
                    return (
                      <figure key={block.id} className="my-6 space-y-2">
                        <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                          <img
                            src={block.imageUrl}
                            alt={block.imageAlt || condition.title}
                            className="w-full h-auto object-cover max-h-[450px]"
                          />
                        </div>
                        {block.caption && (
                          <figcaption className="text-center text-xs text-stone-500 italic">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  case 'callout': {
                    const variant = block.calloutVariant || 'takeaway';
                    const variantStyles = {
                      takeaway: {
                        bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
                        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        icon: <Sparkles className="w-4 h-4 text-emerald-700" />,
                        title: block.calloutTitle || 'Key Clinical Takeaway',
                      },
                      warning: {
                        bg: 'bg-amber-50 border-amber-200 text-amber-950',
                        badge: 'bg-amber-100 text-amber-900 border-amber-300',
                        icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
                        title: block.calloutTitle || 'Clinical Precaution',
                      },
                      tip: {
                        bg: 'bg-teal-50 border-teal-200 text-teal-950',
                        badge: 'bg-teal-100 text-teal-900 border-teal-300',
                        icon: <Lightbulb className="w-4 h-4 text-teal-700" />,
                        title: block.calloutTitle || 'Doctor Tip',
                      },
                      research: {
                        bg: 'bg-indigo-50 border-indigo-200 text-indigo-950',
                        badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                        icon: <FileText className="w-4 h-4 text-indigo-700" />,
                        title: block.calloutTitle || 'Research Note',
                      },
                    }[variant];

                    return (
                      <div
                        key={block.id}
                        className={`p-5 rounded-2xl border ${variantStyles.bg} space-y-2 shadow-2xs`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-md border ${variantStyles.badge}`}>
                            {variantStyles.icon}
                          </span>
                          <span className="font-bold text-xs uppercase tracking-wider">
                            {variantStyles.title}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed">
                          {block.calloutText}
                        </p>
                      </div>
                    );
                  }
                  case 'quote': {
                    return (
                      <div
                        key={block.id}
                        className="my-6 p-6 rounded-2xl bg-stone-100 border-l-4 border-emerald-600 space-y-2"
                      >
                        <Quote className="w-6 h-6 text-emerald-600/40" />
                        <blockquote className="font-serif italic text-base sm:text-lg text-stone-800">
                          "{block.quoteText}"
                        </blockquote>
                        {block.quoteAuthor && (
                          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                            — {block.quoteAuthor}
                          </div>
                        )}
                      </div>
                    );
                  }
                  case 'cta': {
                    return (
                      <div
                        key={block.id}
                        className="my-6 p-6 sm:p-7 rounded-2xl bg-emerald-950 text-white text-center space-y-3"
                      >
                        <h4 className="text-xl font-serif font-bold text-white">
                          {block.ctaHeadline || 'Schedule Your Consultation'}
                        </h4>
                        <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto">
                          {block.ctaSubtitle}
                        </p>
                        <button
                          type="button"
                          onClick={() => openBookingModal(condition.title)}
                          className="px-6 py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs transition cursor-pointer"
                        >
                          {block.ctaButtonText || 'Book Appointment'}
                        </button>
                      </div>
                    );
                  }
                  default:
                    return null;
                }
              })}
            </div>
          </section>
        )}

        {/* Cross-Linking Section: Transparent Pricing & Related Articles */}
        <section className="space-y-8 pt-6 border-t border-stone-200">
          {/* 1. Transparent Pricing Card */}
          <div className="p-6 sm:p-8 bg-white border border-stone-200/90 rounded-3xl shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Transparent Care
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Transparent Pricing for {condition.title}
                </h3>
              </div>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>View Full Fee Schedule & Insurance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Exam Fee Card */}
              {examFeeItem && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Initial Visit
                      </span>
                      <span className="text-xl font-bold font-mono text-stone-900">
                        {examFeeItem.price}
                      </span>
                    </div>
                    <div className="font-semibold text-stone-900 text-sm mt-1">
                      {examFeeItem.title}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {examFeeItem.description}
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Includes diagnostic review & report of findings.
                  </div>
                </div>
              )}

              {/* Follow-up Fee Card */}
              {followUpFeeItem && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                        Routine Visit
                      </span>
                      <span className="text-xl font-bold font-mono text-stone-900">
                        {followUpFeeItem.price}
                      </span>
                    </div>
                    <div className="font-semibold text-stone-900 text-sm mt-1">
                      {followUpFeeItem.title}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {followUpFeeItem.description}
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Targeted adjustments & functional rehab drills.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Related Articles (Pulling from Blog) */}
          {finalRelatedPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Patient Education & Research
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-stone-900">
                    Related Clinical Articles
                  </h3>
                </div>
                <Link
                  to="/blog"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>All Articles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {finalRelatedPosts.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.slug}`}
                    className="p-5 bg-white border border-stone-200/90 rounded-2xl hover:border-emerald-500 hover:shadow-md transition group flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-semibold text-emerald-700">
                          {post.category || 'Clinical Guide'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {post.readTime || '3 min'}
                        </span>
                      </div>
                      <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-emerald-800 transition">
                        {post.title}
                      </h4>
                      {post.excerpt && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-1">
                      <span>Read Clinical Guide</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. MEET THE SPECIALISTS WHO TREAT THIS CONDITION (SEO CROSS-LINKING) */}
        {displaySpecialists.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Targeted Clinical Care
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Meet the Specialists Who Treat {condition.title}
                </h3>
              </div>
              <Link
                to="/team"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>All Clinicians</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displaySpecialists.map((spec) => (
                <div
                  key={spec.id}
                  className="p-5 bg-white border border-stone-200/90 rounded-2xl hover:border-emerald-500/70 hover:shadow-md transition group flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      <img
                        src={spec.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'}
                        alt={spec.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-base font-serif font-bold text-stone-900 leading-tight">
                        {spec.name}
                      </h4>
                      <p className="text-xs text-emerald-700 font-medium">
                        {spec.role}
                      </p>
                      {spec.credentials && (
                        <p className="text-[11px] text-stone-400 font-sans">
                          {spec.credentials}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {spec.shortSummary}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                    <Link
                      to={`/team/${spec.slug}`}
                      className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Dr. Bio</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => openBookingModal(`Consultation with ${spec.name} for ${condition.title}`)}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-emerald-900 text-white font-semibold transition cursor-pointer"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* The CTA: The Dark "Start with an Exam" Card (Kept exactly as requested) */}
        <section className="p-8 sm:p-10 bg-stone-900 text-white rounded-3xl text-center space-y-4 shadow-xl border border-stone-800">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Priority New Patient Booking
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Start with an exam
          </h3>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {clinic.offerSubtext ||
              `Initial comprehensive consultation and spinal examination for ${condition.title}. Unhurried, 1-on-1 doctor care.`}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => openBookingModal(condition.title)}
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer text-sm"
            >
              {clinic.offerCtaText || `Request Exam for ${condition.title}`}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
