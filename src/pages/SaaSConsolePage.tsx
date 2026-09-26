import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import { SuperAdminConsole } from '../components/superadmin/SuperAdminConsole';
import { ArrowLeft, Sparkles, Shield, Layers } from 'lucide-react';

export default function SaaSConsolePage() {
  const { clinicData, setClinicData } = useClinic();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* SaaS OS Top OS Header */}
      <header className="bg-stone-900 border-b border-stone-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-950/60">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-white tracking-tight">SaaS Operating System (SaaS OS)</h1>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                Root Cockpit
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Master control plane for multi-tenant clinic registry, billing, and system health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-stone-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Launch Active Clinic App ({clinicData.name.split(' ')[0]})</span>
          </button>
        </div>
      </header>

      {/* Main SaaS OS Body */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        <SuperAdminConsole
          currentClinic={clinicData}
          onSelectClinicToManage={(selectedClinic) => {
            setClinicData(selectedClinic);
            navigate('/admin');
          }}
        />
      </main>
    </div>
  );
}
