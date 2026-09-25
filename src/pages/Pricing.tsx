import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { defaultPricingFees, defaultFinancingOption } from '../data/defaultPricingFees';
import { PricingFeeItem, FinancingOption } from '../types';
import { InsuranceLogoItem } from '../components/InsuranceLogos';
import {
  Check,
  User,
  RotateCcw,
  Activity,
  Zap,
  Sparkles,
  Heart,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CreditCard,
  PhoneCall,
  Calendar,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Percent,
} from 'lucide-react';

export default function Pricing() {
  const { clinicData: clinic, openBookingModal } = useClinic();

  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [showCoverNotice, setShowCoverNotice] = useState(false);

  // Fee schedule resolution
  const feeItems: PricingFeeItem[] =
    clinic.customFeeItems && clinic.customFeeItems.length > 0
      ? clinic.customFeeItems
      : [
          {
            ...defaultPricingFees[0],
            price: clinic.examFee || defaultPricingFees[0].price,
          },
          {
            ...defaultPricingFees[1],
            price: clinic.followUpFee || defaultPricingFees[1].price,
          },
        ];

  // Insurances resolution
  const insurers =
    clinic.customInsurances && clinic.customInsurances.length > 0
      ? clinic.customInsurances
      : ['Bupa', 'AXA Health', 'Aviva', 'Vitality', 'WPA', 'Self-pay'];

  // Financing resolution: If left blank or disabled in admin, does NOT render on front end!
  const customFinancing = clinic.financing;
  const isFinancingConfigured =
    customFinancing !== undefined
      ? customFinancing.enabled !== false &&
        Boolean(
          customFinancing.headline?.trim() ||
          customFinancing.description?.trim() ||
          customFinancing.provider?.trim()
        )
      : defaultFinancingOption.enabled !== false;

  const financing: FinancingOption = customFinancing || defaultFinancingOption;
  const isFinancingEnabled = isFinancingConfigured;

  // FAQs
  const faqs = [
    {
      q: clinic.pricingFaq1q || 'Do I need a doctor or GP referral?',
      a:
        clinic.pricingFaq1a ||
        'Usually no. Chiropractors are primary contact healthcare practitioners in the UK and US, meaning you can book an initial consultation directly without seeing a GP first. If claiming through private insurance (such as Bupa or AXA), some policies require prior GP pre-authorization.',
    },
    {
      q: clinic.pricingFaq2q || 'Will you surprise me with extra costs or mandatory packages?',
      a:
        clinic.pricingFaq2a ||
        'Never. We pride ourselves on transparent, fee-for-service pricing. You receive a complete diagnostic report of findings and an upfront care estimate on your first visit. You are never pressured into long lock-in contracts or prepaid packages.',
    },
    {
      q: clinic.pricingFaq3q || 'Can I use my private health insurance or cash plan?',
      a:
        clinic.pricingFaq3a ||
        (clinic.insuranceSubtitle ||
          'Yes. We work directly with major health insurers including Bupa, AXA Health, Aviva, Vitality, and WPA. We can verify your policy benefits prior to your first appointment and provide detailed receipts with diagnostic coding for HSA, FSA, or cash plan claims.'),
    },
    {
      q: clinic.pricingFaq4q || 'What payment methods do you accept at the clinic?',
      a:
        clinic.pricingFaq4a ||
        'We accept all major debit and credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, HSA/FSA cards, and interest-free installment options for multi-visit rehabilitation plans.',
    },
  ];

  const getFeeIcon = (iconName?: string) => {
    switch (iconName) {
      case 'user':
        return <User className="w-4 h-4 text-emerald-700" />;
      case 'refresh':
        return <RotateCcw className="w-4 h-4 text-stone-600" />;
      case 'activity':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-rose-600" />;
      default:
        return <User className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* 1. Header Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Transparent Fees & Cover</span>
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
          {clinic.pricingTitle || 'Pricing, insurance & financing'}
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
          {clinic.pricingSubtitle ||
            clinic.insuranceSubtitle ||
            `Clear, upfront fees at ${clinic.name || 'our practice'}. Transparent self-pay rates, verified insurance, and flexible installments.`}
        </p>
      </section>

      {/* 2. Side-by-Side Professional Pricing Table */}
      <section>
        <div
          className={`grid grid-cols-1 ${
            feeItems.length === 2
              ? 'md:grid-cols-2 max-w-4xl mx-auto'
              : feeItems.length === 3
              ? 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'
              : 'md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto'
          } gap-6 lg:gap-8 items-stretch`}
        >
          {feeItems.map((item, index) => {
            const isInitialExam = item.id.includes('new') || index === 0;
            return (
              <div
                key={item.id || index}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                  item.popular || isInitialExam
                    ? 'bg-white border-2 border-emerald-600/80 shadow-lg shadow-emerald-950/5 ring-1 ring-emerald-500/20'
                    : 'bg-white border border-stone-200/90 shadow-sm hover:border-stone-300'
                }`}
              >
                {/* Popular / Recommended Badge */}
                {(item.popular || isInitialExam || item.badge) && (
                  <div className="absolute -top-3.5 left-6 sm:left-8">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-800 text-emerald-50 shadow-xs">
                      {item.badge || 'Recommended First Step'}
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Title Header */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      {item.title}
                    </span>
                  </div>

                  {/* Price Row with Subtle Icon Next to Price */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${
                        item.popular || isInitialExam
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}
                      title={item.title}
                    >
                      {getFeeIcon(item.icon || (isInitialExam ? 'user' : 'refresh'))}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <h2 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
                        {item.price}
                      </h2>
                      <span className="text-xs font-medium text-stone-500">
                        {isInitialExam ? '/ initial visit' : '/ standard visit'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed min-h-[40px]">
                      {item.description}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="border-t border-stone-100" />

                  {/* What's Included Bullet List */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      What's Included
                    </p>
                    <ul className="space-y-2.5">
                      {(item.features && item.features.length > 0
                        ? item.features
                        : isInitialExam
                        ? defaultPricingFees[0].features
                        : defaultPricingFees[1].features
                      ).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                          <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-8 mt-auto">
                  <button
                    type="button"
                    onClick={() =>
                      openBookingModal(
                        undefined,
                        isInitialExam
                          ? 'initial'
                          : item.id === 'followup' || item.title.toLowerCase().includes('follow') || item.title.toLowerCase().includes('routine')
                          ? 'followup'
                          : 'custom',
                        item.title,
                        item.price
                      )
                    }
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      item.popular || isInitialExam
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book {item.title} ({item.price})</span>
                  </button>
                  <p className="text-[10px] text-center text-stone-400 mt-2">
                    Instant online confirmation • No upfront prepayment required
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Insurance & Payment with Grayscale Brand Logos */}
      <section className="p-6 sm:p-9 bg-white border border-stone-200 rounded-3xl space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                {clinic.insuranceTitle || 'Insurance & Approved Payer Networks'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {clinic.insuranceSubtitle ||
                'We work with major health insurers and provide stamped medical receipts for cash plan reimbursement.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCoverNotice(!showCoverNotice)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs shrink-0 self-start md:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Check My Cover</span>
          </button>
        </div>

        {/* Cover Check Notice Banner (Toggled by Button) */}
        {showCoverNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-2 animate-fade-in">
            <div className="font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>How We Verify Your Insurance:</span>
            </div>
            <p className="text-stone-700 leading-relaxed text-xs">
              When booking your initial consultation, let our front desk team know your insurer (e.g. Bupa, AXA Health, Aviva) and authorization code. We confirm your diagnostic eligibility directly, so you have zero unexpected out-of-pocket costs.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={`tel:${clinic.phoneRaw || clinic.phone}`}
                className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:underline text-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {clinic.phone} for immediate coverage check</span>
              </a>
              <span className="text-stone-400 text-xs">•</span>
              <button
                type="button"
                onClick={() => openBookingModal('Insurance Consultation')}
                className="font-bold text-emerald-800 hover:underline text-xs cursor-pointer"
              >
                Book with Insurance details →
              </button>
            </div>
          </div>
        )}

        {/* Grayscale/Branded Logos Grid */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Recognized Insurers & Cash Plans
          </p>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {insurers.map((name) => (
              <InsuranceLogoItem key={name} name={name} />
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500 border-t border-stone-100">
          <span>* Direct billing depends on individual policy pre-authorization terms.</span>
          <span className="text-stone-600 font-medium">HSA / FSA / Cash-pay receipts issued on same day.</span>
        </div>
      </section>

      {/* 4. Financing & Flexible Payment Plans (Requested Section) */}
      {isFinancingEnabled && (
        <section className="p-6 sm:p-9 bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl border border-stone-800 space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {financing.badge || '0% Interest Available'}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {financing.provider || 'Klarna & Patient Plans'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {financing.headline || 'Flexible Financing & Monthly Care Plans'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {financing.description ||
                  'Spread treatment fees over manageable monthly installments with zero interest so you never have to postpone your recovery.'}
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
              <button
                type="button"
                onClick={() => openBookingModal('Financing Inquiry')}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{financing.ctaText || 'Inquire About Payment Plans'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Financing Features List */}
          <div className="relative z-10 pt-4 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(financing.features && financing.features.length > 0
              ? financing.features
              : [
                  'Pay in 3 interest-free installments via Klarna',
                  '0% APR patient financing for multi-visit corrective plans',
                  'Instant digital application with soft credit check',
                ]
            ).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-300">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/40">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {financing.terms && (
            <p className="text-[11px] text-stone-400 relative z-10 italic">
              *{financing.terms}
            </p>
          )}
        </section>
      )}

      {/* 5. Cost Questions Accordion (Visually Distinct Answers) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Frequently Asked Questions About Fees
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {faqs.length} Questions
          </span>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isExpanded = expandedFaqIndex === i;
            return (
              <div
                key={f.q}
                className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs hover:border-stone-300"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : i)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      Q{i + 1}
                    </span>
                    <span className="font-serif font-bold text-stone-900 text-sm sm:text-base leading-snug">
                      {f.q}
                    </span>
                  </div>
                  <div className="p-1 rounded-md text-stone-400 hover:text-stone-900 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-stone-100 bg-stone-50/75">
                    <p className="text-stone-500 font-normal text-xs sm:text-sm leading-relaxed pl-9 border-l-2 border-emerald-600/30">
                      {f.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Bottom Reassurance Callout */}
      <section className="p-8 sm:p-10 bg-stone-900 text-white rounded-3xl text-center space-y-5 shadow-xl">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Immediate Practice Triage
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold">
          Questions about cost, coverage, or care?
        </h2>
        <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Speak with our patient care coordinator at {clinic.phone}. We review your individual case, check policy benefits, and find an appointment that fits your schedule.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <button
            type="button"
            onClick={() => openBookingModal('Pricing Consultation')}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-7 py-3 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20 text-xs tracking-wide"
          >
            {clinic.offerCtaText || 'BOOK INITIAL CONSULTATION'}
          </button>
          <a
            href={`tel:${clinic.phoneRaw || clinic.phone}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-750 text-stone-200 font-bold px-6 py-3 rounded-xl transition text-xs border border-stone-700"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call {clinic.phone}</span>
          </a>
          <Link
            to="/first-visit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-750 text-stone-200 font-bold px-6 py-3 rounded-xl transition text-xs border border-stone-700"
          >
            <FileCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>First Visit Guide</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
