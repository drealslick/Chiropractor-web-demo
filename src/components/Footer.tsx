import React from 'react';
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, Globe } from 'lucide-react';
import { ClinicInfo } from '../types';

interface FooterProps {
  clinic: ClinicInfo;
  onOpenManager?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ clinic, onOpenManager }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 text-stone-300 py-16 sm:py-20 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          
          {/* Logo & NAP */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-800 text-stone-100 flex items-center justify-center font-serif text-lg font-bold">
                <span>{clinic.name.charAt(0) || 'C'}</span>
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-tight">
                {clinic.logoText || clinic.name}
              </span>
            </div>

            {/* FULL NAP EXACT MATCH */}
            <div className="text-stone-400 text-sm space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{clinic.address}, {clinic.city}, {clinic.state} {clinic.zip}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href={`tel:${clinic.phoneRaw}`} className="hover:text-white transition-colors">
                  {clinic.phone}
                </a>
              </div>
              {clinic.email && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                  <a href={`mailto:${clinic.email}`} className="hover:text-white transition-colors break-all">
                    {clinic.email}
                  </a>
                </div>
              )}
            </div>

            {/* Social Links Row */}
            {(clinic.instagram || clinic.facebook || clinic.googleBusiness) && (
              <div className="flex items-center gap-3 pt-2 animate-fade-in">
                {clinic.instagram && (
                  <a
                    href={clinic.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 transition-all shadow-xs"
                    aria-label="Instagram Profile"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {clinic.facebook && (
                  <a
                    href={clinic.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 transition-all shadow-xs"
                    aria-label="Facebook Page"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {clinic.googleBusiness && (
                  <a
                    href={clinic.googleBusiness}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 transition-all shadow-xs flex items-center gap-1 text-[11px] font-bold tracking-wider"
                    aria-label="Google Business Listing"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="uppercase text-[9px] text-stone-400 font-sans">Maps</span>
                  </a>
                )}
              </div>
            )}

            <p className="text-xs text-stone-500 max-w-sm pt-2">
              {clinic.cityState} based chiropractic care focused on restorative biomechanics, personalized rehabilitation, and pain elimination.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 block">
              Quick Links
            </span>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#care" className="hover:text-white transition-colors">Care & Conditions</a></li>
              <li><a href="#results" className="hover:text-white transition-colors">Patient Results</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked</a></li>
              <li><a href="#location" className="hover:text-white transition-colors">Location & Parking</a></li>
            </ul>
          </div>

          {/* Hours & Contact */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 block">
              Clinic Hours
            </span>
            <div className="text-sm text-stone-400 space-y-1.5">
              <div className="flex items-center gap-2 text-stone-300">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mon – Thu: 8:00 AM – 6:00 PM</span>
              </div>
              <p className="text-xs text-stone-500 pl-6">Fri: 8:00 AM – 2:00 PM</p>
              <p className="text-xs text-stone-500 pl-6">Sat: 9:00 AM – 1:00 PM</p>
              <p className="text-xs text-emerald-400/90 pl-6 pt-1">Same-day appointments available</p>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {currentYear} {clinic.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2">
            <a href="#" className="hover:text-stone-400 transition-colors py-1">Privacy Policy</a>
            <span className="text-stone-700">·</span>
            <a href="#" className="hover:text-stone-400 transition-colors py-1">Terms of Service</a>
            <span className="text-stone-700">·</span>
            <a href="#" className="hover:text-stone-400 transition-colors py-1">HIPAA Compliance</a>
            {onOpenManager && (
              <>
                <span className="text-stone-700">·</span>
                <button
                  onClick={onOpenManager}
                  className="text-stone-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 py-1 px-2 rounded hover:bg-stone-900"
                  title="Agency Client Template Manager"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Agency Manager ⚙️</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
