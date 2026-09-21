import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Phone, Menu, X } from 'lucide-react';
import { ClinicInfo } from '../types';

interface NavbarProps {
  clinic: ClinicInfo;
  onBookClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ clinic, onBookClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO & Home Link */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            {clinic.logoImage ? (
              <img
                src={clinic.logoImage}
                alt={clinic.logoText || clinic.name}
                style={{ width: clinic.logoWidth ? `${clinic.logoWidth}px` : '150px' }}
                className="h-auto max-h-12 object-contain rounded-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center font-serif text-xl font-bold tracking-tight shadow-sm transition-transform group-hover:scale-105">
                <span>{(clinic.logoText || clinic.name).charAt(0) || 'C'}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg leading-tight tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors">
                {clinic.logoText || clinic.name}
              </span>
              <span className="text-xs tracking-wider uppercase text-stone-500 font-medium">
                {clinic.cityState}
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links (Multi-Page Routes) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <Link to="/conditions" className="hover:text-stone-900 transition-colors">Conditions</Link>
          <Link to="/first-visit" className="hover:text-stone-900 transition-colors">First Visit</Link>
          <Link to="/about" className="hover:text-stone-900 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-stone-900 transition-colors">Contact</Link>
        </nav>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:${clinic.phoneRaw}`}
            className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-emerald-800 px-3 py-2 rounded-md hover:bg-stone-200/60 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>{clinic.phone}</span>
          </a>

          <button
            onClick={onBookClick}
            id="nav-book-now-button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-stone-900 hover:bg-emerald-900 text-stone-50 text-xs sm:text-sm font-semibold tracking-wide rounded-md shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{clinic.navButtonText || "BOOK NOW"}</span>
          </button>

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

      {/* Mobile Slide-down Multi-Page Dropdown Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-stone-50 border-t border-stone-200/80 px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Home
          </Link>
          <Link
            to="/conditions"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Conditions We Treat
          </Link>
          <Link
            to="/first-visit"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            First Visit Guide
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Contact
          </Link>
          <div className="pt-2 border-t border-stone-200">
            <a
              href={`tel:${clinic.phoneRaw}`}
              className="flex items-center gap-2 py-2 px-3 text-sm font-semibold text-emerald-800"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>{clinic.phone}</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
