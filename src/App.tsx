import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { ClinicSchema } from './components/ClinicSchema';
import { Navbar } from './components/Navbar';
import { ClinicProvider, useClinic } from './data/ClinicContext';
import { GlobalAnnouncementBanner } from './components/GlobalAnnouncementBanner';
const GlobalAgencyController = React.lazy(() =>
  import('./components/GlobalAgencyController').then((m) => ({ default: m.GlobalAgencyController }))
);
import { GlobalThemeApplier } from './components/GlobalThemeApplier';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { PatientPortalModal } from './components/PatientPortalModal';
import { ScrollToTop } from './components/ScrollToTop';
import { DemoModeBanner } from './components/DemoModeBanner';
import { ErrorBoundary } from './components/ErrorBoundary';

import Home from './pages/Home';

const Conditions = React.lazy(() => import('./pages/Conditions'));
const ConditionDetail = React.lazy(() => import('./pages/ConditionDetail'));
const FirstVisit = React.lazy(() => import('./pages/FirstVisit'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const Team = React.lazy(() => import('./pages/Team'));
const TeamMemberDetail = React.lazy(() => import('./pages/TeamMemberDetail'));
const PatientPortalPage = React.lazy(() => import('./pages/PatientPortalPage'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function AppShell() {
  const [, setMobileMenuOpen] = useState(false);
  const { clinicData: clinic, isPatientPortalOpen, closePatientPortal, patientPortalInitialQuery } = useClinic();

  return (
    <Router>
      <ScrollToTop />
      <GlobalThemeApplier />
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-500 selection:text-white">
        <ClinicSchema />
        <GlobalAnnouncementBanner banner={clinic.announcementBanner} />
        <header className="bg-stone-900 text-stone-400 text-[11px] py-1.5 px-3 border-b border-stone-800">
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
        </header>

        <Navbar onBookClick={() => setMobileMenuOpen(false)} />

        <main className="flex-grow">
          <React.Suspense fallback={<div className="p-8 text-center text-stone-500">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/conditions" element={<Conditions />} />
              <Route path="/conditions/:conditionId" element={<ConditionDetail />} />
              <Route path="/first-visit" element={<FirstVisit />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/team/:memberSlug" element={<TeamMemberDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/portal" element={<PatientPortalPage />} />
              <Route path="/patient-portal" element={<PatientPortalPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </main>

        <Footer clinic={clinic} />

        <DemoModeBanner />
        <React.Suspense fallback={null}>
          <GlobalAgencyController />
        </React.Suspense>
        <BookingModal />
        <PatientPortalModal
          isOpen={isPatientPortalOpen}
          onClose={closePatientPortal}
          initialQuery={patientPortalInitialQuery}
        />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Application Encountered a Problem">
      <ClinicProvider>
        <AppShell />
      </ClinicProvider>
    </ErrorBoundary>
  );
}