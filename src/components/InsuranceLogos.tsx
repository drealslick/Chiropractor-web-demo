import React from 'react';
import { Shield, CreditCard, CheckCircle2, Heart, Award, Check, Plus, Activity } from 'lucide-react';

interface InsuranceLogoProps {
  name: string;
  className?: string;
}

export const InsuranceLogoItem: React.FC<InsuranceLogoProps> = ({ name, className = '' }) => {
  const normalized = name.toLowerCase().trim();
  const baseCard = `inline-flex items-center gap-2 px-3.5 py-2.5 bg-stone-50/80 hover:bg-white border border-stone-200/90 rounded-xl shadow-2xs hover:border-stone-400 grayscale contrast-125 opacity-85 hover:grayscale-0 hover:opacity-100 transition-all duration-200 group cursor-default select-none ${className}`;

  // BUPA (UK / Global)
  if (normalized.includes('bupa')) {
    return (
      <div className={baseCard} title="Bupa Recognized Healthcare Provider">
        <div className="w-5 h-5 rounded-md bg-stone-900 text-white flex items-center justify-center font-bold text-xs font-serif tracking-tighter">
          B
        </div>
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-sm tracking-tight text-stone-800 leading-none group-hover:text-stone-950">
            Bupa<span className="text-emerald-700">.</span>
          </span>
          <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold leading-none mt-0.5">
            Recognized
          </span>
        </div>
      </div>
    );
  }

  // AXA HEALTH / AXA PPP
  if (normalized.includes('axa')) {
    return (
      <div className={baseCard} title="AXA Health Approved Provider">
        <div className="flex items-center">
          <span className="font-black text-base tracking-tighter text-stone-900 font-sans leading-none">
            AXA
          </span>
          <span className="w-1.5 h-3.5 bg-stone-700 group-hover:bg-red-700 transform rotate-12 mx-1 rounded-2xs inline-block transition-colors" />
          <span className="text-xs font-semibold text-stone-600 tracking-tight leading-none">
            Health
          </span>
        </div>
      </div>
    );
  }

  // AVIVA
  if (normalized.includes('aviva')) {
    return (
      <div className={baseCard} title="Aviva Healthcare Provider">
        <div className="w-4 h-4 rounded bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-700 font-bold text-[9px]">
          ▲
        </div>
        <span className="font-extrabold text-xs tracking-tight text-stone-900 uppercase">
          AVIVA
        </span>
      </div>
    );
  }

  // VITALITY
  if (normalized.includes('vitality')) {
    return (
      <div className={baseCard} title="VitalityHealth Approved Clinic">
        <div className="w-4 h-4 rounded-full bg-stone-800 text-stone-200 group-hover:text-rose-400 flex items-center justify-center font-bold text-xs">
          <Heart className="w-2.5 h-2.5 fill-current" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-xs tracking-tight text-stone-900 leading-none">
            Vitality
          </span>
          <span className="text-[8px] uppercase tracking-wider text-stone-400 font-medium leading-none mt-0.5">
            Health
          </span>
        </div>
      </div>
    );
  }

  // WPA
  if (normalized.includes('wpa')) {
    return (
      <div className={baseCard} title="WPA Not-For-Profit Health Insurer">
        <Shield className="w-4 h-4 text-stone-700 shrink-0" />
        <div className="flex flex-col text-left">
          <span className="font-black text-xs tracking-widest text-stone-900 leading-none">
            WPA
          </span>
          <span className="text-[8px] text-stone-400 font-medium leading-none mt-0.5">
            Healthcare
          </span>
        </div>
      </div>
    );
  }

  // SIMPLYHEALTH
  if (normalized.includes('simplyhealth') || normalized.includes('simply health')) {
    return (
      <div className={baseCard} title="Simplyhealth Cash Plan Provider">
        <div className="w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center font-serif text-[10px] font-bold">
          S
        </div>
        <span className="font-bold text-xs tracking-tight text-stone-900">
          Simplyhealth
        </span>
      </div>
    );
  }

  // HEALIX
  if (normalized.includes('healix')) {
    return (
      <div className={baseCard} title="Healix Health Services">
        <div className="w-4 h-4 rounded bg-stone-900 text-white flex items-center justify-center text-[9px] font-bold">
          +
        </div>
        <span className="font-bold text-xs tracking-tight text-stone-900 uppercase">
          HEALIX
        </span>
      </div>
    );
  }

  // CIGNA
  if (normalized.includes('cigna')) {
    return (
      <div className={baseCard} title="Cigna Global Healthcare">
        <div className="w-4 h-4 rounded-full border border-stone-800 flex items-center justify-center text-stone-800 font-bold text-[9px]">
          ©
        </div>
        <span className="font-bold text-xs tracking-tight text-stone-900">
          Cigna
        </span>
      </div>
    );
  }

  // AETNA
  if (normalized.includes('aetna')) {
    return (
      <div className={baseCard} title="Aetna Healthcare Network">
        <span className="font-serif font-black text-xs tracking-tighter text-stone-900">
          aetna
        </span>
      </div>
    );
  }

  // BLUE CROSS BLUE SHIELD / ANTHEM
  if (normalized.includes('anthem') || normalized.includes('blue cross') || normalized.includes('bcbs')) {
    return (
      <div className={baseCard} title="Blue Cross Blue Shield / Anthem">
        <Shield className="w-3.5 h-3.5 text-stone-800 fill-stone-100 shrink-0" />
        <span className="font-bold text-xs tracking-tight text-stone-900">
          BlueCross BlueShield
        </span>
      </div>
    );
  }

  // UNITEDHEALTHCARE / UHC / OPTUM
  if (normalized.includes('united') || normalized.includes('uhc') || normalized.includes('optum')) {
    return (
      <div className={baseCard} title="UnitedHealthcare Network">
        <span className="font-bold text-xs tracking-tight text-stone-900">
          UnitedHealthcare
        </span>
      </div>
    );
  }

  // HUMANA
  if (normalized.includes('humana')) {
    return (
      <div className={baseCard} title="Humana Healthcare">
        <div className="w-4 h-4 rounded bg-emerald-900 text-white flex items-center justify-center font-bold text-[9px]">
          H
        </div>
        <span className="font-bold text-xs tracking-tight text-stone-900">
          Humana
        </span>
      </div>
    );
  }

  // KAISER PERMANENTE
  if (normalized.includes('kaiser')) {
    return (
      <div className={baseCard} title="Kaiser Permanente">
        <span className="font-semibold text-xs tracking-tight text-stone-900">
          Kaiser Permanente
        </span>
      </div>
    );
  }

  // ALLIANZ
  if (normalized.includes('allianz')) {
    return (
      <div className={baseCard} title="Allianz Care">
        <div className="w-4 h-4 rounded bg-stone-900 text-white flex items-center justify-center font-bold text-[9px]">
          A
        </div>
        <span className="font-bold text-xs tracking-tight text-stone-900 uppercase">
          Allianz Care
        </span>
      </div>
    );
  }

  // SUN LIFE / MANULIFE / CANADA LIFE
  if (normalized.includes('sun life') || normalized.includes('sunlife')) {
    return (
      <div className={baseCard} title="Sun Life Financial">
        <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
          ☀
        </div>
        <span className="font-bold text-xs tracking-tight text-stone-900">
          Sun Life
        </span>
      </div>
    );
  }

  if (normalized.includes('manulife')) {
    return (
      <div className={baseCard} title="Manulife Financial">
        <span className="font-bold text-xs tracking-tight text-stone-900 uppercase">
          Manulife
        </span>
      </div>
    );
  }

  // MEDIBANK / NIB / BUPA AU (Australia)
  if (normalized.includes('medibank')) {
    return (
      <div className={baseCard} title="Medibank Private">
        <div className="w-4 h-4 rounded-full bg-red-700 text-white flex items-center justify-center text-[9px] font-bold">
          M
        </div>
        <span className="font-bold text-xs tracking-tight text-stone-900">
          medibank
        </span>
      </div>
    );
  }

  if (normalized.includes('nib')) {
    return (
      <div className={baseCard} title="NIB Health Insurance">
        <span className="font-black text-xs tracking-tighter text-emerald-800 uppercase">
          nib
        </span>
      </div>
    );
  }

  if (normalized.includes('hcf')) {
    return (
      <div className={baseCard} title="HCF Health Insurance">
        <Shield className="w-3.5 h-3.5 text-red-700 shrink-0" />
        <span className="font-bold text-xs tracking-tight text-stone-900">
          HCF
        </span>
      </div>
    );
  }

  // MEDICARE / MEDICAID
  if (normalized.includes('medicare') || normalized.includes('medicaid')) {
    return (
      <div className={baseCard} title="Medicare & Supplemental Plans">
        <Award className="w-3.5 h-3.5 text-stone-700" />
        <span className="font-semibold text-xs tracking-tight text-stone-900">
          Medicare Accepted
        </span>
      </div>
    );
  }

  // HSA / FSA
  if (normalized.includes('hsa') || normalized.includes('fsa')) {
    return (
      <div className={baseCard} title="Health Savings & Flexible Spending Accounts">
        <CreditCard className="w-3.5 h-3.5 text-stone-600" />
        <span className="font-semibold text-xs tracking-tight text-stone-900">
          HSA / FSA Cards
        </span>
      </div>
    );
  }

  // SELF-PAY / CASH
  if (normalized.includes('self-pay') || normalized.includes('self pay') || normalized.includes('cash')) {
    return (
      <div className={baseCard} title="Self-Pay & Direct Cash Pricing">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold text-xs tracking-tight text-stone-900">
          Self-Pay Transparent
        </span>
      </div>
    );
  }

  // DYNAMIC MONOGRAM BADGE FOR ANY CUSTOM / REGIONAL INSURER
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className={baseCard} title={`${name} Recognized Healthcare Cover`}>
      <div className="w-5 h-5 rounded-md bg-stone-850 text-emerald-400 border border-stone-700 flex items-center justify-center font-bold text-[10px] font-mono tracking-tighter shrink-0 shadow-2xs group-hover:bg-emerald-950 group-hover:border-emerald-700 group-hover:text-emerald-300 transition-colors">
        {initials || <Shield className="w-3 h-3 text-emerald-400" />}
      </div>
      <div className="flex flex-col text-left">
        <span className="font-bold text-xs tracking-tight text-stone-900 group-hover:text-emerald-950 transition-colors">
          {name}
        </span>
        <span className="text-[8px] uppercase tracking-wider text-stone-400 font-medium leading-none">
          Verified Payer
        </span>
      </div>
    </div>
  );
};
