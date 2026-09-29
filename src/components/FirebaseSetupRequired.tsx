import React from 'react';
import { AlertCircle, Key, Terminal, RefreshCw, FileText } from 'lucide-react';

export function FirebaseSetupRequired() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 selection:bg-amber-500 selection:text-white">
      <div className="max-w-xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Firebase Configuration Required</h1>
            <p className="text-xs text-amber-400 font-medium">Step 1: Connect your Firebase Project</p>
          </div>
        </div>

        <p className="text-sm text-stone-300 leading-relaxed">
          Practice OS is running, but it has not been connected to your clinic's Firebase database and authentication yet.
        </p>

        <div className="space-y-4 text-xs">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-200">
              <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">1</span>
              <span>Create your local environment file:</span>
            </div>
            <pre className="bg-stone-900/90 text-stone-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto border border-stone-850">
              cp .env.example .env.local
            </pre>
          </div>

          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-200">
              <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">2</span>
              <span>Add your Firebase credentials to <code className="text-amber-300 font-mono">.env.local</code>:</span>
            </div>
            <pre className="bg-stone-900/90 text-stone-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto border border-stone-850">
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-clinic.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:...`}
            </pre>
            <p className="text-stone-400 text-[11px]">
              Find these in <strong>Firebase Console → Project Settings → General → Your apps</strong>.
            </p>
          </div>

          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-200">
              <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">3</span>
              <span>Restart your development server:</span>
            </div>
            <pre className="bg-stone-900/90 text-stone-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto border border-stone-850">
              npm run dev
            </pre>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-400">
            <FileText className="w-4 h-4 text-stone-500" />
            <span>Full guide available in <code className="text-stone-300">README.md</code></span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition shadow-lg shadow-amber-950/40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload App</span>
          </button>
        </div>
      </div>
    </div>
  );
}
