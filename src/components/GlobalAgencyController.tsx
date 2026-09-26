import React, { useState, useEffect } from 'react';
import { useClinic } from '../data/ClinicContext';
import { AgencyWorkspace } from './AgencyWorkspace';
import { resolvePalette, generateCustomShades } from '../data/colorPalettes';
import { Lock, Sliders, Shield, AlertCircle, RefreshCw, Mail, LogOut, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminOrStaff, setIsAdminOrStaff] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Sign-in form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Discreet floating quick-access button (only shown when explicitly enabled)
  const [showAdminButton, setShowAdminButton] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vance_show_admin_button') === 'true';
    } catch {
      return false;
    }
  });

  // Verify whether a Firebase Auth user has admin or staff privileges
  const verifyUserRole = async (user: User | null): Promise<boolean> => {
    if (!user) return false;
    try {
      // 1. Check custom claims in JWT token
      const tokenResult = await getIdTokenResult(user);
      const role = tokenResult.claims.role;
      const isAdminClaim = tokenResult.claims.admin === true || tokenResult.claims.superAdmin === true;

      if (role === 'admin' || role === 'staff' || isAdminClaim) {
        return true;
      }

      // 2. Fallback check to users/{uid} in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role === 'admin' || data.role === 'staff') {
          return true;
        }
      }

      return false;
    } catch (err) {
      console.warn('Error verifying admin authorization:', err);
      return false;
    }
  };

  // Listen to Firebase Auth state directly (No custom sessionStorage tokens)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsCheckingAuth(true);
      if (user) {
        setCurrentUser(user);
        const authorized = await verifyUserRole(user);
        setIsAdminOrStaff(authorized);
      } else {
        setCurrentUser(null);
        setIsAdminOrStaff(false);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. URL params (?admin=true), Keyboard shortcut (Cmd+Shift+C), and custom events
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAdminParam =
        urlParams.get('admin') === 'true' ||
        urlParams.get('agency') === 'true' ||
        urlParams.get('staff') === 'true' ||
        urlParams.get('edit') === 'true';

      if (hasAdminParam) {
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
        setIsOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => {
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
      
      Object.entries(config.variables).forEach(([cssVar, colorVal]) => {
        root.style.setProperty(cssVar, colorVal);
      });

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

  // Production Firebase Auth Sign-in (Strict custom claims verification)
  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setError('Please provide your clinic administrator email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const cred = await signInWithEmailAndPassword(auth, adminEmail.trim().toLowerCase(), adminPassword);
      const authorized = await verifyUserRole(cred.user);

      if (authorized) {
        setIsAdminOrStaff(true);
        setCurrentUser(cred.user);
      } else {
        // Sign out immediately if role check fails
        await signOut(auth);
        setIsAdminOrStaff(false);
        setCurrentUser(null);
        setError('Access Denied: Your account role does not have administrative privileges for this clinic.');
      }
    } catch (err: any) {
      let msg = 'Invalid administrative credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify your administrator credentials.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again in a few minutes.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign-out note:', err);
    }
    setIsAdminOrStaff(false);
    setCurrentUser(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Discreet floating quick-access button */}
      {showAdminButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-stone-900 hover:bg-stone-850 text-stone-200 hover:text-white px-3 py-2 rounded-xl shadow-2xl border border-stone-700/80 backdrop-blur transition flex items-center gap-2 text-xs font-semibold cursor-pointer active:scale-95"
          title="Admin settings"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Practice Admin</span>
          <Sliders className="w-3.5 h-3.5 text-stone-400" />
        </button>
      )}

      {/* Admin Gating: Never render admin shell unless authenticated with admin or staff role */}
      {isOpen && (
        !isAdminOrStaff ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-6 text-stone-100 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Practice Admin Portal</h3>
                  <p className="text-[11px] text-stone-400">Role-Based Access Control</p>
                </div>
              </div>

              <div className="p-2.5 my-3 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Sign in with your verified clinic administrator or staff account. Role claims are enforced via Firebase Auth.
                </span>
              </div>

              {isCheckingAuth ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-stone-400">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span>Verifying authorization...</span>
                </div>
              ) : (
                <form onSubmit={handleFirebaseLogin} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-stone-300 block mb-1">Staff / Director Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        autoFocus
                        placeholder="admin@vancehealth.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-750 bg-stone-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-stone-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-300 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full rounded-xl border border-stone-750 bg-stone-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-stone-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <span>Sign In to Admin Workspace</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-1.5 text-xs text-stone-400 hover:text-white transition text-center cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Authenticated Admin Shell (Zero render until verified) */
          <AgencyWorkspace
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            clinic={clinic}
            onUpdateClinic={updateClinic}
            onResetDefault={resetClinic}
            syncStatus={syncStatus}
            lastSaved={lastSaved}
            hasSupabase={hasSupabase}
            onSignOut={handleSignOut}
          />
        )
      )}
    </>
  );
}
