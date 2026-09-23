import React, { useState, useEffect } from 'react';
import { useClinic } from '../data/ClinicContext';
import { AgencyWorkspace } from './AgencyWorkspace';
import { resolvePalette } from '../data/colorPalettes';
import { Lock, Sliders, Shield } from 'lucide-react';

export function GlobalAgencyController() {
  const {
    clinicData: clinic,
    updateClinic,
    resetClinic,
    syncStatus,
    lastSaved,
    hasSupabase,
  } = useClinic();

  const [isOpen, setIsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isStaffMode, setIsStaffMode] = useState(false);

  // 1. Keyboard shortcut (Cmd+Shift+C) and URL params (?admin=true, ?agency=true)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAdminParam =
        urlParams.get('admin') === 'true' ||
        urlParams.get('agency') === 'true' ||
        urlParams.get('staff') === 'true' ||
        urlParams.get('edit') === 'true';

      if (hasAdminParam) {
        setIsStaffMode(true);
        setIsOpen(true);
      }
    } catch {
      // Ignore
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsStaffMode(true);
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Global CSS Variables & Color Themes injection across all pages
  useEffect(() => {
    const config = resolvePalette(clinic.colorPalette);
    const primary = clinic.customPrimaryColor || config.variables['--color-primary'];
    const accent = clinic.customAccentColor || config.variables['--color-accent'];
    const bg = clinic.customBgColor || config.variables['--color-bg'];
    const text = clinic.customTextColor || config.variables['--color-text'];

    const root = document.documentElement;
    root.style.setProperty('--theme-primary-500', primary);
    root.style.setProperty('--theme-primary-600', primary);
    root.style.setProperty('--theme-primary-700', primary);
    root.style.setProperty('--theme-primary-800', primary);
    root.style.setProperty('--theme-accent', accent);
    root.style.setProperty('--theme-bg-page', bg);
    root.style.setProperty('--theme-primary-950', text);
    root.style.setProperty('--color-primary', primary);
  }, [
    clinic.colorPalette,
    clinic.customPrimaryColor,
    clinic.customAccentColor,
    clinic.customBgColor,
    clinic.customTextColor,
  ]);

  // 3. Global Dynamic Font Pairing injection across all pages
  useEffect(() => {
    const fontPair = clinic.fontPairing || 'classic-editorial';
    let headingVal = "'Playfair Display', serif";
    let bodyVal = "'Plus Jakarta Sans', sans-serif";

    switch (fontPair) {
      case 'modern-sans':
        headingVal = "'Inter', sans-serif";
        bodyVal = "'Montserrat', sans-serif";
        break;
      case 'warm-editorial':
        headingVal = "'Lora', serif";
        bodyVal = "'Inter', sans-serif";
        break;
      case 'bold-contemporary':
        headingVal = "'Syne', sans-serif";
        bodyVal = "'Space Grotesk', sans-serif";
        break;
      case 'refined-elegance':
        headingVal = "'Cinzel', serif";
        bodyVal = "'Plus Jakarta Sans', sans-serif";
        break;
      default:
        headingVal = "'Playfair Display', serif";
        bodyVal = "'Plus Jakarta Sans', sans-serif";
        break;
    }

    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--font-heading', headingVal);
      document.documentElement.style.setProperty('--font-body', bodyVal);
    }
  }, [clinic.fontPairing]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Slick2026!') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect passcode');
    }
  };

  return (
    <>
      {/* Discreet floating quick-access button when in staff mode */}
      {isStaffMode && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-stone-900/90 hover:bg-stone-900 text-stone-200 hover:text-emerald-400 p-2.5 rounded-full shadow-2xl border border-stone-700/80 backdrop-blur transition flex items-center gap-1.5 text-xs font-semibold group cursor-pointer"
          title="Agency Command Suite (Cmd+Shift+C)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline font-mono text-[11px]">Agency Suite</span>
          <Sliders className="w-4 h-4 text-emerald-400" />
        </button>
      )}

      {/* Passcode Gate or Full Workspace */}
      {isOpen && (
        !isUnlocked ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-6 text-white shadow-2xl animate-fadeIn">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold">Admin Verification</h3>
              </div>
              <p className="mb-4 text-xs text-stone-400 leading-relaxed">
                Enter passcode to access Omniscient Agency Suite.
              </p>

              <form onSubmit={handleUnlock}>
                <div className="relative mb-2">
                  <Lock className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter secret passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-800/80 pl-9 pr-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-lg cursor-pointer"
                  >
                    Unlock Suite
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <AgencyWorkspace
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            clinic={clinic}
            onUpdateClinic={updateClinic}
            onResetDefault={resetClinic}
            syncStatus={syncStatus}
            lastSaved={lastSaved}
            hasSupabase={hasSupabase}
          />
        )
      )}
    </>
  );
}
