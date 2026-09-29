import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { ClinicInfo, ClinicLocation } from '../types';
import { defaultClinic, defaultLocations } from './clinicData';
import { agencyDemoPresets } from './presets';
import { clinicRowId, supabase } from './supabaseClient';
import { LoadingScreen } from '../components/LoadingScreen';

export const STORAGE_KEY = 'agency_clinic_config_v1';
export const CACHE_KEY = 'clinic_config';

export function getActiveClinicId(): string {
  if (typeof window === 'undefined') return 'columbus-chiropractic';
  const params = new URLSearchParams(window.location.search);
  const id =
    params.get('clinic') ||
    params.get('clinicId') ||
    params.get('client') ||
    params.get('preset') ||
    params.get('demo') ||
    import.meta.env.VITE_CLINIC_ID;
  return id ? id.toLowerCase().trim() : 'columbus-chiropractic';
}

export type SyncStatus = 'idle' | 'saving' | 'synced' | 'local_only' | 'error';

interface ClinicContextType {
  clinicData: ClinicInfo;
  setClinicData: React.Dispatch<React.SetStateAction<ClinicInfo>>;
  updateClinic: (updated: ClinicInfo) => void;
  resetClinic: () => void;
  loadPreset: (id: string) => void;
  syncStatus: SyncStatus;
  lastSaved: string | null;
  errorMessage: string | null;
  hasSupabase: boolean;
  importClinicBlueprint: (blueprint: Partial<ClinicInfo>) => boolean;
  // Multi-Location Practice Switcher
  activeLocation: ClinicLocation;
  setActiveLocationId: (locationId: string) => void;
  allLocations: ClinicLocation[];
  // Global Booking State & Triggers
  isBookingModalOpen: boolean;
  bookingInitialCondition: string;
  bookingInitialServiceType: 'initial' | 'followup' | 'custom';
  bookingInitialServiceTitle: string;
  bookingInitialServicePrice?: string;
  bookingInitialPractitionerId?: string;
  openBookingModal: (
    initialConditionOrTitle?: string,
    initialServiceType?: 'initial' | 'followup' | 'custom',
    initialServiceTitle?: string,
    initialServicePrice?: string,
    initialPractitionerId?: string
  ) => void;
  closeBookingModal: () => void;
  // Patient Self-Service Portal State & Triggers
  isPatientPortalOpen: boolean;
  patientPortalInitialQuery: string;
  openPatientPortal: (query?: string) => void;
  closePatientPortal: () => void;
  isConfigLoaded: boolean;
  isAuthReady: boolean;
}

export const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

function sanitize(clinic: ClinicInfo) {
  const out: Record<string, unknown> = {};
  Object.entries(clinic).forEach(([key, value]) => {
    try {
      JSON.stringify(value);
      out[key] = value;
    } catch {
      // skip file/blob/circular values
    }
  });
  return out;
}

function getInitialClinic(): { data: ClinicInfo; hasCache: boolean } {
  const defaultPresetKey = (import.meta.env.VITE_DEFAULT_PRESET || 'austin').toLowerCase();
  const presetData = agencyDemoPresets[defaultPresetKey] || {};
  const baseClinic = { ...defaultClinic, ...presetData };
  try {
    const saved = localStorage.getItem(CACHE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (saved) return { data: { ...baseClinic, ...JSON.parse(saved) }, hasCache: true };
  } catch {
    // ignore
  }
  return { data: baseClinic, hasCache: false };
}

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initial = useMemo(() => getInitialClinic(), []);
  const [clinicData, setClinicData] = useState<ClinicInfo>(initial.data);
  const [isConfigLoaded, setIsConfigLoaded] = useState<boolean>(initial.hasCache);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(supabase ? 'idle' : 'local_only');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingInitialCondition, setBookingInitialCondition] = useState<string>('Back pain');
  const [bookingInitialServiceType, setBookingInitialServiceType] = useState<'initial' | 'followup' | 'custom'>('initial');
  const [bookingInitialServiceTitle, setBookingInitialServiceTitle] = useState<string>('Initial Consultation & Examination');
  const [bookingInitialServicePrice, setBookingInitialServicePrice] = useState<string | undefined>(undefined);
  const [bookingInitialPractitionerId, setBookingInitialPractitionerId] = useState<string | undefined>(undefined);

  // 1. Gate on Firebase Auth initialization (prevent Sign In / My Account flash)
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    try {
      unsubAuth = onAuthStateChanged(auth, () => {
        setIsAuthReady(true);
      });
    } catch {
      setIsAuthReady(true);
    }
    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // 2. Safety timeout so app never blocks indefinitely if offline / network stalled
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConfigLoaded(true);
      setIsAuthReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Patient Self-Service Portal State
  const [isPatientPortalOpen, setIsPatientPortalOpen] = useState<boolean>(false);
  const [patientPortalInitialQuery, setPatientPortalInitialQuery] = useState<string>('');

  const openPatientPortal = useCallback((query?: string) => {
    setPatientPortalInitialQuery(query || '');
    setIsPatientPortalOpen(true);
  }, []);

  const closePatientPortal = useCallback(() => {
    setIsPatientPortalOpen(false);
  }, []);

  const hasSupabase = Boolean(supabase);

  const openBookingModal = useCallback((
    initialConditionOrTitle?: string,
    initialServiceType?: 'initial' | 'followup' | 'custom',
    initialServiceTitle?: string,
    initialServicePrice?: string,
    initialPractitionerId?: string
  ) => {
    // Detect service type if passed or infer from title
    let resolvedServiceType: 'initial' | 'followup' | 'custom' = initialServiceType || 'initial';
    let resolvedTitle = initialServiceTitle || '';

    if (!initialServiceType && initialConditionOrTitle) {
      const lower = initialConditionOrTitle.toLowerCase();
      if (lower.includes('follow') || lower.includes('routine') || lower.includes('adjustment') || lower.includes('subsequent')) {
        resolvedServiceType = 'followup';
        resolvedTitle = initialConditionOrTitle;
      } else if (lower.includes('decompression') || lower.includes('laser') || lower.includes('orthotic') || lower.includes('shockwave') || lower.includes('massage') || lower.includes('acupuncture')) {
        resolvedServiceType = 'custom';
        resolvedTitle = initialConditionOrTitle;
      }
    }

    if (initialConditionOrTitle) {
      if (initialConditionOrTitle.includes('Back')) {
        setBookingInitialCondition('Back pain');
      } else if (initialConditionOrTitle.includes('Neck') || initialConditionOrTitle.includes('Shoulder')) {
        setBookingInitialCondition('Neck pain');
      } else if (initialConditionOrTitle.includes('Sports')) {
        setBookingInitialCondition('Sports injury');
      } else if (initialConditionOrTitle.includes('Headache')) {
        setBookingInitialCondition('Headaches');
      } else {
        setBookingInitialCondition(initialConditionOrTitle);
      }
    } else {
      setBookingInitialCondition('Back pain');
    }

    setBookingInitialServiceType(resolvedServiceType);
    setBookingInitialServiceTitle(resolvedTitle || (resolvedServiceType === 'followup' ? 'Follow-Up Adjustment & Care' : 'Initial Consultation & Examination'));
    setBookingInitialServicePrice(initialServicePrice);
    setBookingInitialPractitionerId(initialPractitionerId);

    // Direct Redirect Mode Check
    if (clinicData.bookingEmbedMode === 'redirect' && clinicData.externalBookingUrl) {
      try {
        window.open(clinicData.externalBookingUrl, '_blank', 'noopener,noreferrer');
      } catch {
        window.location.href = clinicData.externalBookingUrl;
      }
      return;
    }

    // Otherwise open modal (either iframe embed mode or triage)
    setIsBookingModalOpen(true);
  }, [clinicData.bookingEmbedMode, clinicData.externalBookingUrl]);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
  }, []);

  // Real-time Firestore sync & listen for clinic document
  useEffect(() => {
    let cancelled = false;
    const activeId = getActiveClinicId();

    try {
      const docRef = doc(db, 'clinics', activeId);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (cancelled) return;
          if (docSnap.exists()) {
            const data = docSnap.data();
            setClinicData((prev) => {
              const merged: ClinicInfo = {
                ...prev,
                ...data,
                id: data.id || activeId,
                name: data.name || prev.name,
                doctorName: data.doctorName || prev.doctorName,
                phone: data.phone || prev.phone,
                city: data.city || prev.city,
                state: data.state || prev.state,
                ownerEmail: data.ownerEmail || prev.ownerEmail || prev.email,
                ehrIntegration: data.ehrIntegration || prev.ehrIntegration,
                notes: data.notes || prev.notes,
              };
              try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              } catch {
                // ignore
              }
              return merged;
            });
            setIsConfigLoaded(true);
            setSyncStatus('synced');
            setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          } else {
            // First time clinic setup: initialize clinic document
            setIsConfigLoaded(true);
            setSyncStatus('synced');
          }
        },
        (err) => {
          console.warn('Firestore clinic real-time snapshot note:', err);
          setIsConfigLoaded(true);
          setSyncStatus('local_only');
        }
      );

      return () => {
        cancelled = true;
        unsubscribe();
      };
    } catch (err) {
      console.warn('Firestore init note:', err);
    }
  }, []);

  const persist = useCallback((clinic: ClinicInfo) => {
    const payload = sanitize(clinic);
    const activeId = getActiveClinicId();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      // ignore
    }

    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setSyncStatus('synced');
      return;
    }

    setSyncStatus('saving');

    // Sync clinic customization settings to Cloud Firestore
    try {
      const docRef = doc(db, 'clinics', activeId);
      setDoc(
        docRef,
        {
          ...payload,
          id: activeId,
          name: clinic.name || 'Columbus Chiropractic & Wellness',
          doctorName: clinic.doctorName || 'Dr. Vance',
          ownerEmail: clinic.ownerEmail || clinic.email || 'admin@vancechiro.com',
          phone: clinic.phone || '(614) 555-0192',
          city: clinic.city || 'Columbus',
          state: clinic.state || 'OH',
          lastActive: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
        .then(() => {
          setSyncStatus('synced');
          setErrorMessage(null);
        })
        .catch((err) => {
          console.warn('Firestore clinic sync warning:', err);
          setSyncStatus('local_only');
        });
    } catch (err) {
      console.warn('Firestore write init error:', err);
      setSyncStatus('local_only');
    }

    // Optional legacy Supabase sync if configured
    if (supabase) {
      Promise.resolve(
        supabase
          .from('clinic_configs')
          .upsert({
            id: clinicRowId(),
            data: payload,
            updated_at: new Date().toISOString(),
          })
      ).catch(() => {});
    }
  }, []);

  const updateClinic = useCallback(
    (updated: ClinicInfo) => {
      setClinicData(updated);
      persist(updated);
    },
    [persist]
  );

  const resetClinic = useCallback(() => {
    const defaultPresetKey = (import.meta.env.VITE_DEFAULT_PRESET || 'austin').toLowerCase();
    const presetData = agencyDemoPresets[defaultPresetKey] || {};
    const baseClinic = { ...defaultClinic, ...presetData };
    setClinicData(baseClinic);
    persist(baseClinic);
  }, [persist]);

  const loadPreset = useCallback(
    (id: string) => {
      const preset = agencyDemoPresets[id.toLowerCase()];
      if (!preset) return;
      const next = { ...defaultClinic, ...preset };
      setClinicData(next);
      persist(next);
    },
    [persist]
  );

  const importClinicBlueprint = useCallback(
    (blueprint: Partial<ClinicInfo>) => {
      try {
        const defaultPresetKey = (import.meta.env.VITE_DEFAULT_PRESET || 'austin').toLowerCase();
        const presetData = agencyDemoPresets[defaultPresetKey] || {};
        const baseClinic = { ...defaultClinic, ...presetData };
        const next: ClinicInfo = { ...baseClinic, ...blueprint };
        setClinicData(next);
        persist(next);
        return true;
      } catch {
        return false;
      }
    },
    [persist]
  );

  const allLocations = clinicData.locations && clinicData.locations.length > 0 ? clinicData.locations : defaultLocations;
  const activeLocationId = clinicData.activeLocationId || allLocations[0]?.id || 'loc-marylebone';
  const activeLocation = allLocations.find((l) => l.id === activeLocationId) || allLocations[0] || defaultLocations[0];

  const setActiveLocationId = useCallback((locationId: string) => {
    const next = { ...clinicData, activeLocationId: locationId };
    setClinicData(next);
    persist(next);
  }, [clinicData, persist]);

  const value = useMemo<ClinicContextType>(
    () => ({
      clinicData,
      setClinicData,
      updateClinic,
      resetClinic,
      loadPreset,
      syncStatus,
      lastSaved,
      errorMessage,
      hasSupabase,
      importClinicBlueprint,
      activeLocation,
      setActiveLocationId,
      allLocations,
      isBookingModalOpen,
      bookingInitialCondition,
      bookingInitialServiceType,
      bookingInitialServiceTitle,
      bookingInitialServicePrice,
      bookingInitialPractitionerId,
      openBookingModal,
      closeBookingModal,
      isPatientPortalOpen,
      patientPortalInitialQuery,
      openPatientPortal,
      closePatientPortal,
      isConfigLoaded,
      isAuthReady,
    }),
    [
      clinicData,
      updateClinic,
      resetClinic,
      loadPreset,
      syncStatus,
      lastSaved,
      errorMessage,
      hasSupabase,
      importClinicBlueprint,
      activeLocation,
      setActiveLocationId,
      allLocations,
      isBookingModalOpen,
      bookingInitialCondition,
      bookingInitialServiceType,
      bookingInitialServiceTitle,
      bookingInitialServicePrice,
      bookingInitialPractitionerId,
      openBookingModal,
      closeBookingModal,
      isPatientPortalOpen,
      patientPortalInitialQuery,
      openPatientPortal,
      closePatientPortal,
      isConfigLoaded,
      isAuthReady,
    ]
  );

  // Gate initial paint until clinic config and auth state are ready
  // Eliminates flash of unconfigured text or "Sign In" button flicker
  if (!isConfigLoaded || !isAuthReady) {
    return <LoadingScreen clinic={clinicData} />;
  }

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used inside ClinicProvider');
  return ctx;
}
