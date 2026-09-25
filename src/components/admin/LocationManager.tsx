import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Plus,
  Trash2,
  Check,
  Star,
  ShieldCheck,
  Edit3,
  Car,
  Compass,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ClinicInfo, ClinicLocation } from '../../types';
import { defaultLocations } from '../../data/clinicData';

interface LocationManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({ clinic, onUpdateClinic }) => {
  const locations: ClinicLocation[] = clinic.locations && clinic.locations.length > 0 ? clinic.locations : defaultLocations;
  const activeLocationId = clinic.activeLocationId || locations[0]?.id || 'loc-marylebone';

  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClinicLocation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleStartEdit = (loc: ClinicLocation) => {
    setEditingLocId(loc.id);
    setFormData({ ...loc });
  };

  const handleAddNew = () => {
    const newLoc: ClinicLocation = {
      id: `loc-${Date.now()}`,
      name: 'New Branch Clinic',
      tagline: 'Specialized Spine & Wellness Suite',
      isPrimary: false,
      address: '100 New Bond Street',
      city: 'London',
      state: 'Greater London',
      cityState: 'London, UK',
      zip: 'W1S 1SR',
      phone: '+44 20 7946 0000',
      phoneRaw: '442079460000',
      email: 'branch@vancehealth.co.uk',
      hoursWeekday: 'Mon–Fri: 8:30 AM – 6:30 PM',
      hoursSaturday: 'Sat: 9:00 AM – 1:00 PM',
      parkingNote: 'Street parking & underground parking available.',
      transitNote: 'Near central underground station.',
      active: true,
    };
    const nextLocations = [...locations, newLoc];
    onUpdateClinic({ ...clinic, locations: nextLocations, activeLocationId: newLoc.id });
    setEditingLocId(newLoc.id);
    setFormData(newLoc);
    showNotice('New clinic branch created!');
  };

  const handleSaveEdit = () => {
    if (!formData) return;
    const nextLocations = locations.map((l) => (l.id === formData.id ? formData : l));
    onUpdateClinic({ ...clinic, locations: nextLocations });
    setEditingLocId(null);
    setFormData(null);
    showNotice('Clinic location updated successfully!');
  };

  const handleDelete = (id: string) => {
    if (locations.length <= 1) {
      alert('You must maintain at least one clinic location.');
      return;
    }
    const nextLocations = locations.filter((l) => l.id !== id);
    const nextActive = clinic.activeLocationId === id ? nextLocations[0]?.id : clinic.activeLocationId;
    onUpdateClinic({ ...clinic, locations: nextLocations, activeLocationId: nextActive });
    showNotice('Clinic location removed.');
  };

  const handleSetPrimary = (id: string) => {
    const nextLocations = locations.map((l) => ({
      ...l,
      isPrimary: l.id === id,
    }));
    onUpdateClinic({ ...clinic, locations: nextLocations, activeLocationId: id });
    showNotice('Primary flagship branch updated!');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-Location Practice Switcher</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage your clinic branches, street addresses, direct phone lines, operating hours, and practitioner allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notification && (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300">
              {notification}
            </span>
          )}
          <button
            type="button"
            onClick={handleAddNew}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => {
          const isPrimary = loc.isPrimary;
          const isActive = activeLocationId === loc.id;
          const isEditing = editingLocId === loc.id && formData !== null;

          return (
            <div
              key={loc.id}
              className={`p-5 rounded-2xl border transition relative space-y-4 ${
                isActive
                  ? 'bg-stone-850 border-emerald-600/80 shadow-lg'
                  : 'bg-stone-900 border-stone-800 hover:border-stone-700'
              }`}
            >
              {isPrimary && (
                <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Flagship</span>
                </span>
              )}

              {/* Branch Name & Tagline */}
              <div>
                <h4 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                  <span>{loc.name}</span>
                </h4>
                <p className="text-xs text-stone-400 italic mt-0.5">{loc.tagline || 'Specialized Clinic Practice'}</p>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{loc.address}</p>
                    <p className="text-stone-400">{loc.city}, {loc.state} {loc.zip}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono">{loc.phone}</span>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-stone-400">{loc.hoursWeekday}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(loc.id)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      Make Flagship
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(loc)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-400" />
                    <span>Edit</span>
                  </button>
                </div>

                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDelete(loc.id)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition cursor-pointer"
                    title="Remove branch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal / Drawer if editing */}
      {editingLocId && formData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h4 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Edit Branch: {formData.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingLocId(null)}
                className="text-stone-400 hover:text-white text-xs font-bold"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">City / State</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">Postal Code (ZIP)</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">Direct Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={formData.hoursWeekday || ''}
                  onChange={(e) => setFormData({ ...formData, hoursWeekday: e.target.value })}
                  className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-1">Parking & Transit Note</label>
                <textarea
                  rows={2}
                  value={formData.parkingNote || ''}
                  onChange={(e) => setFormData({ ...formData, parkingNote: e.target.value })}
                  className="w-full p-2.5 bg-stone-950 border border-stone-750 rounded-xl text-xs text-stone-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setEditingLocId(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Save Branch Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
