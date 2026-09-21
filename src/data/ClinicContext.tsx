import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ClinicInfo } from '../types';
import { defaultClinic } from './clinicData';
import { agencyDemoPresets } from './presets';
import { clinicRowId, supabase } from './supabaseClient';

export const STORAGE_KEY = 'agency_clinic_config_v1';

interface ClinicContextType {
  clinicData: ClinicInfo;
  setClinicData: React.Dispatch<React.SetStateAction<ClinicInfo>>;
  updateClinic: (updated: ClinicInfo) => void;
  resetClinic: () => void;
  loadPreset: (id: string) => void;
}

export const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

function readLocalClinic(): ClinicInfo {
  try {
    if (typeof window === 'undefined') return defaultClinic;
    const urlParams = new URLSearchParams(window.location.search);
    const demoKey = urlParams.get('demo') || urlParams.get('preset') || urlParams.get('client');
    if (demoKey && agencyDemoPresets[demoKey.toLowerCase()]) {
      return { ...defaultClinic, ...agencyDemoPresets[demoKey.toLowerCase()] };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultClinic, ...JSON.parse(saved) };
  } catch {
    // ignore
  }
  return defaultClinic;
}

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clinicData, setClinicData] = useState<ClinicInfo>(readLocalClinic);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    async function loadRemote() {
      if (!supabase) return;
      const id = clinicRowId();
      const { data, error } = await supabase
        .from('clinic_configs')
        .select('data')
        .eq('id', id)
        .maybeSingle();
      if (cancelled || error) return;
      if (data?.data && typeof data.data === 'object') {
        setClinicData({ ...defaultClinic, ...(data.data as ClinicInfo) });
      }
    }
    loadRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clinicData));
    } catch {
      // ignore
    }

    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }

    if (!supabase) return;
    const id = clinicRowId();
    supabase.from('clinic_configs').upsert({
      id,
      data: clinicData,
      updated_at: new Date().toISOString(),
    });
  }, [clinicData]);

  const value = useMemo<ClinicContextType>(
    () => ({
      clinicData,
      setClinicData,
      updateClinic: (updated) => setClinicData(updated),
      resetClinic: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        setClinicData(defaultClinic);
      },
      loadPreset: (id) => {
        const preset = agencyDemoPresets[id.toLowerCase()];
        if (!preset) return;
        setClinicData({ ...defaultClinic, ...preset });
      },
    }),
    [clinicData]
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used inside ClinicProvider');
  return ctx;
}