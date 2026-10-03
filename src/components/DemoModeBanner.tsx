import React, { useState } from 'react';
import { Sparkles, RotateCcw, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { isExplicitDemo, isUnconfiguredMode } from '../lib/mode';
import { sandbox } from '../lib/sandbox';
import { clearDispatchedNotifications } from '../data/leadsStore';
import { CACHE_KEY, STORAGE_KEY } from '../data/ClinicContext';

export const DemoModeBanner: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isDemo = isExplicitDemo();
  const isUnconfigured = isUnconfiguredMode();

  if (!isDemo && !isUnconfigured) {
    return null;
  }

  const handleResetDemoData = () => {
    setIsResetting(true);
    try {
      // 1. Reset local sandbox store
      sandbox.reset();

      // 2. Clear simulated notifications
      clearDispatchedNotifications();

      // 3. Clear clinic customization cache
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('practiva_leads_v1');
      localStorage.removeItem('practiva_reception_notifs_v1');

      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Demo reset error:', err);
      setIsResetting(false);
    }
  };

  if (isUnconfigured) {
    return (
      <aside
        aria-label="Configuration Warning"
        className="bg-amber-950/90 text-amber-200 border-b border-amber-800/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-white">Live Setup Incomplete:</strong> Firebase environment variables are missing. Live bookings & authentication are disabled. Add keys to <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-100">.env.local</code> or set <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-100">VITE_DEMO_MODE=true</code>.
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Interactive Demo Sandbox Banner"
      className="bg-stone-900 text-stone-200 border-b border-stone-800 px-3.5 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] tracking-wide uppercase border border-emerald-500/30 shrink-0">
          <Sparkles className="w-3 h-3" />
          Interactive Demo
        </span>
        <span className="text-stone-300 text-[11px] truncate">
          Sandbox Active — Bookings, edits & card charges are simulated locally. No live provider charges occur.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleResetDemoData}
          disabled={isResetting}
          aria-label="Reset Sandbox to Clean Seed State"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-medium text-[11px] border border-stone-700 transition cursor-pointer disabled:opacity-50"
        >
          {resetSuccess ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Reset Clean</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-3 h-3 text-stone-400 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Data</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
