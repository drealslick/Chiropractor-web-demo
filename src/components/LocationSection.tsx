import React from 'react';
import { MapPin, Clock, Car, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { ClinicInfo } from '../types';

interface LocationSectionProps {
  clinic: ClinicInfo;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ clinic }) => {
  // Query-based OpenStreetMap embed that dynamically searches the clinic's address and city
  const query = encodeURIComponent(`${clinic.address}, ${clinic.cityState} ${clinic.zip}`);
  const mapSrc = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section id="location" className="py-20 md:py-28 bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 block mb-2">
            Find Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Location
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-12 gap-8 items-stretch">
          
          {/* MAP EMBED */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative min-h-[340px]"
          >
            <iframe
              title="Clinic Location Map"
              src={mapSrc}
              className="w-full h-full min-h-[340px] border-0"
              loading="lazy"
            />
            {/* Map overlay pill */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-stone-200 text-stone-800 text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{clinic.address}, {clinic.cityState}</span>
            </div>
          </motion.div>

          {/* CLINIC DETAILS CARD */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-6"
          >
            
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Address</h3>
                  <p className="text-stone-700 text-sm mt-0.5">{clinic.address}</p>
                  <p className="text-stone-700 text-sm">{clinic.city}, {clinic.state} {clinic.zip}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Hours</h3>
                  <p className="text-stone-700 text-sm mt-0.5">{clinic.hoursWeekday}</p>
                  <p className="text-stone-700 text-sm">{clinic.hoursSaturday}</p>
                  <p className="text-stone-400 text-xs mt-0.5">Sunday: Closed</p>
                </div>
              </div>

              {/* Parking */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Parking</h3>
                  <p className="text-stone-700 text-sm mt-0.5">{clinic.parkingNote}</p>
                </div>
              </div>
            </div>

            {/* BIG TAPPABLE PHONE */}
            <div className="pt-6 border-t border-stone-100 space-y-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-500 block mb-2">
                  Questions or immediate appointments:
                </span>
                <a
                  href={`tel:${clinic.phoneRaw}`}
                  id="location-call-phone-button"
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-emerald-900 hover:bg-stone-900 text-white font-bold text-lg sm:text-xl rounded-xl shadow-md transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <Phone className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>{clinic.phone}</span>
                </a>
              </div>
              {clinic.email && (
                <div className="flex justify-center pt-1 animate-fade-in">
                  <a
                    href={`mailto:${clinic.email}`}
                    className="text-xs font-semibold text-stone-600 hover:text-emerald-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>{clinic.email}</span>
                  </a>
                </div>
              )}
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
