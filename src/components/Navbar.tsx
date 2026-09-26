import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Phone, Menu, X, CalendarCheck2 } from 'lucide-react';
import { ClinicContext } from '../data/ClinicContext';

interface NavbarProps {
  onBookClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onBookClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 📻 Tuning into our central brain!
  const context = useContext(ClinicContext);
  
  // Safety check in case the context hasn't loaded
  if (!context) {
    return null; 
  }
  
  const { clinicData: clinic, activeLocation, setActiveLocationId, allLocations } = context; 
  const activeLogo = clinic.logoUrl || clinic.logoImage || (clinic as any).logo;
  const [logoImageError, setLogoImageError] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Top Multi-Location Utility Ribbon */}
      {allLocations && allLocations.length > 1 && (
        <div className="bg-stone-900 text-stone-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-stone-800">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span>📍 Active Clinic Branch:</span>
              </span>
              <select
                value={activeLocation.id}
                onChange={(e) => setActiveLocationId(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-stone-100 text-xs rounded-md px-2.5 py-0.5 font-semibold cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                {allLocations.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-stone-900 text-stone-100">
                    {loc.name} ({loc.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[11px] text-stone-400">
              <span>{activeLocation.address}, {activeLocation.city}</span>
              <span className="font-mono text-emerald-300">{activeLocation.phone}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO & Home Link */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            {activeLogo && !logoImageError ? (
              <div className="flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 shrink-0 max-h-[52px]">
                <img
                  src={activeLogo}
                  alt={clinic.logoUrlAlt || clinic.logoImageAlt || clinic.logoText || clinic.name || 'Practice Logo'}
                  onError={() => setLogoImageError(true)}
                  style={{
                    maxWidth: clinic.logoWidth ? `${clinic.logoWidth}px` : '320px',
                    maxHeight: '52px',
                  }}
                  className="h-10 sm:h-12 w-auto max-w-[220px] sm:max-w-[320px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center font-serif text-xl font-bold tracking-tight shadow-sm transition-transform group-hover:scale-105 shrink-0">
                <span>{(clinic.logoText || clinic.name || 'C').charAt(0) || 'C'}</span>
              </div>
            )}
            {!clinic.hideLogoText && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-base sm:text-lg leading-tight tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors truncate max-w-[180px] sm:max-w-xs">
                  {clinic.logoText || clinic.name}
                </span>
                <span className="text-[11px] sm:text-xs tracking-wider uppercase text-stone-500 font-medium truncate">
                  {clinic.cityState || clinic.city || ''}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Desktop Navigation Links (Multi-Page Routes) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
          {clinic.showPageConditions !== false && clinic.showNavConditions !== false && (
            <Link to="/conditions" className="hover:text-stone-900 transition-colors">Conditions</Link>
          )}
          {clinic.showPageFirstVisit !== false && clinic.showNavFirstVisit !== false && (
            <Link to="/first-visit" className="hover:text-stone-900 transition-colors">First Visit</Link>
          )}
          {clinic.showPageAbout !== false && clinic.showNavAbout !== false && (
            <Link to="/about" className="hover:text-stone-900 transition-colors">About</Link>
          )}
          {clinic.showPageTeam !== false && clinic.showNavTeam !== false && (
            <Link to="/team" className="hover:text-stone-900 transition-colors">Team</Link>
          )}
          {clinic.showPagePricing !== false && clinic.showNavPricing !== false && (
            <Link to="/pricing" className="hover:text-stone-900 transition-colors">Pricing</Link>
          )}
          {clinic.showPageBlog !== false && clinic.showNavBlog !== false && (
            <Link to="/blog" className="hover:text-stone-900 transition-colors">Blog</Link>
          )}
          <Link to="/contact" className="hover:text-stone-900 transition-colors">Contact</Link>
          {clinic.showPagePortal !== false && (
            <Link
              to="/portal"
              className="text-emerald-800 hover:text-emerald-950 font-semibold transition-colors flex items-center gap-1"
            >
              <span>Patient Portal</span>
            </Link>
          )}
        </nav>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => context.openPatientPortal()}
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 px-2.5 py-1.5 rounded-lg hover:bg-stone-200/50 transition cursor-pointer"
            title="Lookup booking, reschedule, or view receipt"
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Manage Booking</span>
          </button>

          <a
            href={`tel:${activeLocation.phoneRaw}`}
            className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-emerald-800 px-3 py-2 rounded-md hover:bg-stone-200/60 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>{activeLocation.phone}</span>
          </a>

          <button
            type="button"
            onClick={() => {
              context.openBookingModal();
              if (onBookClick) onBookClick();
            }}
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
          {clinic.showPageConditions !== false && clinic.showNavConditions !== false && (
          <Link
            to="/conditions"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Conditions We Treat
          </Link>
          )}
          {clinic.showPageFirstVisit !== false && clinic.showNavFirstVisit !== false && (
          <Link
            to="/first-visit"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            First Visit Guide
          </Link>
          )}
          {clinic.showPagePricing !== false && clinic.showNavPricing !== false && (
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Pricing
          </Link>
          )}
          {clinic.showPageBlog !== false && clinic.showNavBlog !== false && (
          <Link
            to="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Blog
          </Link>
          )}
          {clinic.showPageAbout !== false && clinic.showNavAbout !== false && (
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            About
          </Link>
          )}
          {clinic.showPageTeam !== false && clinic.showNavTeam !== false && (
          <Link
            to="/team"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Our Team
          </Link>
          )}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 px-3 text-base font-medium text-stone-800 hover:bg-stone-200/60 rounded-md transition"
          >
            Contact
          </Link>
          {clinic.showPagePortal !== false && (
          <Link
            to="/portal"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2.5 px-3 text-base font-semibold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-xl transition border border-emerald-200/80"
          >
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-700" />
              <span>Patient Portal / Login</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-800 text-white px-2 py-0.5 rounded-full">
              Access
            </span>
          </Link>
          )}
          <div className="pt-2 border-t border-stone-200 space-y-1">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                context.openPatientPortal();
              }}
              className="w-full flex items-center gap-2 py-2 px-3 text-sm font-semibold text-stone-800 hover:bg-stone-200/60 rounded-md transition text-left cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4 text-emerald-700" />
              <span>Quick Booking Lookup</span>
            </button>
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
