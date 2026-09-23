import React, { useState } from 'react';
import { AlertCircle, Bell, Info, ShieldAlert, X } from 'lucide-react';
import { AnnouncementBannerConfig } from '../types';

interface GlobalAnnouncementBannerProps {
  banner?: AnnouncementBannerConfig;
}

export function GlobalAnnouncementBanner({ banner }: GlobalAnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!banner || !banner.enabled || !banner.message || dismissed) {
    return null;
  }

  const variantStyles = {
    amber: {
      bg: 'bg-amber-500 text-stone-950 border-amber-600',
      badge: 'bg-stone-950 text-amber-300',
      icon: AlertCircle,
    },
    rose: {
      bg: 'bg-rose-600 text-white border-rose-700',
      badge: 'bg-white text-rose-800 font-bold',
      icon: ShieldAlert,
    },
    emerald: {
      bg: 'bg-emerald-600 text-white border-emerald-700',
      badge: 'bg-emerald-950 text-emerald-200',
      icon: Bell,
    },
    indigo: {
      bg: 'bg-indigo-600 text-white border-indigo-700',
      badge: 'bg-indigo-950 text-indigo-200',
      icon: Info,
    },
    stone: {
      bg: 'bg-stone-900 text-stone-100 border-stone-800',
      badge: 'bg-stone-800 text-stone-300',
      icon: Info,
    },
  };

  const current = variantStyles[banner.variant || 'amber'] || variantStyles.amber;
  const Icon = current.icon;

  return (
    <aside
      aria-label="Announcement"
      className={`${current.bg} py-2 px-4 text-xs font-medium border-b transition-all duration-200 shadow-sm relative z-40`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center text-center">
          <Icon className="w-3.5 h-3.5 shrink-0" />
          {banner.badge && (
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${current.badge}`}>
              {banner.badge}
            </span>
          )}
          <span className="leading-snug">{banner.message}</span>
          {banner.linkText && banner.linkUrl && (
            <a
              href={banner.linkUrl}
              className="underline font-bold ml-1 hover:opacity-80 transition inline-flex items-center gap-0.5"
            >
              {banner.linkText} →
            </a>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:opacity-75 transition shrink-0 rounded"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
