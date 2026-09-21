import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, Phone, MapPin } from 'lucide-react';

import Home from './pages/Home';
import Conditions from './pages/Conditions';
import ConditionDetail from './pages/ConditionDetail';
import FirstVisit from './pages/FirstVisit';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-500 selection:text-white">
        {/* Top Info Bar */}
        <div className="bg-stone-900 text-stone-400 text-xs py-2 px-4 border-b border-stone-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Central Practice, European Division</span>
              <span className="hidden sm:flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-400" /> Direct Line: +44 20 7946 0912</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded text-[10px]">GDPR Ready</span>
          </div>
        </div>

        {/* Header Navigation */}
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-stone-900 tracking-tight">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5" />
              </div>
              <span>Vance<span className="text-emerald-600">Health</span></span>
            </Link>
            
            <nav className="hidden md:flex gap-8 text-sm font-semibold text-stone-600">
              <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
              <Link to="/conditions" className="hover:text-emerald-600 transition">Conditions</Link>
              <Link to="/first-visit" className="hover:text-emerald-600 transition">First Visit</Link>
              <Link to="/about" className="hover:text-emerald-600 transition">About</Link>
              <Link to="/contact" className="hover:text-emerald-600 transition">Contact</Link>
            </nav>

            <Link 
              to="/first-visit"
              className="bg-stone-900 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
            >
              Book €49 Special
            </Link>
          </div>
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
        <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800 text-sm">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <p className="font-bold text-stone-200">Vance Health Practice Architecture</p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Multi-page clinical web application optimized for European local SEO, client data security, and high-conversion onboarding.
            </p>
            <p className="text-xs text-stone-600">© {new Date().getFullYear()} All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
