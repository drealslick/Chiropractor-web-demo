import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { defaultPublicTeamMembers } from '../data/defaultTeamData';
import { conditionsData } from '../data/clinicData';
import { PublicTeamMember, BlogBlock, ProblemCondition } from '../types';
import { PhysicianSchema } from '../components/PhysicianSchema';
import {
  ArrowLeft,
  Calendar,
  Phone,
  ShieldCheck,
  Award,
  Sparkles,
  Quote,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Target,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  Share2,
  Check,
  Mail,
  GraduationCap,
} from 'lucide-react';

export default function TeamMemberDetail() {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const { clinicData: clinic, openBookingModal } = useClinic();
  const [copied, setCopied] = useState(false);

  const teamMembers: PublicTeamMember[] =
    clinic.publicTeamMembers && clinic.publicTeamMembers.length > 0
      ? clinic.publicTeamMembers
      : defaultPublicTeamMembers;

  const member = teamMembers.find(
    (m) => m.slug === memberSlug || m.id === memberSlug
  );

  const allConditions: ProblemCondition[] =
    clinic.customConditions && clinic.customConditions.length > 0
      ? clinic.customConditions
      : conditionsData;

  usePageMeta(
    member
      ? `${member.name}, ${member.credentials || member.role} | ${clinic.name || 'Vance Health'}`
      : 'Clinician Profile',
    member?.shortSummary ||
      'Meet our chiropractic specialists and discover our unhurried approach to evidence-based musculoskeletal health.'
  );

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 bg-stone-50">
        <div className="text-center space-y-4 max-w-md mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Practitioner Not Found
          </h1>
          <p className="text-stone-600 text-sm">
            The clinician profile you are looking for may have been updated or moved.
          </p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Meet Our Entire Team</span>
          </Link>
        </div>
      </div>
    );
  }

  // Find conditions treated by this practitioner
  const treatedConditions = allConditions.filter((c) => {
    if (!member.assignedConditionSlugs || member.assignedConditionSlugs.length === 0) {
      return false;
    }
    const cSlug = c.slug || c.id || '';
    return (
      member.assignedConditionSlugs.includes(cSlug) ||
      member.assignedConditionSlugs.includes(c.id || '')
    );
  });

  // Render individual editorial block
  const renderBlock = (block: BlogBlock, index: number) => {
    switch (block.type) {
      case 'paragraph': {
        const isFirst = index === 0;
        return (
          <p
            key={block.id}
            className={`text-stone-700 text-sm sm:text-base leading-relaxed font-sans ${
              isFirst
                ? 'first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:mr-3.5 first-letter:text-emerald-800 first-letter:leading-none'
                : ''
            }`}
          >
            {block.content}
          </p>
        );
      }
      case 'heading': {
        if (block.level === 'h3') {
          return (
            <h3
              key={block.id}
              className="text-lg sm:text-xl font-serif font-bold text-stone-900 pt-4"
            >
              {block.headingText}
            </h3>
          );
        }
        return (
          <h2
            key={block.id}
            className="text-xl sm:text-2xl font-serif font-bold text-stone-900 pt-5 border-b border-stone-100 pb-2"
          >
            {block.headingText}
          </h2>
        );
      }
      case 'quote': {
        return (
          <div
            key={block.id}
            className="p-5 sm:p-6 rounded-2xl bg-emerald-50/80 border-l-4 border-emerald-600 space-y-2 my-4 relative"
          >
            <Quote className="w-8 h-8 text-emerald-600/30 absolute top-4 right-4" />
            <p className="text-sm sm:text-base font-serif italic text-stone-800 leading-relaxed pr-8">
              "{block.quoteText}"
            </p>
            {block.quoteAuthor && (
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block pt-1">
                — {block.quoteAuthor}
              </span>
            )}
          </div>
        );
      }
      case 'callout': {
        return (
          <div
            key={block.id}
            className="p-5 rounded-2xl bg-stone-900 text-white border border-stone-800 shadow-md space-y-2 my-4"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{block.calloutTitle || 'Clinical Note'}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {block.calloutText}
            </p>
          </div>
        );
      }
      case 'list': {
        return (
          <ul
            key={block.id}
            className="space-y-2 pl-5 list-disc text-xs sm:text-sm text-stone-700 my-3"
          >
            {block.items?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      }
      case 'image': {
        if (!block.imageUrl) return null;
        return (
          <figure key={block.id} className="space-y-2 my-5">
            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
              <img
                src={block.imageUrl}
                alt={block.imageAlt || block.caption || member.name}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
            {block.caption && (
              <figcaption className="text-xs text-stone-500 italic text-center">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      {/* 🔗 Structured Data (Schema): Person & Physician */}
      <PhysicianSchema member={member} clinic={clinic} />

      <div className="max-w-5xl mx-auto space-y-12">

        {/* BREADCRUMBS & SHARE */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-stone-500">
            <Link to="/" className="hover:text-stone-900 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/team" className="hover:text-stone-900 transition">
              Our Team
            </Link>
            <span>/</span>
            <span className="font-semibold text-stone-900 truncate max-w-xs">
              {member.name}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Profile</span>
              </>
            )}
          </button>
        </div>

        {/* 1. HERO SECTION: LARGE PHOTO ON LEFT, NAME/CREDENTIALS/ROLE ON RIGHT */}
        <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headshot Photo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-100 aspect-4/5">
                <img
                  src={member.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800'}
                  alt={member.photoAlt || member.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />

                {/* Statutory Registration Tag */}
                {member.registrationNumber && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-xs flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Statutory Registered</span>
                    </div>
                    <span className="font-mono text-[10px] text-stone-500">
                      {member.registrationNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Name, Credentials, Role, Summary, Actions */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{member.role}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                  {member.name}
                  {member.credentials && (
                    <span className="block text-lg sm:text-xl font-sans font-normal text-emerald-800 mt-1">
                      {member.credentials}
                    </span>
                  )}
                </h1>
              </div>

              {/* Short Summary */}
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                {member.shortSummary}
              </p>

              {/* Doctor Personal Pull Quote */}
              {member.quote && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100/90 relative space-y-2">
                  <Quote className="w-6 h-6 text-emerald-600/40 absolute top-3 right-3" />
                  <p className="text-xs sm:text-sm font-serif italic text-stone-800 leading-relaxed pr-6">
                    "{member.quote}"
                  </p>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    — {member.name}
                  </div>
                </div>
              )}

              {/* Education & Clinical Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
                {member.education && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                    <span className="font-bold text-stone-900 block mb-0.5 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Education & Degrees</span>
                    </span>
                    <span className="text-stone-600">{member.education}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <span className="font-bold text-stone-900 block mb-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Appointment Duration</span>
                  </span>
                  <span className="text-stone-600">45–60 min Comprehensive Evaluation</span>
                </div>
              </div>

              {/* Direct Booking CTA Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openBookingModal(`Consultation with ${member.name}`)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-sm transition shadow-md hover:shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Consultation with {member.name.split(' ')[0] === 'Dr.' ? member.name.split(' ')[1] : member.name.split(' ')[0]}</span>
                </button>

                <a
                  href={`tel:${clinic.phoneRaw || clinic.phone}`}
                  className="px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Call {clinic.phone}</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 2. AREAS OF FOCUS */}
        {member.areasOfFocus && member.areasOfFocus.length > 0 && (
          <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Target className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                Specialized Areas of Clinical Focus
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {member.areasOfFocus.map((focus, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-2.5 text-xs text-stone-800 font-medium hover:border-emerald-500/60 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{focus}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. BIO: FULL EDITORIAL BLOCK NARRATIVE */}
        {member.bioBlocks && member.bioBlocks.length > 0 && (
          <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
            <div className="space-y-1 border-b border-stone-100 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Clinical Background & Practice Narrative
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Biography & Clinical Philosophy
              </h2>
            </div>

            <div className="space-y-5 max-w-3xl">
              {member.bioBlocks.map((block, idx) => renderBlock(block, idx))}
            </div>
          </section>
        )}

        {/* 4. CROSS-LINKING: CONDITIONS TREATED BY THIS PRACTITIONER */}
        {treatedConditions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Targeted Care Protocols
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Conditions Treated by {member.name}
                </h2>
              </div>
              <Link
                to="/conditions"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>All Conditions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatedConditions.map((cond) => {
                const cSlug = cond.slug || cond.id;
                return (
                  <Link
                    key={cond.id}
                    to={`/conditions/${cSlug}`}
                    className="p-5 bg-white border border-stone-200/90 rounded-2xl hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block">
                        Clinical Protocol
                      </span>
                      <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-emerald-800 transition">
                        {cond.title}
                      </h3>
                      {cond.description && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {cond.description}
                        </p>
                      )}
                    </div>
                    <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <span>View Protocol</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. "BOOK WITH [NAME]" CTA BLOCK */}
        <section className="p-8 sm:p-10 bg-stone-900 text-white rounded-3xl text-center space-y-4 shadow-xl border border-stone-800">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Dedicated 1-on-1 Patient Care
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Schedule your initial consultation with {member.name}
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Begin with an unhurried, root-cause spinal evaluation. You'll receive clear diagnostic answers, joint motion analysis, and a personalized recovery roadmap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openBookingModal(`Consultation with ${member.name}`)}
              className="w-full sm:w-auto inline-block bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer text-sm"
            >
              Book with {member.name} →
            </button>
            <Link
              to="/first-visit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 font-semibold text-sm transition"
            >
              <span>What to Expect on Visit 1</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
