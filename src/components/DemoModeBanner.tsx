import React, { useState, useEffect } from 'react';
import { sandbox } from '../lib/sandbox';
import { RotateCcw, Sparkles } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isDemo) return;

    const handleToast = (e: any) => {
      const msg = e.detail?.message;
      if (msg) {
        setToastMessage(msg);
        setTimeout(() => {
          setToastMessage((prev) => (prev === msg ? null : prev));
        }, 4000);
      }
    };

    window.addEventListener('demo_notification_toast', handleToast);
    return () => window.removeEventListener('demo_notification_toast', handleToast);
  }, [isDemo]);

  if (!isDemo) return null;

  const handleReset = () => {
    if (window.confirm('Reset all demo appointments, leads, and edits back to the initial seeded clinic state?')) {
      sandbox.reset();
      try {
        localStorage.removeItem('agency_patient_leads_v1');
        localStorage.removeItem('agency_dispatched_notifications_v1');
      } catch {
        // Ignore
      }
      window.location.reload();
    }
  };

  return (
    <>
      {/* Floating Demo Mode & Sandbox Reset Pill */}
      <div
        className="fixed top-4 right-4 z-[9999] flex items-center gap-2.5 rounded-full bg-amber-400 text-stone-900 px-3.5 py-1.5 shadow-2xl border border-amber-300 text-xs font-semibold backdrop-blur-md select-none transition-transform hover:scale-105"
        role="status"
        aria-label="Demo Mode Indicator"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-700 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-800"></span>
        </span>
        <span className="tracking-wide">Demo Sandbox</span>
        <span className="text-amber-700 font-mono text-[10px]">|</span>
        <button
          type="button"
          onClick={handleReset}
          title="Reset sample appointments, intake, and patient records to clean state"
          className="inline-flex items-center gap-1 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-300 px-2.5 py-0.5 text-[11px] font-medium shadow-sm transition active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-amber-300" />
          <span>Reset Data</span>
        </button>
      </div>

      {/* Floating Toast for Mocked Side-Effects */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-[9999] max-w-sm rounded-xl bg-stone-900/95 text-stone-100 p-4 shadow-2xl border border-emerald-500/40 backdrop-blur-md text-xs animate-in slide-in-from-bottom-5 duration-200"
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-emerald-300 text-[11px] uppercase tracking-wider">
                Simulated Action (Demo Mode)
              </p>
              <p className="text-stone-200 text-xs leading-relaxed">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
