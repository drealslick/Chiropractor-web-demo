import React, { useState, useEffect } from 'react';
import { X, Check, Calendar as CalendarIcon, Clock, User, Phone, Mail, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClinicInfo, BookingFormData } from '../types';
import { useClinic } from '../data/ClinicContext';
import { saveLead } from '../data/leadsStore';

interface BookingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  clinic?: ClinicInfo;
  initialCondition?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  clinic: propClinic,
  initialCondition: propInitialCondition,
}) => {
  const context = useClinic();
  const clinic = propClinic || context.clinicData;
  const isOpen = propIsOpen !== undefined ? propIsOpen : context.isBookingModalOpen;
  const onClose = propOnClose || context.closeBookingModal;
  const activeInitialCondition = propInitialCondition || context.bookingInitialCondition || 'Back pain';

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<BookingFormData>({
    condition: activeInitialCondition,
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);

  // Generate next 7 available business days
  const nextDays = React.useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 10 && days.length < 6; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      // Skip Sundays (0)
      if (d.getDay() !== 0) {
        days.push({
          dateObj: d,
          dateString: d.toISOString().split('T')[0],
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: d.getDate(),
          monthName: d.toLocaleDateString('en-US', { month: 'short' }),
          isSaturday: d.getDay() === 6
        });
      }
    }
    return days;
  }, []);

  useEffect(() => {
    if (activeInitialCondition) {
      setFormData(prev => ({ ...prev, condition: activeInitialCondition }));
    }
  }, [activeInitialCondition]);

  useEffect(() => {
    if (nextDays.length > 0 && !formData.date) {
      setFormData(prev => ({ ...prev, date: nextDays[0].dateString }));
    }
  }, [nextDays, formData.date]);

  const conditions = [
    'Back pain',
    'Neck pain',
    'Sports injury',
    'Headaches',
    'Other'
  ];

  const timeSlotsWeekday = [
    '9:00 AM',
    '10:15 AM',
    '11:30 AM',
    '1:45 PM',
    '3:00 PM',
    '4:15 PM',
    '5:00 PM'
  ];

  const timeSlotsSaturday = [
    '9:30 AM',
    '10:45 AM',
    '11:45 AM',
    '12:30 PM'
  ];

  const currentDay = nextDays[selectedDayIndex] || nextDays[0];
  const allSlots = currentDay?.isSaturday ? timeSlotsSaturday : timeSlotsWeekday;

  // Determine taken/booked slots strictly from actual recorded leads
  const takenSlotsForDay = React.useMemo(() => {
    if (!currentDay) return new Set<string>();
    const taken = new Set<string>();
    
    // Read only actual submitted appointments from the leads store
    try {
      const stored = localStorage.getItem('agency_patient_leads_v1');
      if (stored) {
        const leads = JSON.parse(stored);
        leads.forEach((l: { date?: string; time?: string; status?: string }) => {
          if (l.date === currentDay.dateString && l.time && l.status !== 'archived') {
            taken.add(l.time);
          }
        });
      }
    } catch {
      // ignore
    }

    return taken;
  }, [currentDay, step]);

  const handleConditionSelect = (cond: string) => {
    setFormData(prev => ({ ...prev, condition: cond }));
    setStep(2);
  };

  const handleTimeSelect = (slot: string) => {
    if (takenSlotsForDay.has(slot)) return;
    setFormData(prev => ({
      ...prev,
      date: currentDay.dateString,
      time: slot
    }));
    setStep(3);
  };

  const feeDisplay = clinic.examFee || (clinic.currencySymbol === '£' ? '£45' : '$49');
  const doctorDisplayName = clinic.doctorName?.startsWith('Dr.')
    ? clinic.doctorName
    : clinic.doctorName || 'our lead practitioner';

  // Build prefilled external URL for JaneApp / Calendly / Acuity / Cliniko
  const prefilledExternalUrl = React.useMemo(() => {
    if (!clinic.externalBookingUrl) return '';
    try {
      const url = new URL(clinic.externalBookingUrl);
      const nameParts = (formData.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (formData.name) url.searchParams.set('name', formData.name);
      if (firstName) url.searchParams.set('first_name', firstName);
      if (lastName) url.searchParams.set('last_name', lastName);
      if (formData.email) url.searchParams.set('email', formData.email);
      if (formData.phone) url.searchParams.set('phone', formData.phone);
      if (formData.condition) {
        url.searchParams.set('condition', formData.condition);
        url.searchParams.set('a1', formData.condition); // Calendly question 1
      }
      return url.toString();
    } catch {
      const params = new URLSearchParams();
      if (formData.name) params.set('name', formData.name);
      if (formData.email) params.set('email', formData.email);
      if (formData.phone) params.set('phone', formData.phone);
      if (formData.condition) params.set('condition', formData.condition);
      const q = params.toString();
      return clinic.externalBookingUrl.includes('?')
        ? `${clinic.externalBookingUrl}&${q}`
        : `${clinic.externalBookingUrl}?${q}`;
    }
  }, [clinic.externalBookingUrl, formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Please fill in your name, phone number, and email.');
      return;
    }
    // Save to Lead Inbox (always captured)
    saveLead({
      source: 'booking',
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      condition: formData.condition || 'Chiropractic Initial Exam',
      date: formData.date,
      time: formData.time,
      clinicName: clinic.name,
      notes: `Requested: Initial Consultation (${feeDisplay}). Preferred slot: ${formData.date} at ${formData.time}`,
      status: 'new',
    });
    setStep(4);
  };

  const resetAndClose = () => {
    setStep(1);
    onClose();
  };

  const [activeViewMode, setActiveViewMode] = useState<'flow' | 'iframe'>(
    clinic.bookingEmbedMode === 'iframe' && clinic.externalBookingUrl ? 'iframe' : 'flow'
  );

  useEffect(() => {
    if (isOpen) {
      setActiveViewMode(clinic.bookingEmbedMode === 'iframe' && clinic.externalBookingUrl ? 'iframe' : 'flow');
    }
  }, [isOpen, clinic.bookingEmbedMode, clinic.externalBookingUrl]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-white rounded-2xl shadow-2xl border border-stone-200 w-full overflow-hidden flex flex-col max-h-[92vh] ${
              activeViewMode === 'iframe' ? 'max-w-3xl h-[85vh]' : 'max-w-lg'
            }`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                  {activeViewMode === 'iframe'
                    ? 'Integrated Live Schedule'
                    : step === 4
                    ? 'Appointment Request'
                    : `Step ${step} of 3`}
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900 leading-tight">
                  {activeViewMode === 'iframe'
                    ? `Book with ${doctorDisplayName}`
                    : step === 1
                    ? 'What brings you in?'
                    : step === 2
                    ? 'Choose a date & time'
                    : step === 3
                    ? 'Your details'
                    : 'Request Confirmed'}
                </h2>
                <p className="text-xs text-stone-500">
                  {activeViewMode === 'iframe'
                    ? 'Select your appointment type and slot below'
                    : 'Online appointment request'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeViewMode === 'iframe' && clinic.externalBookingUrl && (
                  <a
                    href={clinic.externalBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in new window"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors text-xs font-medium"
                  >
                    ↗ New Window
                  </a>
                )}
                <button
                  onClick={resetAndClose}
                  aria-label="Close booking modal"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* IFRAME EMBED VIEW */}
            {activeViewMode === 'iframe' && clinic.externalBookingUrl ? (
              <div className="flex-1 flex flex-col overflow-hidden relative bg-stone-50">
                <iframe
                  src={clinic.externalBookingUrl}
                  title={`${clinic.name} Online Booking Calendar`}
                  className="w-full h-full flex-1 border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
                <div className="p-2.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                  <span>Having trouble with the calendar?</span>
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('flow')}
                    className="font-semibold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Switch to Quick Request Form →
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                {step < 4 && (
                  <div className="w-full bg-stone-100 h-1">
                    <div
                      className="bg-emerald-700 h-1 transition-all duration-300"
                      style={{ width: `${(step / 3) * 100}%` }}
                    />
                  </div>
                )}

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: What brings you in? */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                Select the primary issue you'd like {doctorDisplayName} to evaluate:
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {conditions.map((cond) => {
                  const isSelected = formData.condition === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => handleConditionSelect(cond)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-800 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-800'
                          : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <span className="text-base font-serif">{cond}</span>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-emerald-800' : 'text-stone-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Offer reminder */}
              <div className="mt-6 p-3 rounded-lg bg-stone-100 border border-stone-200 flex items-center gap-2.5 text-xs text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>New Patient Rate:</strong> {feeDisplay} initial consultation & assessment.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Choose a time */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-stone-600">
                  Select an upcoming day and preferred time slot:
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>
              </div>

              {/* Day horizontal picker */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {nextDays.map((day, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <button
                      key={day.dateString}
                      type="button"
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-emerald-800 bg-emerald-900 text-white shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                        {day.dayName}
                      </span>
                      <span className="text-lg font-serif font-bold my-0.5">
                        {day.dayNumber}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`}>
                        {day.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots for selected day */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
                    Openings for {currentDay.dayName}, {currentDay.monthName} {currentDay.dayNumber}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Available</span>
                    </span>
                    {takenSlotsForDay.size > 0 && (
                      <span className="inline-flex items-center gap-1 text-stone-400">
                        <span className="w-2 h-2 rounded-full bg-stone-300" />
                        <span>Booked</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                  {allSlots.map((slot) => {
                    const isTaken = takenSlotsForDay.has(slot);
                    const isSelected = formData.time === slot && formData.date === currentDay.dateString;

                    if (isTaken) {
                      return (
                        <div
                          key={slot}
                          title="This slot is already booked"
                          className="py-2.5 px-3 rounded-lg border border-stone-200/70 bg-stone-100/80 text-stone-400 text-xs sm:text-sm font-medium text-center flex items-center justify-between cursor-not-allowed select-none opacity-60"
                        >
                          <span className="line-through">{slot}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-200/80 px-1.5 py-0.5 rounded">
                            Booked
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleTimeSelect(slot)}
                        className={`py-2.5 px-3 rounded-lg border text-xs sm:text-sm font-semibold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-emerald-800 bg-emerald-800 text-white shadow-sm'
                            : 'border-stone-200 hover:border-emerald-700 hover:bg-emerald-50/60 text-stone-800'
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`} />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-stone-500 text-center italic">
                Need a specific time not shown? Call us directly at {clinic.phone}.
              </p>
            </div>
          )}

          {/* STEP 3: Your details */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="text-xs text-stone-600">
                  Selected: <strong>{formData.condition}</strong> on <strong>{formData.date} at {formData.time}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change time</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="(614) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Anything we should know? (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your symptoms, how long you've felt pain, or any past treatments..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 border border-stone-300 rounded-lg text-sm text-stone-900 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-booking-request-btn"
                  className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm tracking-wide rounded-lg shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  Request Appointment ({feeDisplay})
                </button>
              </div>

              <p className="text-[11px] text-stone-500 text-center">
                Patient information is handled with strict confidentiality.
              </p>
            </form>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && (
            <div className="text-center py-4 space-y-5 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Request Received
                </h3>
                {/* Exact prompt copy */}
                <p className="text-base text-stone-700 font-medium max-w-sm mx-auto leading-relaxed">
                  "We've received your request. Our team will contact you within 24 hours to confirm."
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left space-y-2 text-xs sm:text-sm text-stone-700">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Patient:</span>
                  <span className="font-semibold text-stone-900">{formData.name}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Reason:</span>
                  <span className="font-semibold text-stone-900">{formData.condition}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Requested Time:</span>
                  <span className="font-semibold text-emerald-800">{formData.date} at {formData.time}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Clinic:</span>
                  <span className="font-semibold text-stone-900">{clinic.name}</span>
                </div>
                <div className="flex justify-between pt-1 text-emerald-800 font-medium">
                  <span>Initial Exam Rate:</span>
                  <span>{feeDisplay}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                {prefilledExternalUrl ? (
                  <a
                    href={prefilledExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={resetAndClose}
                    className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Proceed to Live Diary with Pre-filled Info</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : null}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={resetAndClose}
                    className="flex-1 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <a
                    href={`tel:${clinic.phoneRaw}`}
                    className="flex-1 py-3 px-4 border border-stone-300 hover:bg-stone-100 text-stone-800 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Call Front Desk</span>
                  </a>
                </div>
              </div>
            </div>
          )}

              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
};
