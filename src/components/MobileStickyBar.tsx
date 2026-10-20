import React from 'react';
import { Phone, Calendar } from 'lucide-react';
import { ClinicInfo } from '../types';
import { useClinic } from '../data/ClinicContext';

interface MobileStickyBarProps {
  clinic: ClinicInfo;
  onBookClick: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({ clinic, onBookClick }) => {
  const { activeLocation } = useClinic();
  const displayedPhone = activeLocation?.phone || clinic.phone;
  const phoneHref = activeLocation?.phoneRaw || clinic.phoneRaw;
  return (
    <aside
      aria-label="Quick contact and booking bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 p-2.5 px-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl"
    >
      <div className="flex items-center gap-3">
        {/* [CALL] */}
        <a
          href={`tel:${phoneHref}`}
          aria-label={`Call ${displayedPhone}`}
          id="mobile-sticky-call-btn"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-sm tracking-wide transition-colors active:scale-[0.98]"
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>CALL</span>
        </a>

        {/* [BOOK] */}
        <button
          onClick={onBookClick}
          id="mobile-sticky-book-btn"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-colors active:scale-[0.98] shadow-md cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-emerald-100" />
          <span>BOOK</span>
        </button>
      </div>
    </aside>
  );
};
