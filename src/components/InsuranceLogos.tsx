import React from 'react';
import { Shield, CreditCard, CheckCircle2, Heart, Award } from 'lucide-react';

interface InsuranceLogoProps {
  name: string;
  className?: string;
}

export const InsuranceLogoItem: React.FC<InsuranceLogoProps> = ({ name, className = '' }) => {
  const normalized = name.toLowerCase().trim();
  const baseCard = `inline-flex items-center gap-2 px-3.5 py-2.5 bg-stone-50/70 hover:bg-white border border-stone-200 rounded-xl shadow-2xs hover:border-stone-400 grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-200 group cursor-default select-none ${className}`;

  // BUPA
  if (normalized.includes('bupa')) {
    return (
      <div
        className={baseCard}
        title="Bupa Recognized Healthcare Provider"
      >
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
      <div
        className={baseCard}
        title="AXA Health Approved Provider"
      >
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
      <div
        className={baseCard}
        title="Aviva Healthcare Provider"
      >
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
      <div
        className={baseCard}
        title="VitalityHealth Approved Clinic"
      >
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

  // WPA (Western Provident Association)
  if (normalized.includes('wpa')) {
    return (
      <div
        className={baseCard}
        title="WPA Not-For-Profit Health Insurer"
      >
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

  // CIGNA
  if (normalized.includes('cigna')) {
    return (
      <div
        className={baseCard}
        title="Cigna Global Healthcare"
      >
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
      <div
        className={baseCard}
        title="Aetna Healthcare Network"
      >
        <span className="font-serif font-black text-xs tracking-tighter text-stone-900">
          aetna
        </span>
      </div>
    );
  }

  // ANTHEM / BLUE CROSS BLUE SHIELD
  if (normalized.includes('anthem') || normalized.includes('blue cross')) {
    return (
      <div
        className={baseCard}
        title="Blue Cross Blue Shield / Anthem"
      >
        <Shield className="w-3.5 h-3.5 text-stone-800 fill-stone-100 shrink-0" />
        <span className="font-bold text-xs tracking-tight text-stone-900">
          BlueCross BlueShield
        </span>
      </div>
    );
  }

  // UNITEDHEALTHCARE
  if (normalized.includes('united') || normalized.includes('uhc')) {
    return (
      <div
        className={baseCard}
        title="UnitedHealthcare Network"
      >
        <span className="font-bold text-xs tracking-tight text-stone-900">
          UnitedHealthcare
        </span>
      </div>
    );
  }

  // MEDICARE / MEDICAID
  if (normalized.includes('medicare') || normalized.includes('medicaid')) {
    return (
      <div
        className={baseCard}
        title="Medicare & Supplemental Plans"
      >
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
      <div
        className={baseCard}
        title="Health Savings & Flexible Spending Accounts"
      >
        <CreditCard className="w-3.5 h-3.5 text-stone-600" />
        <span className="font-semibold text-xs tracking-tight text-stone-900">
          HSA / FSA Cards
        </span>
      </div>
    );
  }

  // SELF-PAY / CASH
  if (normalized.includes('self-pay') || normalized.includes('cash')) {
    return (
      <div
        className={baseCard}
        title="Self-Pay & Direct Cash Pricing"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold text-xs tracking-tight text-stone-900">
          Self-Pay Transparent
        </span>
      </div>
    );
  }

  // Generic / Custom Insurer
  return (
    <div
      className={baseCard}
      title={name}
    >
      <Shield className="w-3.5 h-3.5 text-stone-500" />
      <span className="font-semibold text-xs tracking-tight text-stone-800">
        {name}
      </span>
    </div>
  );
};
