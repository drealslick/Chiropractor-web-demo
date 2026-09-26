import React, { useState, useEffect } from 'react';
import { useClinic } from '../data/ClinicContext';
import { AgencyWorkspace } from './AgencyWorkspace';
import { resolvePalette, generateCustomShades } from '../data/colorPalettes';
import { Lock, Sliders, Shield, AlertCircle, RefreshCw, Mail, LogOut, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { auth, db, functions } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  getIdTokenResult,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

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

  // Deployment onboarding state
  const [isUnclaimedDeployment, setIsUnclaimedDeployment] = useState<boolean>(false);
  const [claimMode, setClaimMode] = useState<boolean>(false);
  const [newClinicId, setNewClinicId] = useState('');
  const [newClinicName, setNewClinicName] = useState('');
  const [setupToken, setSetupToken] = useState('');

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

  // Check if this deployment has already been claimed by a primary administrator
  const checkDeploymentClaimStatus = async () => {
    try {
      const configSnap = await getDoc(doc(db, 'clinic_config', 'active'));
      if (!configSnap.exists() || !configSnap.data()?.adminClaimed) {
        setIsUnclaimedDeployment(true);
      } else {
        setIsUnclaimedDeployment(false);
      }
    } catch (err) {
      console.warn('Deployment claim check notice:', err);
    }
  };

  useEffect(() => {
    checkDeploymentClaimStatus();
  }, [isOpen]);

  // Verify whether a Firebase Auth user has admin or staff privileges via JWT custom claims
  const verifyUserRole = async (user: User | null): Promise<boolean> => {
    if (!user) return false;
    try {
      // Check cryptographic custom claims in JWT token directly (no document fallback)
      const tokenResult = await getIdTokenResult(user);
      const role = tokenResult.claims.role;
      const isSuperAdmin = tokenResult.claims.superAdmin === true;

      return role === 'admin' || role === 'staff' || isSuperAdmin;
    } catch (err) {
      console.warn('Error verifying admin authorization:', err);
      return false;
    }
  };

  // Listen to Firebase Auth state directly
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

  // First-Run Deployment Claim Flow
  const handleClaimClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim() || !newClinicId.trim() || !setupToken.trim()) {
      setError('Please provide Clinic ID, Deployment Setup Token, Admin Email, and Password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let user = auth.currentUser;
      if (!user) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, adminEmail.trim().toLowerCase(), adminPassword);
          user = cred.user;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            const cred = await signInWithEmailAndPassword(auth, adminEmail.trim().toLowerCase(), adminPassword);
            user = cred.user;
          } else {
            throw createErr;
          }
        }
      }

      // Call transactional claim function on backend with deploy-time secret
      const claimFn = httpsCallable(functions, 'claimInitialClinicAdmin');
      await claimFn({
        setupToken: setupToken.trim(),
        clinicId: newClinicId.trim(),
        clinicName: newClinicName.trim() || 'My Clinic',
      });

      // Force token refresh to pick up new admin custom claims
      await getIdToken(user, true);
      const authorized = await verifyUserRole(user);

      if (authorized) {
        setIsAdminOrStaff(true);
        setCurrentUser(user);
        setIsUnclaimedDeployment(false);
        setClaimMode(false);
      } else {
        setError('Claims assigned! Please sign in with your administrator credentials.');
        setClaimMode(false);
      }
    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim clinic deployment.');
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
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-40 bg-stone-900/95 hover:bg-stone-850 text-stone-200 border border-stone-750 hover:border-indigo-500/80 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md transition-all cursor-pointer group hover:scale-105"
          title="Open Admin Workspace & SaaS Cockpit (Shift+A)"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-700/80 text-indigo-400 flex items-center justify-center font-bold">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span>Admin & SaaS Cockpit</span>
          <span className="bg-indigo-900/80 text-indigo-300 font-mono text-[10px] px-1.5 py-0.5 rounded-md border border-indigo-700/60 group-hover:bg-indigo-600 group-hover:text-white transition">
            Shift+A
          </span>
        </button>
      )}

      {isOpen && (
        !isAdminOrStaff ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-6 text-stone-100 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {claimMode ? 'Claim Clinic Deployment' : 'Practice Admin Portal'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {claimMode ? 'First-Run Primary Admin Setup' : 'Role-Based Access Control'}
                  </p>
                </div>
              </div>

              {isUnclaimedDeployment && !claimMode && (
                <div className="p-3 my-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>New Deployment Detected</span>
                  </div>
                  <p className="text-emerald-300/90 leading-relaxed">
                    This template has not been claimed yet. As the clinic owner, you can claim it and establish your primary administrator account.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimMode(true);
                      setError('');
                    }}
                    className="mt-1 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition text-center cursor-pointer shadow"
                  >
                    Claim This Practice as First Admin
                  </button>
                </div>
              )}

              {!claimMode && (
                <div className="p-2.5 my-3 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Sign in with your verified clinic administrator or staff account. Role claims are enforced via Firebase Auth.
                  </span>
                </div>
              )}

              {isCheckingAuth ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-stone-400">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span>Verifying authorization...</span>
                </div>
              ) : claimMode ? (
                /* First-Run Claim Form */
                <form onSubmit={handleClaimClinic} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-stone-300 block mb-1">Clinic ID (e.g. clinic_london_01)</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="clinic_london_01"
                        value={newClinicId}
                        onChange={(e) => setNewClinicId(e.target.value)}
                        className="w-full rounded-xl border border-stone-750 bg-stone-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-stone-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-300 block mb-1">Clinic Name</label>
                    <input
                      type="text"
                      placeholder="Vance Health London"
                      value={newClinicName}
                      onChange={(e) => setNewClinicName(e.target.value)}
                      className="w-full rounded-xl border border-stone-750 bg-stone-950 px-3 py-2 text-xs text-white placeholder:text-stone-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-300 block mb-1 flex items-center justify-between">
                      <span>Deployment Setup Secret</span>
                      <span className="text-[10px] text-amber-400 font-mono">CLINIC_SETUP_TOKEN</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="Master key from environment variables"
                        value={setupToken}
                        onChange={(e) => setSetupToken(e.target.value)}
                        className="w-full rounded-xl border border-stone-750 bg-stone-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-stone-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Prevents unauthorized claims. Set in your deployment environment variables.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-300 block mb-1">Admin Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="doctor@vancehealth.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full rounded-xl border border-stone-750 bg-stone-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-stone-600 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-300 block mb-1">Set Admin Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
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
                          <span>Initializing Practice Admin...</span>
                        </>
                      ) : (
                        <span>Initialize & Claim Practice</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClaimMode(false);
                        setError('');
                      }}
                      className="w-full py-1.5 text-xs text-stone-400 hover:text-white transition text-center cursor-pointer"
                    >
                      Back to Standard Sign In
                    </button>
                  </div>
                </form>
              ) : (
                /* Standard Verified Admin Sign In */
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
