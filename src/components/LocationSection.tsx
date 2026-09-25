import React, { useState } from 'react';
import { MapPin, Clock, Car, Phone, Mail, Building2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo, ClinicLocation } from '../types';
import { useClinic } from '../data/ClinicContext';
import { defaultLocations } from '../data/clinicData';

interface LocationSectionProps {
  clinic: ClinicInfo;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ clinic }) => {
  const context = useClinic();
  const locations: ClinicLocation[] = clinic.locations && clinic.locations.length > 0 ? clinic.locations : defaultLocations;
  
  const [selectedLocId, setSelectedLocId] = useState<string>(context.activeLocation?.id || locations[0]?.id || 'loc-marylebone');

  const currentLoc = locations.find((l) => l.id === selectedLocId) || locations[0] || defaultLocations[0];

  const query = encodeURIComponent(`${currentLoc.address}, ${currentLoc.city} ${currentLoc.zip}`);
  const mapSrc = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section id="location" className="py-14 sm:py-18 md:py-24 bg-gradient-to-b from-stone-100/60 via-stone-50 to-stone-50 border-b border-stone-200 overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-stone-300/80 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-8 sm:mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full inline-block mb-2.5">
            {clinic.locationSectionSubtitle || "Multi-Location Practice"}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            {clinic.locationSectionTitle || "Our Clinic Locations"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Select a branch below to view accessibility, direct telephone lines, and operating hours.
          </p>
        </motion.div>

        {/* Branch Switcher Tabs */}
        {locations.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {locations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  setSelectedLocId(loc.id);
                  context.setActiveLocationId(loc.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                  selectedLocId === loc.id
                    ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${selectedLocId === loc.id ? 'text-emerald-400' : 'text-emerald-700'}`} />
                <span>{loc.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-8 items-stretch">
          
          {/* MAP EMBED */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative min-h-[360px]"
          >
            <iframe
              title={currentLoc.name}
              src={mapSrc}
              className="w-full h-full min-h-[360px] border-0"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-stone-200 text-stone-800 text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{currentLoc.name}</span>
            </div>

            <div className="absolute bottom-4 right-4">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* BRANCH DETAILS CARD */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded">
                  {currentLoc.tagline || 'Clinic Branch'}
                </span>
                <h3 className="font-serif font-bold text-stone-900 text-lg mt-1">{currentLoc.name}</h3>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Address</h4>
                  <p className="text-stone-700 text-xs mt-0.5">{currentLoc.address}</p>
                  <p className="text-stone-700 text-xs">{currentLoc.city}, {currentLoc.state} {currentLoc.zip}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Operating Hours</h4>
                  <p className="text-stone-700 text-xs mt-0.5">{currentLoc.hoursWeekday}</p>
                  <p className="text-stone-700 text-xs">{currentLoc.hoursSaturday}</p>
                </div>
              </div>

              {/* Phone & Transit */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Direct Phone Line</h4>
                  <a href={`tel:${currentLoc.phoneRaw}`} className="text-xs font-mono text-emerald-800 font-bold hover:underline">
                    {currentLoc.phone}
                  </a>
                  {currentLoc.transitNote && (
                    <p className="text-stone-500 text-[11px] mt-1 leading-relaxed">{currentLoc.transitNote}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => context.openBookingModal()}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white font-semibold text-xs transition cursor-pointer shadow-sm text-center"
              >
                Book Consultation at {currentLoc.name.split(' ')[0]} →
              </button>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
