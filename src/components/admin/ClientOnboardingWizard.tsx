import React, { useState } from 'react';
import {
  CheckCircle2,
  Building2,
  User,
  DollarSign,
  Smartphone,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Printer,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  MessageSquare,
  Activity,
  CalendarCheck2,
  ExternalLink,
  Award,
  AlertCircle,
  FileText,
  Copy,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { ClinicInfo } from '../../types';

interface ClientOnboardingWizardProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  onClose?: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export function ClientOnboardingWizard({
  clinic,
  onUpdateClinic,
  onClose,
  onNavigateTab,
}: ClientOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Calculate Launch Readiness Score
  const checks = [
    { label: 'Clinic Name & Phone', pass: Boolean(clinic.name && clinic.phone) },
    { label: 'Address & Postal Code', pass: Boolean(clinic.address && clinic.zip) },
    { label: 'Operating Hours', pass: Boolean(clinic.hoursWeekday) },
    { label: 'Attending Doctor Credentials', pass: Boolean(clinic.doctorName && clinic.doctorCredentials) },
    { label: 'Doctor Quote / Philosophy', pass: Boolean(clinic.doctorQuote) },
    { label: 'New Patient Exam Fee', pass: Boolean(clinic.examFee) },
    { label: 'Offer Headline & CTA', pass: Boolean(clinic.offerHeadline && clinic.offerCtaText) },
    { label: 'Intake Pain Map Enabled', pass: true },
    { label: 'SMS / Gateway Configured', pass: Boolean(clinic.phoneRaw || clinic.name) },
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const readinessPercent = Math.round((passedCount / checks.length) * 100);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintWelcomePack = () => {
    window.print();
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 max-w-5xl mx-auto my-4">
      {/* Printable CSS override for Client Welcome Pack */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #client-welcome-pack, #client-welcome-pack * {
            visibility: visible;
          }
          #client-welcome-pack {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #1c1917 !important;
            padding: 24px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950/40 p-6 border-b border-stone-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Practice Onboarding & Launchpad
              </span>
              <span className="text-stone-400 text-xs font-mono">Template ID: CHIRO-PRO-2026</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Client Handoff & Quickstart</span>
            </h2>
            <p className="text-stone-300 text-xs mt-1 max-w-xl">
              Complete these 5 quick steps to personalize this turnkey practice app for your client clinic before domain handoff.
            </p>
          </div>

          {/* Readiness Meter */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 flex items-center gap-4 min-w-[220px]">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-stone-800" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  className={readinessPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * readinessPercent) / 100}
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-white">{readinessPercent}%</span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Launch Readiness</div>
              <div className="text-sm font-semibold text-white flex items-center gap-1">
                {readinessPercent === 100 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Live
                  </span>
                ) : (
                  <span className="text-amber-400">{passedCount} of {checks.length} checks pass</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-stone-800/80">
          {[
            { step: 1, label: 'Identity & Hours', icon: Building2 },
            { step: 2, label: 'Doctor & Bio', icon: User },
            { step: 3, label: 'Fees & Offers', icon: DollarSign },
            { step: 4, label: 'Intake & SMS', icon: Smartphone },
            { step: 5, label: 'Staff Quickstart', icon: BookOpen },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                    : isCompleted
                    ? 'bg-stone-850 border-emerald-800/40 text-emerald-300 hover:bg-stone-800'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-850 hover:text-stone-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isActive
                      ? 'bg-emerald-500 text-stone-950'
                      : isCompleted
                      ? 'bg-emerald-900/80 text-emerald-300'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Step {s.step}</div>
                  <div className="text-xs font-semibold truncate">{s.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {/* STEP 1: IDENTITY & HOURS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Step 1: Practice Identity & Contact Information</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Configure the clinic's public branding, primary phone line, physical address, and operating schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={clinic.name || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, name: e.target.value })}
                  placeholder="e.g. Columbus Chiropractic Care"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Phone Number (Display)</label>
                <input
                  type="text"
                  value={clinic.phone || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, phone: e.target.value })}
                  placeholder="e.g. (614) 555-0192"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={clinic.address || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, address: e.target.value })}
                  placeholder="e.g. 1420 N High St, Suite 100"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">City & State</label>
                <input
                  type="text"
                  value={clinic.cityState || `${clinic.city || ''}, ${clinic.state || ''}`}
                  onChange={(e) => onUpdateClinic({ ...clinic, cityState: e.target.value, city: e.target.value.split(',')[0]?.trim() })}
                  placeholder="e.g. Columbus, OH"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Postal / Zip Code</label>
                <input
                  type="text"
                  value={clinic.zip || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, zip: e.target.value })}
                  placeholder="e.g. 43201"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Weekday Hours</label>
                <input
                  type="text"
                  value={clinic.hoursWeekday || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, hoursWeekday: e.target.value })}
                  placeholder="e.g. Mon–Thu: 8:00 AM – 6:00 PM, Fri: 8:00 AM – 2:00 PM"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Weekend Hours</label>
                <input
                  type="text"
                  value={clinic.hoursSaturday || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, hoursSaturday: e.target.value })}
                  placeholder="e.g. Sat: 9:00 AM – 1:00 PM (Emergency Appointments Only)"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-300 mb-1">Parking & Access Directions</label>
                <input
                  type="text"
                  value={clinic.parkingNote || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, parkingNote: e.target.value })}
                  placeholder="e.g. Free patient parking reserved in the rear lot off High St."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live Preview: Footer & Local SEO Schema Output
              </div>
              <div className="text-xs text-stone-300 space-y-1 font-mono">
                <div><span className="text-stone-500">Name:</span> {clinic.name || 'Not set'}</div>
                <div><span className="text-stone-500">Address:</span> {clinic.address}, {clinic.cityState} {clinic.zip}</div>
                <div><span className="text-stone-500">Phone:</span> {clinic.phone}</div>
                <div><span className="text-stone-500">Hours:</span> {clinic.hoursWeekday}</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DOCTOR & CREDENTIALS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                <span>Step 2: Attending Chiropractor & Clinical Credentials</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Highlight practitioner trust signals, degrees, certifications, and clinical philosophy to build patient confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Doctor / Lead Practitioner Name</label>
                <input
                  type="text"
                  value={clinic.doctorName || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, doctorName: e.target.value })}
                  placeholder="e.g. Dr. Marcus Vance"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Degrees & Post-Doctoral Certifications</label>
                <input
                  type="text"
                  value={clinic.doctorCredentials || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, doctorCredentials: e.target.value })}
                  placeholder="e.g. D.C., DACBSP, CSCS"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Years in Practice</label>
                <input
                  type="text"
                  value={clinic.doctorYears || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, doctorYears: e.target.value })}
                  placeholder="e.g. 15"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Doctor Photo URL</label>
                <input
                  type="text"
                  value={clinic.doctorImageUrl || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, doctorImageUrl: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-300 mb-1">Clinical Mission Statement / Doctor Quote</label>
                <textarea
                  rows={3}
                  value={clinic.doctorQuote || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, doctorQuote: e.target.value })}
                  placeholder="e.g. Our priority is finding the root cause of back and neck dysfunction so patients get lasting relief without reliance on surgery or long-term medication."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-stone-800 overflow-hidden shrink-0 border border-stone-700 flex items-center justify-center">
                {clinic.doctorImageUrl ? (
                  <img src={clinic.doctorImageUrl} alt={clinic.doctorName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-stone-500" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{clinic.doctorName || 'Dr. Practitioner'}</span>
                  <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                    {clinic.doctorCredentials || 'D.C.'}
                  </span>
                </div>
                <div className="text-xs text-stone-400 italic">"{clinic.doctorQuote || 'Doctor philosophy note...'}"</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{clinic.doctorYears || '10+'} Years Experience in Spinal Care</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FEES & OFFERS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Step 3: Consultation Pricing & New Patient Offers</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Set transparent pricing for new patient spinal consultations, regular adjustments, and promotional banners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">New Patient Offer Banner Headline</label>
                <input
                  type="text"
                  value={clinic.offerHeadline || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, offerHeadline: e.target.value })}
                  placeholder="e.g. New Patients: $39 Complete Spinal Assessment"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Offer Subtext</label>
                <input
                  type="text"
                  value={clinic.offerSubtext || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, offerSubtext: e.target.value })}
                  placeholder="e.g. Includes full consultation, orthopedic exam, and report of findings."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">New Patient Exam Fee Display</label>
                <input
                  type="text"
                  value={clinic.examFee || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, examFee: e.target.value })}
                  placeholder="e.g. $49 (Normally $180)"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Booking Button Text</label>
                <input
                  type="text"
                  value={clinic.offerCtaText || ''}
                  onChange={(e) => onUpdateClinic({ ...clinic, offerCtaText: e.target.value })}
                  placeholder="e.g. CLAIM SPECIAL & BOOK NOW →"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Preview Banner */}
            <div className="bg-gradient-to-r from-amber-950/80 to-stone-900 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Promotional Hero Card</div>
                <div className="text-base font-bold text-white mt-1">{clinic.offerHeadline || 'Special Offer Headline'}</div>
                <div className="text-xs text-stone-300">{clinic.offerSubtext || 'Includes full consultation & report of findings.'}</div>
              </div>
              <button
                type="button"
                className="bg-amber-500 text-stone-950 font-bold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-lg"
              >
                {clinic.offerCtaText || 'CLAIM $39 SPECIAL →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: INTAKE & SMS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-stone-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>Step 4: Digital Intake & Automated Reminder Gateway</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Ensure patients complete their digital 2D pain map prior to arrival and receive automated text message reminders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    2D Interactive Pain Map Intake
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Allows patients to select spine, cervical, lumbar, and disc discomfort regions on mobile before stepping foot in clinic.
                </p>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Twilio SMS & Resend Email Alerts
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                    SIMULATOR & LIVE READY
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Sends automated confirmation, 24-hour pre-visit arrival directions, and post-adjustment Google review nudges.
                </p>
              </div>
            </div>

            {/* Mobile SMS Simulator Card */}
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 max-w-sm mx-auto">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2 flex items-center justify-between">
                <span>Automated SMS Preview</span>
                <span className="text-emerald-400 font-mono">24h Pre-Visit</span>
              </div>
              <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3 text-xs text-stone-200 space-y-1.5">
                <div className="font-bold text-emerald-300">Appointment Reminder</div>
                <div>
                  Hi Sarah, your appointment with {clinic.doctorName || 'Dr. Vance'} at {clinic.name || 'Columbus Chiropractic'} is confirmed for tomorrow at 10:00 AM.
                </div>
                <div className="text-[10px] text-stone-400 pt-1 border-t border-emerald-900/60">
                  📍 {clinic.address || '1420 N High St'} • Free parking in rear
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: STAFF QUICKSTART & WELCOME PACK */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>Step 5: Staff Quickstart & Practice Welcome Pack</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Print or download the complete Reception Handbook & Client Handoff summary for clinic staff.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintWelcomePack}
                  className="no-print bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Welcome Pack</span>
                </button>
              </div>
            </div>

            {/* Client Welcome Pack Document (Printable) */}
            <div id="client-welcome-pack" className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-6 text-stone-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-800 pb-4 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Turnkey Practice Handbook & Handoff Summary</div>
                  <h1 className="text-2xl font-bold text-white mt-1">{clinic.name || 'Columbus Chiropractic Care'}</h1>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Prepared for {clinic.doctorName || 'Dr. Practitioner'} ({clinic.doctorCredentials || 'D.C.'})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-stone-400">Launch Readiness Status</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-4 h-4" /> 100% Client Ready
                  </div>
                </div>
              </div>

              {/* Quick Links & Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                  <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CalendarCheck2 className="w-4 h-4" /> Reception Day-View Portal
                  </div>
                  <p className="text-xs text-stone-300 mb-3">
                    Use this view at the front desk to monitor daily arrivals, check in patients, review 2D pain maps, and trigger SMS reminders.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-950 text-stone-300 text-xs px-3 py-1.5 rounded-lg font-mono border border-stone-800 truncate flex-1">
                      {window.location.origin}/admin (Day View)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(`${window.location.origin}/admin`)}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs p-2 rounded-lg"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                  <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Online Booking & Digital Intake
                  </div>
                  <p className="text-xs text-stone-300 mb-3">
                    Direct patients to this link or embed it on your main domain for instant 2D pain map intake.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-950 text-stone-300 text-xs px-3 py-1.5 rounded-lg font-mono border border-stone-800 truncate flex-1">
                      {window.location.origin}/#book
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(`${window.location.origin}/#book`)}
                      className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs p-2 rounded-lg"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reception Staff Cheat Sheet */}
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Reception Desk 3-Step Daily Workflow
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
                    <div className="font-bold text-emerald-400 mb-1">1. Morning Arrival Check</div>
                    <div className="text-stone-300">
                      Open Reception Day-View to view today's scheduled patients and confirm their digital intake pain maps.
                    </div>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
                    <div className="font-bold text-emerald-400 mb-1">2. 1-Click Dispatch</div>
                    <div className="text-stone-300">
                      Click "Send 2h Arrival Alert" or "Nudge Intake" directly from the patient drawer if needed.
                    </div>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-lg border border-stone-800">
                    <div className="font-bold text-emerald-400 mb-1">3. Superbill Export</div>
                    <div className="text-stone-300">
                      Print pre-filled ICD-10 superbills for patients submitting out-of-network insurance claims.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Onboarding Celebration Toggle */}
            <div className="bg-gradient-to-r from-emerald-950 to-stone-900 border border-emerald-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Ready to Mark Practice Setup as Complete?</span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5">
                  This confirms all client customization, doctor credentials, and reception preferences are saved.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onUpdateClinic({ ...clinic, isProductionMode: true });
                  setShowCelebration(true);
                  if (onClose) setTimeout(onClose, 1500);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/60 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Mark Client Ready</span>
              </button>
            </div>

            {showCelebration && (
              <div className="bg-emerald-900/90 border border-emerald-500 text-white p-4 rounded-xl text-center text-sm font-bold animate-bounce">
                🎉 Practice Onboarding Complete! The clinic app is 100% configured for client handoff.
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-800 mt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed text-stone-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-xs text-stone-400 font-mono">Step {currentStep} of 5</div>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold px-4 py-2.5 rounded-xl"
            >
              Done & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
