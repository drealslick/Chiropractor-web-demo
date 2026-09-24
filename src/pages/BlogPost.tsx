import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { defaultBlogPosts } from '../data/defaultPosts';
import { resolvePalette } from '../data/colorPalettes';
import { ClinicPost, BlogBlock } from '../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Check,
  ChevronRight,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Quote,
  Target,
  ArrowRight,
  Bookmark,
  Info,
} from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { clinicData: clinic, openBookingModal } = useClinic();
  const [copied, setCopied] = useState(false);

  const posts: ClinicPost[] =
    clinic.customPosts && clinic.customPosts.length > 0
      ? clinic.customPosts
      : defaultBlogPosts;

  const post = posts.find((p) => p.slug === slug);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-stone-50">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-stone-900">Article Not Found</h2>
          <p className="text-xs text-stone-600">
            The clinical article or guide you are looking for has been moved or updated.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
        </div>
      </div>
    );
  }

  const isDraft = post.status === 'draft';
  const hasBlocks = post.blocks && post.blocks.length > 0;
  const isDropCapEnabled = post.enableDropCap !== false && clinic.globalDropCap !== false;
  let firstParagraphRendered = false;

  // Resolve palette accent color (falls back to site accent or vibrant emerald)
  const activePalette = resolvePalette(clinic.colorPalette);
  const accentColor =
    clinic.customAccentColor ||
    activePalette?.preview?.accent ||
    activePalette?.variables?.['--theme-accent'] ||
    '#059669';

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto space-y-8">
        {/* Draft Notice Banner if viewed as draft */}
        {isDraft && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Draft Preview:</strong> This clinical article is currently in draft mode and only visible via direct link.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
              Unpublished
            </span>
          </div>
        )}

        {/* Navigation Breadcrumbs & Share */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-emerald-800 font-medium transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-medium transition shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3 text-stone-400" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>

        {/* Header Metadata */}
        <header className="space-y-4 border-b border-stone-200 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              {post.category || 'Clinical Guide'}
            </span>
            {post.readTime && (
              <span className="text-stone-500 text-xs flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {post.readTime}
              </span>
            )}
            {post.date && (
              <span className="text-stone-500 text-xs flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {post.date}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-serif italic border-l-2 border-emerald-600 pl-4 py-1">
              {post.excerpt}
            </p>
          )}

          {/* Author Byline */}
          <div className="flex items-center gap-3 pt-3">
            <div className="w-9 h-9 rounded-full bg-emerald-900 text-emerald-100 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {(post.author || clinic.doctorName || 'D').charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900">
                {post.author || clinic.doctorName || 'Lead Clinician'}
              </div>
              <div className="text-[11px] text-stone-500">
                {clinic.name || 'Private Practice'}
              </div>
            </div>
          </div>
        </header>

        {/* ARTICLE BODY: STRUCTURED BLOCKS OR FORMATTED TEXT */}
        <div className="space-y-6 text-stone-700 leading-relaxed">
          {hasBlocks ? (
            post.blocks!.map((block) => {
              switch (block.type) {
                // 1. SUBHEADING
                case 'heading': {
                  if (block.level === 'h3') {
                    return (
                      <h3
                        key={block.id}
                        className="text-lg sm:text-xl font-serif font-bold text-stone-900 pt-3"
                      >
                        {block.headingText}
                      </h3>
                    );
                  }
                  return (
                    <h2
                      key={block.id}
                      className="text-xl sm:text-2xl font-serif font-bold text-stone-900 pt-5 pb-1 border-b border-stone-200"
                    >
                      {block.headingText}
                    </h2>
                  );
                }

                // 2. PARAGRAPH
                case 'paragraph': {
                  if (!block.content) return null;
                  const trimmed = block.content.trim();
                  if (!trimmed) return null;

                  const isFirstP = !firstParagraphRendered;
                  if (isFirstP) {
                    firstParagraphRendered = true;
                  }

                  if (isFirstP && isDropCapEnabled && trimmed.length > 20) {
                    const firstChar = trimmed.charAt(0);
                    const restOfText = trimmed.slice(1);

                    return (
                      <p
                        key={block.id}
                        className="text-sm sm:text-base leading-relaxed text-stone-700 clear-both"
                      >
                        <span
                          className="float-left text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-emerald-600 leading-[0.85] mr-2.5 sm:mr-3.5 select-none drop-shadow-2xs"
                          style={{
                            color: accentColor,
                            paddingTop: '3px',
                          }}
                        >
                          {firstChar}
                        </span>
                        {restOfText}
                      </p>
                    );
                  }

                  return (
                    <p
                      key={block.id}
                      className="text-sm sm:text-base leading-relaxed text-stone-700"
                    >
                      {block.content}
                    </p>
                  );
                }

                // 3. BULLET / NUMBERED LIST
                case 'list': {
                  if (!block.items || !block.items.length) return null;
                  if (block.listType === 'numbered') {
                    return (
                      <ol key={block.id} className="list-decimal pl-6 space-y-2 text-sm sm:text-base text-stone-700">
                        {block.items.map((item, idx) => (
                          <li key={idx} className="pl-1">
                            {item}
                          </li>
                        ))}
                      </ol>
                    );
                  }
                  return (
                    <ul key={block.id} className="list-disc pl-6 space-y-2 text-sm sm:text-base text-stone-700">
                      {block.items.map((item, idx) => (
                        <li key={idx} className="pl-1">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }

                // 4. IMAGE WITH ALT TEXT & CAPTION
                case 'image': {
                  if (!block.imageUrl) return null;
                  return (
                    <figure key={block.id} className="my-6 space-y-2">
                      <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                        <img
                          src={block.imageUrl}
                          alt={block.imageAlt || post.title}
                          className="w-full h-auto object-cover max-h-[500px]"
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

                // 5. CALLOUT BOX
                case 'callout': {
                  const variant = block.calloutVariant || 'takeaway';
                  const isWarning = variant === 'warning';
                  const isTip = variant === 'tip';
                  const isResearch = variant === 'research';

                  return (
                    <div
                      key={block.id}
                      className={`p-4 sm:p-5 rounded-xl border my-5 space-y-1.5 shadow-2xs ${
                        isWarning
                          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                          : isTip
                          ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
                          : isResearch
                          ? 'bg-stone-100 border-stone-300 text-stone-900'
                          : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                        {isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : isTip ? (
                          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                        <span>{block.calloutTitle || 'Clinical Insight'}</span>
                      </div>
                      {block.calloutText && (
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90 pl-6">
                          {block.calloutText}
                        </p>
                      )}
                    </div>
                  );
                }

                // 6. PULL QUOTE
                case 'quote': {
                  if (!block.quoteText) return null;
                  return (
                    <blockquote
                      key={block.id}
                      className="my-6 p-5 sm:p-6 bg-emerald-950 text-emerald-50 rounded-2xl border border-emerald-900 shadow-md space-y-3"
                    >
                      <Quote className="w-6 h-6 text-emerald-400 opacity-60" />
                      <p className="font-serif italic text-base sm:text-lg leading-relaxed">
                        "{block.quoteText}"
                      </p>
                      {block.quoteAuthor && (
                        <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                          — {block.quoteAuthor}
                        </div>
                      )}
                    </blockquote>
                  );
                }

                // 7. MID-ARTICLE CTA CARD
                case 'cta': {
                  return (
                    <div
                      key={block.id}
                      className="my-8 p-6 sm:p-7 rounded-2xl bg-stone-900 text-white border border-stone-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5"
                    >
                      <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <Target className="w-3.5 h-3.5" />
                          <span>Direct Clinical Triage</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-serif font-bold text-white">
                          {block.ctaHeadline || 'Schedule Your Spinal Examination'}
                        </h4>
                        {block.ctaSubtitle && (
                          <p className="text-xs text-stone-300 max-w-md">
                            {block.ctaSubtitle}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={openBookingModal}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs tracking-wide transition shrink-0 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{block.ctaButtonText || 'Book Your First Visit'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                default:
                  return null;
              }
            })
          ) : (
            // Formatted Fallback for existing markdown text
            (post.body || '').split('\n\n').filter(Boolean).map((block, i) => {
              const trimmed = block.trim();
              if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.') || trimmed.startsWith('5.')) {
                const lines = trimmed.split('\n');
                const heading = lines[0];
                const rest = lines.slice(1).join(' ');
                return (
                  <div key={i} className="p-4 sm:p-5 bg-white rounded-xl border border-stone-200/90 shadow-2xs space-y-2">
                    <h3 className="font-serif font-bold text-stone-900 text-base">{heading}</h3>
                    {rest && <p className="text-stone-600 text-sm leading-relaxed">{rest}</p>}
                  </div>
                );
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                const items = trimmed.split('\n').map((l) => l.replace(/^[-•]\s*/, ''));
                return (
                  <ul key={i} className="list-disc pl-5 space-y-1.5 text-stone-700 text-sm">
                    {items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-xl sm:text-2xl font-serif font-bold text-stone-900 pt-4 pb-1 border-b border-stone-200">
                    {trimmed.replace(/^##\s*/, '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-lg font-serif font-bold text-stone-900 pt-2">
                    {trimmed.replace(/^###\s*/, '')}
                  </h3>
                );
              }
              const isFirstP = !firstParagraphRendered;
              if (isFirstP) firstParagraphRendered = true;

              if (isFirstP && isDropCapEnabled && trimmed.length > 20) {
                const firstChar = trimmed.charAt(0);
                const restOfText = trimmed.slice(1);
                return (
                  <p key={i} className="leading-relaxed text-sm sm:text-base text-stone-700 clear-both">
                    <span
                      className="float-left text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-emerald-600 leading-[0.85] mr-2.5 sm:mr-3.5 select-none drop-shadow-2xs"
                      style={{
                        color: accentColor,
                        paddingTop: '3px',
                      }}
                    >
                      {firstChar}
                    </span>
                    {restOfText}
                  </p>
                );
              }

              return <p key={i} className="leading-relaxed text-sm sm:text-base">{trimmed}</p>;
            })
          )}
        </div>

        {/* Footer Medical Disclaimer */}
        <div className="p-4 bg-stone-100/80 rounded-xl border border-stone-200 text-[11px] text-stone-500 space-y-1 mt-8">
          <span className="font-semibold text-stone-700 block">Clinical Disclaimer:</span>
          <p>
            The information contained in this guide is provided for educational and biomechanical insight purposes only and does not substitute formal medical or orthopedic diagnosis. Please consult directly with a certified healthcare practitioner before beginning new rehabilitation protocols.
          </p>
        </div>

        {/* Bottom Consultation CTA Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-stone-900 text-stone-50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-serif font-bold text-white">
              Ready to address your symptoms with {clinic.doctorName || 'our specialists'}?
            </h3>
            <p className="text-xs text-stone-300">
              {clinic.offerHeadline || 'Comprehensive consultation & diagnostic assessment.'}
            </p>
          </div>

          <button
            type="button"
            onClick={openBookingModal}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide transition shrink-0 shadow-md cursor-pointer"
          >
            <span>{clinic.offerCtaText || 'BOOK CONSULTATION →'}</span>
          </button>
        </div>
      </article>
    </div>
  );
}
