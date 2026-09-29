import seedData from './sandbox-seed.json';

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

function loadSandbox(): SandboxStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as SandboxStore;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('sandbox_updated', { detail: data }));
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
    const list = (data[collection] || []) as T[];
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
    return list.find((item: any) => item.id === id) || null;
  },

  /**
   * Create new record in local sandbox
   */
  create: <T = any>(collection: string, clinicId: string, record: any): T => {
    const data = loadSandbox();
    const newRecord = {
      ...record,
      id: record.id || `sandbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clinicId: record.clinicId || clinicId,
      createdAt: record.createdAt || new Date().toISOString(),
    };
    data[collection] = [newRecord, ...(data[collection] || [])];
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
      window.dispatchEvent(new CustomEvent('sandbox_updated', { detail: fresh }));
    } catch {
      // Ignore
    }
    return fresh;
  },
};
