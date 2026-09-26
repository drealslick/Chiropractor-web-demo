import React, { useState, useEffect } from 'react';
import { useClinic } from '../data/ClinicContext';
import { AgencyWorkspace } from './AgencyWorkspace';
import { resolvePalette, generateCustomShades } from '../data/colorPalettes';
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

  // By default, the admin quick-access button is hidden on patient-facing devices
  const [showAdminButton, setShowAdminButton] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vance_show_admin_button') === 'true';
    } catch {
      return false;
    }
  });

  // 1. Keyboard shortcut (Cmd+Shift+C), URL params (?admin=true), and custom events
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
        setShowAdminButton(true);
        localStorage.setItem('vance_show_admin_button', 'true');
      } else if (urlParams.get('admin') === 'false') {
        setShowAdminButton(false);
        localStorage.setItem('vance_show_admin_button', 'false');
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

    const handleCustomOpen = () => {
      setIsStaffMode(true);
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-practice-admin', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-practice-admin', handleCustomOpen);
    };
  }, []);

  // 2. Global CSS Variables & Color Themes injection across all pages
  useEffect(() => {
    const config = resolvePalette(clinic.colorPalette);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Inject all palette variables (primary shades 50-950, page bg, muted bg, accent, text)
      Object.entries(config.variables).forEach(([cssVar, colorVal]) => {
        root.style.setProperty(cssVar, colorVal);
      });

      // If user specified custom primary color, compute full gradient shades
      if (clinic.customPrimaryColor) {
        const customShades = generateCustomShades(clinic.customPrimaryColor);
        Object.entries(customShades).forEach(([cssVar, colorVal]) => {
          root.style.setProperty(cssVar, colorVal);
        });
      }
      if (clinic.customAccentColor) {
        root.style.setProperty('--theme-accent', clinic.customAccentColor);
        root.style.setProperty('--color-accent', clinic.customAccentColor);
      }
      if (clinic.customBgColor) {
        root.style.setProperty('--theme-bg-page', clinic.customBgColor);
        root.style.setProperty('--color-bg', clinic.customBgColor);
      }
      if (clinic.customTextColor) {
        root.style.setProperty('--theme-text', clinic.customTextColor);
        root.style.setProperty('--color-text', clinic.customTextColor);
      }
    }
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

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = passcode.trim();
    if (clean === '1234' || clean === 'admin' || clean === 'Slick2026!' || clean === 'demo' || clean === '') {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect passcode (Use 1234 or click Unlock Demo)');
    }
  };

  return (
    <>
      {/* Discreet floating quick-access button */}
      {showAdminButton && (
        <button
          onClick={() => {
            setIsStaffMode(true);
            setIsOpen(true);
          }}
          className="fixed bottom-4 right-4 z-50 bg-stone-900 hover:bg-stone-850 text-stone-200 hover:text-white px-3 py-2 rounded-xl shadow-2xl border border-stone-700/80 backdrop-blur transition flex items-center gap-2 text-xs font-semibold cursor-pointer active:scale-95"
          title="Admin settings"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Practice Admin</span>
          <Sliders className="w-3.5 h-3.5 text-stone-400" />
        </button>
      )}

      {/* Passcode Gate or Full Workspace */}
      {isOpen && (
        !isUnlocked ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-6 text-stone-100 shadow-2xl">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Practice Control Panel</h3>
                  <p className="text-[11px] text-stone-400">Front Desk & Administrative Portal</p>
                </div>
              </div>
              <p className="mb-4 text-xs text-stone-400 mt-2">
                Enter your staff passcode (<code className="text-emerald-400 font-mono">1234</code>) or tap below:
              </p>

              <form onSubmit={handleUnlock}>
                <div className="relative mb-3">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter passcode (e.g. 1234)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-800/90 pl-10 pr-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer shadow-lg shadow-emerald-900/30"
                  >
                    Unlock with Passcode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnlocked(true);
                      setError('');
                    }}
                    className="w-full rounded-xl bg-stone-800 hover:bg-stone-750 py-2 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition cursor-pointer"
                  >
                    ⚡ Quick Unlock Demo (1-Tap)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-1.5 text-xs text-stone-400 hover:text-white transition cursor-pointer text-center"
                  >
                    Close
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
