import React from 'react';
import { ClinicInfo } from '../types';

interface LoadingScreenProps {
  clinic?: ClinicInfo | null;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ clinic }) => {
  const clinicName = clinic?.name || 'Vance Health Practice Architecture';
  const logoUrl = clinic?.logoUrl || clinic?.logoImage || (clinic as any)?.logo;
  const initial = (clinic?.logoText || clinicName || 'V').charAt(0).toUpperCase();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-stone-50 text-stone-900 selection:bg-emerald-500 selection:text-white transition-opacity duration-300"
      aria-label="Loading Practice Application"
      role="status"
    >
      <div className="flex flex-col items-center justify-center gap-5 text-center px-6">
        {/* Subtle Pulsing Clinic Badge (Strictly no generic circular spinner) */}
        <div className="w-16 h-16 rounded-2xl bg-stone-900 text-stone-50 flex items-center justify-center font-serif text-2xl font-bold tracking-tight shadow-md border border-stone-800 animate-pulse">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={clinicName}
              className="w-12 h-12 object-contain rounded-xl"
              onError={(e) => {
                // Fallback to initial if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        {/* Text-based title & loading state in site's font */}
        <div className="space-y-1.5 animate-pulse">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            {clinicName}
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
};
