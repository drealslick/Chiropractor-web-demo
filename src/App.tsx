import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { defaultClinic } from './data/clinicData';
import { ClinicProvider } from './data/ClinicContext'; // 👈 Updated path

import Home from './pages/Home';
import Conditions from './pages/Conditions';
import ConditionDetail from './pages/ConditionDetail';
import FirstVisit from './pages/FirstVisit';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App() {
  const [, setMobileMenuOpen] = useState(false);

  return (
    <ClinicProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-500 selection:text-white">
          {/* Top Info Bar */}
          <div className="bg-stone-900 text-stone-400 text-[11px] py-1.5 px-3 border-b border-stone-800">
            <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">Central Practice, EU</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> +44 20 7946 0912
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                  GDPR Ready
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Header Navigation */}
          <Navbar onBookClick="{()">
setMobileMenuOpen(false)} />


          {/* Viewport */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/conditions" element={<Conditions />} />
              <Route path="/conditions/:conditionId" element={<ConditionDetail />} />
              <Route path="/first-visit" element={<FirstVisit />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-stone-950 text-stone-400 py-10 border-t border-stone-800 text-sm">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
              <p className="font-bold text-stone-200">Vance Health Practice Architecture</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Multi-page clinical web application optimized for European local SEO, client data security, and high-conversion onboarding.
              </p>
              <p className="text-xs text-stone-600">© {new Date().getFullYear()} All Rights Reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </ClinicProvider>
  );
}
