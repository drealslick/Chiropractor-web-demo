import React, { useState } from 'react';
import {
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  Sparkles,
} from 'lucide-react';
import { PatientLead, saveLead, updateLeadDetails, deleteLead } from '../../data/leadsStore';

interface WaitlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leads: PatientLead[];
  clinicName: string;
  onAssignToCalendar: (lead: PatientLead) => void;
}

export const WaitlistDrawer: React.FC<WaitlistDrawerProps> = ({
  isOpen,
  onClose,
  leads,
  clinicName,
  onAssignToCalendar,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newWaitlistName, setNewWaitlistName] = useState('');
  const [newWaitlistPhone, setNewWaitlistPhone] = useState('');
  const [newWaitlistEmail, setNewWaitlistEmail] = useState('');
  const [newWaitlistCondition, setNewWaitlistCondition] = useState('');
  const [newWaitlistWindow, setNewWaitlistWindow] = useState('Morning (9 AM - 12 PM)');
  const [newWaitlistNotes, setNewWaitlistNotes] = useState('');

  if (!isOpen) return null;

  const waitlistPatients = leads.filter((l) => l.status === 'waitlist');

  const handleCreateWaitlistEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaitlistName.trim() || !newWaitlistPhone.trim()) {
      alert('Please enter patient name and contact phone.');
      return;
    }

    saveLead({
      source: 'booking',
      name: newWaitlistName.trim(),
      phone: newWaitlistPhone.trim(),
      email: newWaitlistEmail.trim() || `${newWaitlistName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      condition: newWaitlistCondition.trim() || 'Acute Spinal Relief',
      preferredTimeWindow: newWaitlistWindow,
      notes: newWaitlistNotes.trim() || 'Added to priority cancellation waitlist by reception desk.',
      status: 'waitlist',
      clinicName,
    });

    // Reset form
    setNewWaitlistName('');
    setNewWaitlistPhone('');
    setNewWaitlistEmail('');
    setNewWaitlistCondition('');
    setNewWaitlistNotes('');
    setIsAddingNew(false);
  };

  const handleRemoveFromWaitlist = (id: string) => {
    if (confirm('Remove this patient from the cancellation waitlist?')) {
      deleteLead(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[125] flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-stone-900 border-l border-stone-800 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Cancellation Waitlist</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950">
                  {waitlistPatients.length} Waiting
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Patients ready for short-notice cancellation calls & same-day openings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-850 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3.5 bg-stone-850/70 border-b border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-300 font-medium">
            Immediate patient back-fill queue
          </span>
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNew ? 'Cancel' : '+ Add Patient to Waitlist'}</span>
          </button>
        </div>

        {/* Add Patient Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateWaitlistEntry}
            className="p-4 bg-stone-900 border-b border-stone-800 space-y-3 animate-fade-in"
          >
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Add Patient to Cancellation Queue
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-stone-400 block mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newWaitlistName}
                  onChange={(e) => setNewWaitlistName(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-400 block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={newWaitlistPhone}
                  onChange={(e) => setNewWaitlistPhone(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={newWaitlistEmail}
                  onChange={(e) => setNewWaitlistEmail(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-400 block mb-1">
                  Preferred Time Window
                </label>
                <select
                  value={newWaitlistWindow}
                  onChange={(e) => setNewWaitlistWindow(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Mid-day (12 PM - 2 PM)">Mid-day (12 PM - 2 PM)</option>
                  <option value="Afternoon (2 PM - 5 PM)">Afternoon (2 PM - 5 PM)</option>
                  <option value="Anytime Today (High Urgency)">Anytime Today (High Urgency)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-stone-400 block mb-1">
                  Condition / Chief Complaint
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acute Neck Spasm / Can't turn head"
                  value={newWaitlistCondition}
                  onChange={(e) => setNewWaitlistCondition(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-stone-400 block mb-1">
                  Availability Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Works 5 mins away, can come with 15 mins notice"
                  value={newWaitlistNotes}
                  onChange={(e) => setNewWaitlistNotes(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-xl text-stone-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer shadow-xs"
              >
                Add to Waitlist
              </button>
            </div>
          </form>
        )}

        {/* Waitlist Patients List */}
        <div className="p-4 sm:p-5 space-y-3 flex-1 overflow-y-auto">
          {waitlistPatients.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-stone-800 rounded-2xl p-6">
              <Clock className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-300">Waitlist is currently empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                When a patient asks to be contacted if an earlier appointment slot opens up, add them here.
              </p>
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="mt-4 px-3.5 py-1.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Waitlist Patient</span>
              </button>
            </div>
          ) : (
            waitlistPatients.map((patient) => {
              const cleanPhone = patient.phone.replace(/[^0-9+]/g, '');
              const emailSubject = encodeURIComponent(`Open Appointment Slot at ${clinicName}`);
              const emailBody = encodeURIComponent(
                `Hello ${patient.name},\n\nAn earlier appointment slot has opened up at ${clinicName}. Please reply or call us at our reception desk if you would like this slot.\n\nThank you!`
              );

              return (
                <div
                  key={patient.id}
                  className="p-4 rounded-xl bg-stone-850 border border-stone-750 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-100">{patient.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {patient.preferredTimeWindow || 'Flexible'}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                        {patient.condition || 'General Exam'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromWaitlist(patient.id)}
                      className="p-1 text-stone-500 hover:text-rose-400 transition cursor-pointer"
                      title="Remove from waitlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Notes / Fast Availability info */}
                  {patient.notes && (
                    <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                        Availability Notes:
                      </span>
                      <p>{patient.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons: Call / Email / Offer Open Slot */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-emerald-950 hover:text-emerald-300 border border-stone-700 text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                        title={`Call ${patient.name}`}
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Call ({patient.phone})</span>
                      </a>

                      <a
                        href={`mailto:${patient.email}?subject=${emailSubject}&body=${emailBody}`}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-sky-950 hover:text-sky-300 border border-stone-700 text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                        title={`Email ${patient.name}`}
                      >
                        <Mail className="w-3 h-3 text-sky-400" />
                        <span>Email</span>
                      </a>
                    </div>

                    {/* Offer Slot / Assign to Calendar */}
                    <button
                      type="button"
                      onClick={() => {
                        onAssignToCalendar(patient);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Offer Open Slot →</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
