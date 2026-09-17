import React from 'react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { ClinicInfo } from '../types';

interface StickyOfferBannerProps {
  clinic: ClinicInfo;
  onClaim: () => void;
}

export const StickyOfferBanner: React.FC<StickyOfferBannerProps> = ({ clinic, onClaim }) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || clinic.showStickyBanner === false) return null;

  return (
    <div className="bg-emerald-900 text-emerald-50 border-b border-emerald-950/40 relative z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 text-[11px] font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Special
          </span>
          <span className="font-medium text-emerald-100">
            <strong className="text-white font-semibold">{clinic.offerHeadline}</strong>
            <span className="hidden sm:inline text-emerald-200/80 ml-2">— {clinic.offerSubtext}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClaim}
            id="offer-claim-button"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded transition-colors active:scale-95 cursor-pointer shadow-sm"
          >
            <span>{clinic.offerCtaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-emerald-300 hover:text-white transition-colors rounded hover:bg-emerald-800/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
