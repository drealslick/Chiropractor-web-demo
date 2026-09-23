import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { ClinicSchema } from './components/ClinicSchema';
import { Navbar } from './components/Navbar';
import { ClinicProvider, useClinic } from './data/ClinicContext';
import { GlobalAnnouncementBanner } from './components/GlobalAnnouncementBanner';
import { GlobalAgencyController } from './components/GlobalAgencyController';

import Home from './pages/Home';
import Conditions from './pages/Conditions';
import ConditionDetail from './pages/ConditionDetail';
import FirstVisit from './pages/FirstVisit';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';

function AppShell() {
  const [, setMobileMenuOpen] = useState(false);
  const { clinicData: clinic } = useClinic();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-500 selection:text-white">
        <ClinicSchema />
        <GlobalAnnouncementBanner banner={clinic.announcementBanner} />
        <div className="bg-stone-900 text-stone-400 text-[11px] py-1.5 px-3 border-b border-stone-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{clinic.address || clinic.cityState || clinic.city}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> {clinic.phone}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                {clinic.legalLabel || "GDPR Ready"}
              </span>
            </div>
          </div>
        </div>

        <Navbar onBookClick={() => setMobileMenuOpen(false)} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/conditions" element={<Conditions />} />
            <Route path="/conditions/:conditionId" element={<ConditionDetail />} />
            <Route path="/first-visit" element={<FirstVisit />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </main>

        <footer className="bg-stone-950 text-stone-400 py-10 pb-28 border-t border-stone-800 text-sm">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
            <p className="font-bold text-stone-200">{clinic.name}</p>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              {clinic.tagline ||
                'Multi-page clinical web application optimized for European local SEO, client data security, and high-conversion onboarding.'}
            </p>
            <p className="text-xs text-stone-600">
              {clinic.phone}
              {clinic.cityState ? ` · ${clinic.cityState}` : ''}
            </p>
            <p className="text-xs text-stone-600">© {new Date().getFullYear()} All Rights Reserved.</p>
            <p className="text-xs text-stone-600 space-x-3">
              <a href="/privacy" className="underline">Privacy</a>
              <a href="/terms" className="underline">Terms</a>
            </p>
          </div>
        </footer>

        <GlobalAgencyController />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ClinicProvider>
      <AppShell />
    </ClinicProvider>
  );
}