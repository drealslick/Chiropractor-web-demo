import seedData from './sandbox-seed.json';
import { dispatchSafeEvent } from '../utils/customEvents';
import { isFirebaseConfigured } from './firebase';

const STORAGE_KEY = 'practiva_sandbox_v1';

export type SandboxStore = {
  appointments: any[];
  patients: any[];
  conditions: any[];
  blogPosts: any[];
  teamMembers: any[];
  tickets: any[];
  invoices: any[];
  inquiries: any[];
  [key: string]: any[];
};

function deduplicateCollection(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items.filter((item, idx) => {
    const key = item && item.id ? String(item.id) : `idx_${idx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function loadSandbox(): SandboxStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const cleaned: SandboxStore = { ...parsed };
        for (const key of Object.keys(cleaned)) {
          if (Array.isArray(cleaned[key])) {
            cleaned[key] = deduplicateCollection(cleaned[key]);
          }
        }
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('Sandbox load warning:', err);
  }

  // Initialize with seed data
  const seeded = JSON.parse(JSON.stringify(seedData)) as SandboxStore;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // Ignore storage quota
  }
  return seeded;
}

function saveSandbox(data: SandboxStore): void {
  try {
    const clean: SandboxStore = { ...data };
    for (const key of Object.keys(clean)) {
      if (Array.isArray(clean[key])) {
        clean[key] = deduplicateCollection(clean[key]);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    dispatchSafeEvent('sandbox_updated', clean);
  } catch (err) {
    console.warn('Sandbox save error:', err);
  }
}

export const sandbox = {
  /**
   * Check if demo mode is active
   */
  isDemoMode: import.meta.env.VITE_DEMO_MODE === 'true',

  /**
   * List records in collection, optionally filtered by clinicId
   */
  get: <T = any>(collection: string, clinicId?: string): T[] => {
    const data = loadSandbox();
    const list = deduplicateCollection((data[collection] || []) as any[]) as T[];
    if (!clinicId) return list;
    return list.filter((item: any) => !item.clinicId || item.clinicId === clinicId);
  },

  list: <T = any>(collection: string, clinicId?: string): T[] => {
    return sandbox.get<T>(collection, clinicId);
  },

  /**
   * Find single record by ID
   */
  getById: <T = any>(collection: string, id: string): T | null => {
    const data = loadSandbox();
    const list = (data[collection] || []) as T[];
    return list.find((item: any) => item && item.id === id) || null;
  },

  /**
   * Create new record in local sandbox (upsert if id already exists)
   */
  create: <T = any>(collection: string, clinicId: string, record: any): T => {
    const data = loadSandbox();
    const existingList = (data[collection] || []) as any[];
    const id = record.id || `sandbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord = {
      ...record,
      id,
      clinicId: record.clinicId || clinicId,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    const existingIndex = existingList.findIndex((item: any) => item && item.id === id);
    if (existingIndex >= 0) {
      existingList[existingIndex] = { ...existingList[existingIndex], ...newRecord };
      data[collection] = existingList;
    } else {
      data[collection] = [newRecord, ...existingList];
    }
    data[collection] = deduplicateCollection(data[collection]);
    saveSandbox(data);
    return newRecord as T;
  },

  /**
   * Update existing record in local sandbox
   */
  update: <T = any>(collection: string, id: string, patch: any): T | null => {
    const data = loadSandbox();
    let updatedRecord: any = null;
    data[collection] = (data[collection] || []).map((item: any) => {
      if (item.id === id) {
        updatedRecord = { ...item, ...patch, updatedAt: new Date().toISOString() };
        return updatedRecord;
      }
      return item;
    });
    saveSandbox(data);
    return updatedRecord as T | null;
  },

  /**
   * Delete record by ID from local sandbox
   */
  delete: (collection: string, id: string): boolean => {
    const data = loadSandbox();
    data[collection] = (data[collection] || []).filter((item: any) => item.id !== id);
    saveSandbox(data);
    return true;
  },

  /**
   * Reset sandbox back to original seed data
   */
  reset: (): SandboxStore => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    const fresh = JSON.parse(JSON.stringify(seedData)) as SandboxStore;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      dispatchSafeEvent('sandbox_updated', fresh);
    } catch {
      // Ignore
    }
    return fresh;
  },
};
