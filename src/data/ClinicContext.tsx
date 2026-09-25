import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode, useCallback } from 'react';
import { ClinicInfo } from '../types';
import { defaultClinic } from './clinicData';
import { agencyDemoPresets } from './presets';
import { clinicRowId, supabase } from './supabaseClient';

export const STORAGE_KEY = 'agency_clinic_config_v1';

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

function readCachedClinic(): ClinicInfo {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultClinic, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return defaultClinic;
}

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clinicData, setClinicData] = useState<ClinicInfo>(readCachedClinic);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(supabase ? 'idle' : 'local_only');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingInitialCondition, setBookingInitialCondition] = useState<string>('Back pain');
  const [bookingInitialServiceType, setBookingInitialServiceType] = useState<'initial' | 'followup' | 'custom'>('initial');
  const [bookingInitialServiceTitle, setBookingInitialServiceTitle] = useState<string>('Initial Consultation & Examination');
  const [bookingInitialServicePrice, setBookingInitialServicePrice] = useState<string | undefined>(undefined);
  const [bookingInitialPractitionerId, setBookingInitialPractitionerId] = useState<string | undefined>(undefined);

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

  // Load from Supabase on mount if connected
  useEffect(() => {
    let cancelled = false;
    async function loadRemote() {
      if (!supabase) return;
      try {
        setSyncStatus('saving');
        const { data, error } = await supabase
          .from('clinic_configs')
          .select('data, updated_at')
          .eq('id', clinicRowId())
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          setSyncStatus('local_only');
          return;
        }

        if (data?.data && typeof data.data === 'object') {
          const remote = data.data as ClinicInfo;
          if (remote.name) {
            const next = { ...defaultClinic, ...remote };
            setClinicData(next);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
            setSyncStatus('synced');
            setLastSaved(data.updated_at || new Date().toISOString());
            return;
          }
        }
        setSyncStatus('synced');
      } catch {
        if (!cancelled) setSyncStatus('local_only');
      }
    }
    loadRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((clinic: ClinicInfo) => {
    const payload = sanitize(clinic);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      // ignore
    }

    if (!supabase) {
      setSyncStatus('local_only');
      return;
    }

    setSyncStatus('saving');
    supabase
      .from('clinic_configs')
      .upsert({
        id: clinicRowId(),
        data: payload,
        updated_at: new Date().toISOString(),
      })
      .then(
        ({ error }) => {
          if (error) {
            setSyncStatus('error');
            setErrorMessage(error.message);
          } else {
            setSyncStatus('synced');
            setErrorMessage(null);
          }
        },
        (err) => {
          setSyncStatus('error');
          setErrorMessage(err?.message || 'Network sync failed');
        }
      );
  }, []);

  const updateClinic = useCallback(
    (updated: ClinicInfo) => {
      setClinicData(updated);
      persist(updated);
    },
    [persist]
  );

  const resetClinic = useCallback(() => {
    setClinicData(defaultClinic);
    persist(defaultClinic);
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
        const next: ClinicInfo = { ...defaultClinic, ...blueprint };
        setClinicData(next);
        persist(next);
        return true;
      } catch {
        return false;
      }
    },
    [persist]
  );

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
      isBookingModalOpen,
      bookingInitialCondition,
      bookingInitialServiceType,
      bookingInitialServiceTitle,
      bookingInitialServicePrice,
      bookingInitialPractitionerId,
      openBookingModal,
      closeBookingModal,
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
      isBookingModalOpen,
      bookingInitialCondition,
      bookingInitialServiceType,
      bookingInitialServiceTitle,
      bookingInitialServicePrice,
      bookingInitialPractitionerId,
      openBookingModal,
      closeBookingModal,
    ]
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used inside ClinicProvider');
  return ctx;
}
