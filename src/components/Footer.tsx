import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Mail, Instagram, Facebook, Globe, Youtube, Linkedin, Twitter } from 'lucide-react';
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
              {(clinic.logoUrl || clinic.logoImage || (clinic as any).logo) ? (
                <div className="flex items-center justify-center overflow-hidden rounded-xl bg-stone-900 border border-stone-800 shadow-xs shrink-0">
                  <img
                    src={clinic.logoUrl || clinic.logoImage || (clinic as any).logo}
                    alt={clinic.logoUrlAlt || clinic.logoImageAlt || clinic.logoText || clinic.name || 'Practice Logo'}
                    className="h-9 w-auto max-w-[160px] object-contain rounded-lg p-0.5"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-stone-100 flex items-center justify-center font-serif text-lg font-bold shrink-0">
                  <span>{(clinic.name || 'C').charAt(0) || 'C'}</span>
                </div>
              )}
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
            {(clinic.instagram || clinic.facebook || clinic.googleBusiness || clinic.youtube || clinic.linkedin || clinic.twitter || clinic.tiktok) && (
              <div className="pt-2 animate-fade-in space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block">
                  Follow & Connect
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {clinic.googleBusiness && (
                    <a
                      href={clinic.googleBusiness}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-emerald-500/50 hover:bg-stone-850 transition-all shadow-xs flex items-center gap-1.5 text-xs font-medium group"
                      aria-label="Google Business Profile & Reviews"
                      title="Google Business Profile & Reviews"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px]">Google Reviews</span>
                    </a>
                  )}
                  {clinic.instagram && (
                    <a
                      href={clinic.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-pink-400 hover:border-pink-500/40 hover:bg-stone-850 transition-all shadow-xs"
                      aria-label="Instagram Profile"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {clinic.facebook && (
                    <a
                      href={clinic.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-stone-850 transition-all shadow-xs"
                      aria-label="Facebook Page"
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {clinic.youtube && (
                    <a
                      href={clinic.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-red-400 hover:border-red-500/40 hover:bg-stone-850 transition-all shadow-xs"
                      aria-label="YouTube Channel"
                      title="YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {clinic.linkedin && (
                    <a
                      href={clinic.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-sky-400 hover:border-sky-500/40 hover:bg-stone-850 transition-all shadow-xs"
                      aria-label="LinkedIn Page"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {clinic.twitter && (
                    <a
                      href={clinic.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:border-stone-700 hover:bg-stone-850 transition-all shadow-xs"
                      aria-label="X / Twitter Profile"
                      title="X / Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {clinic.tiktok && (
                    <a
                      href={clinic.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-teal-300 hover:border-teal-500/40 hover:bg-stone-850 transition-all shadow-xs flex items-center justify-center"
                      aria-label="TikTok Profile"
                      title="TikTok"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c-.03 2.11-.79 4.17-2.22 5.73-1.55 1.7-3.82 2.66-6.11 2.61-2.12-.04-4.18-.9-5.71-2.39-1.63-1.58-2.52-3.8-2.48-6.07.03-2.12.87-4.18 2.37-5.69 1.55-1.56 3.7-2.45 5.92-2.45.35 0 .7.02 1.05.06v4.06c-.34-.1-.7-.16-1.06-.16-1.12 0-2.23.47-3 1.28-.79.82-1.21 1.95-1.18 3.08.02 1.1.47 2.19 1.25 2.97.8.8 1.91 1.23 3.04 1.21 1.16-.01 2.27-.51 3.03-1.37.66-.75 1.01-1.74 1.01-2.74V.02h-.75z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-stone-500 max-w-sm pt-2">
              {clinic.footerDescription || `${clinic.cityState} based chiropractic care focused on restorative biomechanics, personalized rehabilitation, and pain elimination.`}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 block">
              Quick Links
            </span>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><Link to="/about" className="hover:text-white transition-colors">{clinic.navLink1 || "About"}</Link></li>
              <li><Link to="/team" className="hover:text-white transition-colors">Our Clinical Team</Link></li>
              <li><Link to="/conditions" className="hover:text-white transition-colors">{clinic.navLink2 || "Care"} & Conditions</Link></li>
              <li><Link to="/first-visit" className="hover:text-white transition-colors">First Visit Guide</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Fees</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Clinical Blog</Link></li>
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
                <span>{clinic.hoursWeekday || "Mon – Thu: 8:00 AM – 6:00 PM"}</span>
              </div>
              <p className="text-xs text-stone-500 pl-6">{clinic.hoursFriday || "Fri: 8:00 AM – 2:00 PM"}</p>
              <p className="text-xs text-stone-500 pl-6">{clinic.hoursSaturday || "Sat: 9:00 AM – 1:00 PM"}</p>
              <p className="text-xs text-emerald-400/90 pl-6 pt-1">{clinic.hoursDisclaimer || "Same-day appointments available"}</p>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {currentYear} {clinic.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2">
            <Link to="/privacy" className="hover:text-stone-300 transition-colors py-1">Privacy Policy</Link>
            <span className="text-stone-700">·</span>
            <Link to="/terms" className="hover:text-stone-300 transition-colors py-1">Terms of Service</Link>
            <span className="text-stone-700">·</span>
            <Link to="/privacy" className="hover:text-stone-300 transition-colors py-1">HIPAA Compliance</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
