import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import Conditions from './pages/Conditions';
import ConditionDetail from './pages/ConditionDetail';
import FirstVisit from './pages/FirstVisit';
import About from './pages/About';
import Contact from './pages/Contact';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
        {/* Navigation Bar */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="font-bold text-xl text-emerald-800">
              Vance Chiropractic
            </Link>
            
            <nav className="flex gap-6 text-sm font-medium text-stone-600">
              <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
              <Link to="/conditions" className="hover:text-emerald-600 transition">Conditions</Link>
              <Link to="/first-visit" className="hover:text-emerald-600 transition">First Visit</Link>
              <Link to="/about" className="hover:text-emerald-600 transition">About</Link>
              <Link to="/contact" className="hover:text-emerald-600 transition">Contact</Link>
            </nav>
          </div>
        </header>

        {/* Page Content Viewport */}
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
        <footer className="bg-stone-900 text-stone-400 py-8 border-t border-stone-800 text-center text-sm">
          <p>© {new Date().getFullYear()} Vance Chiropractic Care. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}
