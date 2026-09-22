import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ClinicInfo } from '../types';
import { defaultClinic } from './clinicData';
import { agencyDemoPresets } from './presets';
import { clinicRowId, supabase } from './supabaseClient';

export const STORAGE_KEY = 'agency_clinic_config_v1';

function storageKey() {
  return `${STORAGE_KEY}_${clinicRowId()}`;
}

interface ClinicContextType {
  clinicData: ClinicInfo;
  setClinicData: React.Dispatch<React.SetStateAction<ClinicInfo>>;
  updateClinic: (updated: ClinicInfo) => void;
  resetClinic: () => void;
  loadPreset: (id: string) => void;
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

function persist(clinic: ClinicInfo) {
  const payload = sanitize(clinic);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
  if (!supabase) {
    alert('Supabase client is missing');
    return;
  }
  supabase
    .from('clinic_configs')
    .upsert({
      id: clinicRowId(),
      data: payload,
      updated_at: new Date().toISOString(),
    })
    .then(({ error }) => {
      if (error) alert('Save failed: ' + error.message);
      else alert('Saved to database');
    });
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

  useEffect(() => {
    let cancelled = false;
    async function loadRemote() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('clinic_configs')
        .select('data')
        .eq('id', clinicRowId())
        .maybeSingle();
      if (cancelled || error || !data?.data || typeof data.data !== 'object') return;
      const remote = data.data as ClinicInfo;
      if (!remote.name) return;
      const next = { ...defaultClinic, ...remote };
      setClinicData(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    loadRemote();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ClinicContextType>(
    () => ({
      clinicData,
      setClinicData,
      updateClinic: (updated) => {
        setClinicData(updated);
        persist(updated);
      },
      resetClinic: () => {
        setClinicData(defaultClinic);
        persist(defaultClinic);
      },
      loadPreset: (id) => {
        const preset = agencyDemoPresets[id.toLowerCase()];
        if (!preset) return;
        const next = { ...defaultClinic, ...preset };
        setClinicData(next);
        persist(next);
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