import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { ClinicSchema } from './components/ClinicSchema';
import { Navbar } from './components/Navbar';
import { ClinicProvider, useClinic } from './data/ClinicContext';
import { GlobalAnnouncementBanner } from './components/GlobalAnnouncementBanner';
import { GlobalAgencyController } from './components/GlobalAgencyController';
import { GlobalThemeApplier } from './components/GlobalThemeApplier';
import { Footer } from './components/Footer';
const BookingModal = lazy(() => import('./components/BookingModal').then(m=>({default:m.BookingModal})));
const PatientPortalModal = lazy(() => import('./components/PatientPortalModal').then(m=>({default:m.PatientPortalModal})));
import { ScrollToTop } from './components/ScrollToTop';
import { DemoModeBanner } from './components/DemoModeBanner';
import { ErrorBoundary } from './components/ErrorBoundary';

import Home from './pages/Home';
const Conditions = lazy(() => import('./pages/Conditions'));
const ConditionDetail = lazy(() => import('./pages/ConditionDetail'));
const FirstVisit = lazy(() => import('./pages/FirstVisit'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Team = lazy(() => import('./pages/Team'));
const TeamMemberDetail = lazy(() => import('./pages/TeamMemberDetail'));
const PatientPortalPage = lazy(() => import('./pages/PatientPortalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppShell() {
  const [, setMobileMenuOpen] = useState(false);
  const { clinicData: clinic, isBookingModalOpen, isPatientPortalOpen, closePatientPortal, patientPortalInitialQuery } = useClinic();

  return (
    <Router>
      <ScrollToTop />
      <GlobalThemeApplier />
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
                {clinic.legalLabel || "Patient information"}
              </span>
            </div>
          </div>
        </div>

        <Navbar onBookClick={() => setMobileMenuOpen(false)} />

        <main className="flex-grow">
          <Suspense fallback={<p role="status" className="p-8">Loading…</p>}><Routes>
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
          </Routes></Suspense>
        </main>

        <Footer clinic={clinic} />

        <DemoModeBanner />
        <GlobalAgencyController />
        {isBookingModalOpen && <Suspense fallback={<p role="status">Opening booking…</p>}><BookingModal /></Suspense>}
        {isPatientPortalOpen && <Suspense fallback={<p role="status">Opening patient portal…</p>}><PatientPortalModal
          isOpen={isPatientPortalOpen}
          onClose={closePatientPortal}
          initialQuery={patientPortalInitialQuery}
        /></Suspense>}
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
