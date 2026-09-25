import React from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { usePageMeta } from '../data/usePageMeta';
import { defaultPublicTeamMembers, defaultSupportStaff } from '../data/defaultTeamData';
import { PublicTeamMember, SupportStaffMember } from '../types';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  Users,
  Heart,
  Phone,
  Clock,
  Compass,
} from 'lucide-react';

export default function Team() {
  const { clinicData: clinic, openBookingModal } = useClinic();

  usePageMeta(
    `Our Clinical Team & Specialists | ${clinic.name || 'Vance Health'}`,
    clinic.teamPageHeroText ||
      'Meet our experienced team of registered chiropractors, biomechanists, and patient care coordinators dedicated to unhurried, root-cause care.'
  );

  const teamMembers: PublicTeamMember[] =
    clinic.publicTeamMembers && clinic.publicTeamMembers.length > 0
      ? clinic.publicTeamMembers.filter((m) => m.showOnWebsite !== false)
      : defaultPublicTeamMembers;

  const supportStaff: SupportStaffMember[] =
    clinic.supportStaff && clinic.supportStaff.length > 0
      ? clinic.supportStaff
      : defaultSupportStaff;

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-20">

        {/* 1. HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>{clinic.teamPageSubtitle || 'Clinical Team & Care Architecture'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
            {clinic.teamPageTitle || 'Meet Your Practitioners'}
          </h1>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {clinic.teamPageHeroText ||
              'Every practitioner at our practice is statutory registered, evidence-informed, and committed to unhurried, root-cause spinal healthcare. No high-pressure sales—just clear clinical answers.'}
          </p>

          {/* Trust Highlights Row */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>GCC Registered Practitioners</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-2xs">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>45–60 Min Unhurried Visits</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-2xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Postgrad Biomechanics Honors</span>
            </div>
          </div>
        </section>

        {/* 2. THE GRID (THE INDEX) - 3-COLUMN DESKTOP GRID */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Primary Clinical Practitioners
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Doctors of Chiropractic & Biomechanists
              </h2>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {teamMembers.length} {teamMembers.length === 1 ? 'Specialist' : 'Specialists'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teamMembers.map((member) => (
              <article
                key={member.id}
                className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg hover:border-emerald-500/60 transition-all flex flex-col group duration-300"
              >
                {/* Headshot with subtle framed container */}
                <div className="relative aspect-4/5 overflow-hidden bg-stone-100">
                  <img
                    src={member.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800'}
                    alt={member.photoAlt || `${member.name} portrait`}
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top-Right Badge: Registration / Status */}
                  {member.registrationNumber && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700/60 text-white text-[10px] font-mono flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{member.registrationNumber}</span>
                    </div>
                  )}

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                      {member.role}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white leading-tight mt-0.5">
                      {member.name}
                    </h3>
                    {member.credentials && (
                      <span className="text-xs text-stone-200 block font-sans">
                        {member.credentials}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3.5">
                    {/* One-sentence "What I do" summary */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans line-clamp-3">
                      {member.shortSummary}
                    </p>

                    {/* Areas of Focus Pills */}
                    {member.areasOfFocus && member.areasOfFocus.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                          Key Clinical Focus:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {member.areasOfFocus.slice(0, 3).map((focus, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200/60"
                            >
                              {focus}
                            </span>
                          ))}
                          {member.areasOfFocus.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 font-medium">
                              +{member.areasOfFocus.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: Read Bio Link + Book With Doctor */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/team/${member.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition group-hover:translate-x-0.5"
                    >
                      <span>Read Bio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        openBookingModal(
                          member.areasOfFocus?.[0] || `Consultation with ${member.name}`,
                          'initial',
                          undefined,
                          undefined,
                          member.id
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>Book with {member.name.split(' ')[0] === 'Dr.' ? member.name.split(' ')[1] : member.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. THE "SUPPORT STAFF" SECTION */}
        {supportStaff.length > 0 && (
          <section className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4 text-center sm:text-left space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Welcoming You At Every Visit
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Clinic Support & Patient Care Team
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
                Our front desk coordinators and clinic assistants ensure your visit is relaxed, paperwork is effortless, and your recovery exercises are fully supported.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pt-2">
              {supportStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:border-emerald-500/50 transition-colors"
                >
                  {/* Small Circular Headshot */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-emerald-600/30 shadow-xs shrink-0 bg-stone-200">
                    <img
                      src={staff.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
                      alt={staff.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                      {staff.name}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 block">
                      {staff.role}
                    </span>
                    {staff.bio && (
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-snug pt-0.5">
                        {staff.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. FINAL CTA BANNER */}
        <section className="p-8 sm:p-10 bg-stone-900 text-white rounded-3xl text-center space-y-4 shadow-xl border border-stone-800">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Co-Created Care Roadmap
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Schedule an appointment with our clinical team
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Every new patient begins with a comprehensive, unhurried 45-minute examination and motion analysis. Discover what's causing your discomfort with clarity and honesty.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openBookingModal('Team Page General Booking')}
              className="w-full sm:w-auto inline-block bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 cursor-pointer text-sm"
            >
              Book Initial Examination →
            </button>
            <a
              href={`tel:${clinic.phoneRaw || clinic.phone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-200 font-semibold text-sm transition"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call {clinic.phone}</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
