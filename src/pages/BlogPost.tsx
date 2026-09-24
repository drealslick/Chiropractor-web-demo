import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { defaultBlogPosts } from '../data/defaultPosts';
import { ClinicPost } from '../types';
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
} from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { clinicData: clinic, openBookingModal } = useClinic();
  const [copied, setCopied] = React.useState(false);

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

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto space-y-8">
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
              <span className="text-stone-500 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {post.readTime}
              </span>
            )}
            {post.date && (
              <span className="text-stone-500 text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {post.date}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-serif italic">
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

        {/* Article Body */}
        <div className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-5">
          {(post.body || '').split('\n\n').filter(Boolean).map((block, i) => {
            const trimmed = block.trim();
            // Render ordered/bullet points cleanly if formatted
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
            return <p key={i} className="leading-relaxed">{trimmed}</p>;
          })}
        </div>

        {/* Footer Medical Disclaimer */}
        <div className="p-4 bg-stone-100/80 rounded-xl border border-stone-200 text-[11px] text-stone-500 space-y-1">
          <span className="font-semibold text-stone-700 block">Clinical Disclaimer:</span>
          <p>
            The information contained in this guide is provided for educational and biomechanical insight purposes only and does not substitute formal medical or orthopedic diagnosis. Please consult directly with a certified healthcare practitioner before beginning new rehabilitation protocols.
          </p>
        </div>

        {/* Consultation CTA Banner */}
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
