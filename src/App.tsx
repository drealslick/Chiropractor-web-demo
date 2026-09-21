import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Phone, MapPin, Menu, X } from 'lucide-react';

import Home from './pages/Home';
import Conditions from './pages/Conditions';
import ConditionDetail from './pages/ConditionDetail';
import FirstVisit from './pages/FirstVisit';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-500 selection:text-white">
        {/* Top Info Bar - Optimized for mobile wrap */}
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

        {/* Header Navigation */}
        <header className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 font-extrabold text-lg md:text-xl text-stone-900 tracking-tight"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <span>Vance<span className="text-emerald-600">Health</span></span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-8 text-sm font-semibold text-stone-600">
              <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
              <Link to="/conditions" className="hover:text-emerald-600 transition">Conditions</Link>
              <Link to="/first-visit" className="hover:text-emerald-600 transition">First Visit</Link>
              <Link to="/about" className="hover:text-emerald-600 transition">About</Link>
              <Link to="/contact" className="hover:text-emerald-600 transition">Contact</Link>
            </nav>

            {/* Desktop CTA & Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <Link 
                to="/first-visit"
                className="hidden sm:inline-block bg-stone-900 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
              >
                Book €49 Special
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block py-2 text-base font-semibold text-stone-800 hover:text-emerald-600 border-b border-stone-100"
              >
                Home
              </Link>
              <Link 
                to="/conditions" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block py-2 text-base font-semibold text-stone-800 hover:text-emerald-600 border-b border-stone-100"
              >
                Conditions We Treat
              </Link>
              <Link 
                to="/first-visit" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block py-2 text-base font-semibold text-stone-800 hover:text-emerald-600 border-b border-stone-100"
              >
                First Visit Guide
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block py-2 text-base font-semibold text-stone-800 hover:text-emerald-600 border-b border-stone-100"
              >
                About the Clinic
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block py-2 text-base font-semibold text-stone-800 hover:text-emerald-600 border-b border-stone-100"
              >
                Contact & Location
              </Link>

              <div className="pt-2">
                <Link 
                  to="/first-visit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  Book €49 Special
                </Link>
              </div>
            </div>
          )}
        </header>

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
  );
}
