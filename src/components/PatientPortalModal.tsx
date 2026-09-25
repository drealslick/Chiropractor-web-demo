import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../data/ClinicContext';
import {
  PatientLead,
  findPatientAppointments,
  findPatientAppointmentsByEmail,
  requestPatientReschedule,
  requestPatientCancellation,
  getStoredLeads,
} from '../data/leadsStore';
import { IntakeQuestionnaireModal } from './IntakeQuestionnaireModal';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Download,
  RotateCcw,
  Ban,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  Mail,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface PatientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const PatientPortalModal: React.FC<PatientPortalModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<PatientLead[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<PatientLead | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reschedule' | 'cancel' | 'receipt'>('details');

  // Reschedule state
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  // Cancellation state
  const [cancelReason, setCancelReason] = useState('Schedule Conflict');
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  const printableReceiptRef = useRef<HTMLDivElement>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setSearchQuery(initialQuery);
        handlePerformSearch(initialQuery);
      } else {
        // Look up default latest appointment if any in storage
        const leads = getStoredLeads();
        if (leads.length > 0 && !hasSearched) {
          // Keep search box ready
        }
      }
    } else {
      setSelectedAppt(null);
      setActiveTab('details');
      setRescheduleSuccess(false);
      setCancelSuccess(false);
      setHasSearched(false);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handlePerformSearch = (query: string) => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }

    let matches = findPatientAppointments(q);
    if (matches.length === 0 && q.includes('@')) {
      matches = findPatientAppointmentsByEmail(q);
    }
    setSearchResults(matches);
    setHasSearched(true);

    if (matches.length === 1) {
      setSelectedAppt(matches[0]);
      setActiveTab('details');
    } else if (matches.length === 0) {
      setSelectedAppt(null);
    }
  };

  const handleResubmitReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !newDate) return;

    const res = requestPatientReschedule(selectedAppt.id, newDate, newTime, rescheduleNote);
    if (res.success && res.updatedLead) {
      setSelectedAppt(res.updatedLead);
      setRescheduleSuccess(true);
      setTimeout(() => {
        setRescheduleSuccess(false);
        setActiveTab('details');
      }, 2500);
    }
  };

  const handleConfirmCancellation = () => {
    if (!selectedAppt) return;
    const res = requestPatientCancellation(selectedAppt.id, cancelReason);
    if (res.success && res.updatedLead) {
      setSelectedAppt(res.updatedLead);
      setCancelSuccess(true);
      setTimeout(() => {
        setCancelSuccess(false);
        setActiveTab('details');
      }, 2500);
    }
  };

  // Generate .ics Calendar File
  const handleDownloadCalendarFile = () => {
    if (!selectedAppt || !selectedAppt.date) return;
    const title = `Chiropractic Appointment - ${clinic.name}`;
    const desc = `${selectedAppt.serviceTitle || selectedAppt.condition || 'Consultation'} with ${selectedAppt.practitionerName || clinic.leadPractitionerName || 'Chiropractor'}`;
    const location = `${clinic.address}, ${clinic.cityState || clinic.city || ''}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vance Health//Patient Portal//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${location}`,
      `DTSTART:${selectedAppt.date.replace(/-/g, '')}T090000Z`,
      `DTEND:${selectedAppt.date.replace(/-/g, '')}T100000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-${selectedAppt.id.slice(0, 8)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const fullAddress = [clinic.address, clinic.cityState || clinic.city, clinic.zip]
    .filter(Boolean)
    .join(', ');
  const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    fullAddress
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-auto relative max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-emerald-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">Patient Self-Service Portal</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Secure Access
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Lookup, reschedule, download insurance receipts, or view appointment details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close patient portal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search / Lookup Bar (Always visible or toggleable) */}
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePerformSearch(searchQuery);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="Enter Booking Reference Passkey (e.g. VH-9428-K82X)..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-mono tracking-wide text-stone-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shadow-2xs shrink-0"
            >
              Verify Key
            </button>
          </form>

          {/* Quick Demo Pill Helper */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
            <span>Quick test keys:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('VH-9428-K82X');
                handlePerformSearch('VH-9428-K82X');
              }}
              className="px-2 py-0.5 rounded-md bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-mono text-[10px] cursor-pointer"
            >
              VH-9428-K82X (John Doe)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('VH-4402-Z33W');
                handlePerformSearch('VH-4402-Z33W');
              }}
              className="px-2 py-0.5 rounded-md bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-mono text-[10px] cursor-pointer"
            >
              VH-4402-Z33W (Emily Watson)
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* SEARCH RESULTS LIST (If multiple matches) */}
          {hasSearched && !selectedAppt && searchResults.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Found {searchResults.length} Matching Appointments:
              </h4>
              <div className="space-y-2">
                {searchResults.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => {
                      setSelectedAppt(appt);
                      setActiveTab('details');
                    }}
                    className="p-3.5 bg-white border border-stone-200 hover:border-emerald-600 rounded-2xl cursor-pointer transition shadow-2xs hover:shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{appt.name}</span>
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-mono">
                          #{appt.id.slice(0, 14)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {appt.serviceTitle || appt.condition || 'Consultation'} • {appt.date || 'TBD'}{' '}
                        {appt.time ? `at ${appt.time}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NO RESULTS FOUND */}
          {hasSearched && !selectedAppt && searchResults.length === 0 && (
            <div className="p-8 text-center bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-base">No Matching Booking Found</h4>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                We couldn't find an appointment matching <span className="font-semibold text-stone-900">"{searchQuery}"</span>. Please verify your reference code or phone number.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openBookingModal('General Consultation');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs"
                >
                  Book New Appointment
                </button>
              </div>
            </div>
          )}

          {/* INITIAL STATE BEFORE SEARCH */}
          {!hasSearched && !selectedAppt && (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-base">
                  Lookup Your Appointment & Documents
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  Type your booking reference ID, contact email, or phone number above to access your visit itinerary, reschedule, or print medical receipts.
                </p>
              </div>
            </div>
          )}

          {/* ACTIVE APPOINTMENT VIEW */}
          {selectedAppt && (
            <div className="space-y-5">
              {/* Back to Results if multiple */}
              {searchResults.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to all matching bookings ({searchResults.length})</span>
                </button>
              )}

              {/* Status Header Banner */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{selectedAppt.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedAppt.status === 'confirmed' || selectedAppt.status === 'booked'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : selectedAppt.status === 'cancelled'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {selectedAppt.status === 'cancelled'
                        ? 'Cancelled'
                        : selectedAppt.status === 'confirmed' || selectedAppt.status === 'booked'
                        ? 'Confirmed'
                        : 'Awaiting Reception Review'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Booking Reference: <span className="font-mono text-emerald-400">#{selectedAppt.id}</span>
                  </p>
                </div>

                {/* Sub-nav Tabs */}
                <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'details'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Itinerary
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('receipt')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'receipt'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Receipt
                  </button>
                  {selectedAppt.status !== 'cancelled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab('reschedule')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          activeTab === 'reschedule'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('cancel')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          activeTab === 'cancel'
                            ? 'bg-rose-900 text-white shadow-2xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* TAB 1: DETAILS & ITINERARY */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Time & Practitioner */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Appointment Details
                      </span>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-stone-800">
                          <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="font-bold text-stone-900">
                            {selectedAppt.date || 'To Be Confirmed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-800">
                          <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            {selectedAppt.time || 'Pending'}{' '}
                            <span className="text-stone-400">
                              ({selectedAppt.durationMinutes || 45} mins)
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-800">
                          <User className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            Clinician:{' '}
                            <strong className="text-stone-900">
                              {selectedAppt.practitionerName || clinic.leadPractitionerName || 'Chiropractor'}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-800">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            Care Focus:{' '}
                            <strong className="text-stone-900">
                              {selectedAppt.serviceTitle || selectedAppt.condition || 'Consultation'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clinic Address & Navigation */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Clinic Location & Access
                        </span>
                        <p className="text-xs text-stone-800 font-medium mt-1">
                          {clinic.name}
                        </p>
                        <p className="text-xs text-stone-600 mt-0.5">{fullAddress}</p>
                        <p className="text-[11px] text-stone-500 mt-1">
                          {clinic.parkingNote || 'Free designated patient parking on site.'}
                        </p>
                      </div>

                      <a
                        href={mapDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Open Directions in Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                    </div>
                  </div>

                  {/* Digital Pre-Visit Intake Questionnaire Card */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Digital Pre-Visit Intake Questionnaire</h4>
                          {selectedAppt.intakeForm ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                              Completed ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 text-[11px] mt-0.5">
                          {selectedAppt.intakeForm
                            ? `Submitted for ${selectedAppt.intakeForm.painArea} (Pain level: ${selectedAppt.intakeForm.painLevel}/10)`
                            : 'Please complete your pain history & medical intake before arrival.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowIntakeModal(true)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0"
                    >
                      {selectedAppt.intakeForm ? 'View / Edit Intake' : 'Complete Intake →'}
                    </button>
                  </div>

                  {/* Payment & Insurance Protection Card */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block">
                          Payment Status:{' '}
                          {selectedAppt.paymentStatus === 'deposit_paid'
                            ? `Deposit Paid (${selectedAppt.paymentAmount || '£25.00'})`
                            : selectedAppt.paymentStatus === 'paid_full'
                            ? `Paid in Full (${selectedAppt.paymentAmount})`
                            : selectedAppt.paymentStatus === 'card_hold'
                            ? 'Card-Hold Authorized (No Upfront Charge)'
                            : 'Pay at Clinic'}
                        </span>
                        <span className="text-[11px] text-stone-600">
                          {selectedAppt.cardLast4
                            ? `Card ending in •••• ${selectedAppt.cardLast4} (${selectedAppt.cardBrand || 'Card'})`
                            : 'Itemized receipt available for private insurance claim'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadCalendarFile}
                      className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Add to Calendar (.ics)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: RESCHEDULE */}
              {activeTab === 'reschedule' && (
                <form onSubmit={handleResubmitReschedule} className="space-y-4">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                    <h5 className="font-serif font-bold text-stone-900 text-sm">
                      Request New Date & Time
                    </h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Select your preferred alternative date and time. Our reception desk will automatically update your file and send an instant SMS confirmation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          New Date:
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Preferred Time Window:
                        </label>
                        <select
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                        >
                          <option value="9:00 AM">9:00 AM (Morning)</option>
                          <option value="10:00 AM">10:00 AM (Morning)</option>
                          <option value="11:30 AM">11:30 AM (Morning)</option>
                          <option value="1:30 PM">1:30 PM (Afternoon)</option>
                          <option value="2:30 PM">2:30 PM (Afternoon)</option>
                          <option value="4:00 PM">4:00 PM (Late Afternoon)</option>
                          <option value="5:15 PM">5:15 PM (Evening)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                        Reason / Note for Front Desk (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Work meeting conflict, prefer afternoon slot..."
                        value={rescheduleNote}
                        onChange={(e) => setRescheduleNote(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {rescheduleSuccess ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Reschedule request submitted successfully! Updating your itinerary...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirm Reschedule
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* TAB 3: CANCEL */}
              {activeTab === 'cancel' && (
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
                    <h5 className="font-serif font-bold text-rose-950 text-sm flex items-center gap-2">
                      <Ban className="w-4 h-4 text-rose-700" />
                      <span>Cancel Appointment</span>
                    </h5>
                    <p className="text-xs text-rose-900 leading-relaxed">
                      Please let us know if you need to cancel. As per clinic policy, cancellations made with at least 24 hours notice incur zero penalties.
                    </p>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                        Reason for Cancellation:
                      </label>
                      <select
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                      >
                        <option value="Schedule Conflict">Schedule / Work Conflict</option>
                        <option value="Symptoms Resolved">Symptoms Have Improved</option>
                        <option value="Travel / Vacation">Away / Travelling</option>
                        <option value="Financial / Insurance">Insurance / Financial Reasons</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {cancelSuccess ? (
                    <div className="p-3.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-900 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-700" />
                      <span>Appointment has been cancelled. Front desk notified.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                      >
                        Nevermind, Keep My Slot
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmCancellation}
                        className="px-5 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirm Cancellation
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRINTABLE ITEMIZED MEDICAL RECEIPT */}
              {activeTab === 'receipt' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">
                      Official Clinic Invoice & Claim Receipt
                    </span>
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Print / Save as PDF</span>
                    </button>
                  </div>

                  {/* Receipt Printable Card */}
                  <div
                    ref={printableReceiptRef}
                    className="p-6 bg-white border border-stone-300 rounded-2xl shadow-xs space-y-5 text-stone-900"
                  >
                    {/* Top Header */}
                    <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                      <div>
                        <h4 className="font-serif font-extrabold text-base tracking-tight text-stone-950">
                          {clinic.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">{fullAddress}</p>
                        <p className="text-[11px] text-stone-500">Tel: {clinic.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                          Medical Receipt / Invoice
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          INV-{selectedAppt.id.slice(0, 8).toUpperCase()}
                        </span>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Date: {new Date(selectedAppt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Patient & Provider Details */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          Billed To (Patient):
                        </span>
                        <p className="font-bold text-stone-900 mt-0.5">{selectedAppt.name}</p>
                        <p className="text-stone-600 text-[11px]">{selectedAppt.email}</p>
                        <p className="text-stone-600 text-[11px]">{selectedAppt.phone}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          Practitioner & Diagnostic:
                        </span>
                        <p className="font-bold text-stone-900 mt-0.5">
                          {selectedAppt.practitionerName || clinic.leadPractitionerName || 'Chiropractor'}
                        </p>
                        <p className="text-stone-600 text-[11px]">
                          Reason: {selectedAppt.condition || 'Spinal Examination'}
                        </p>
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <table className="w-full text-left text-xs border-t border-b border-stone-200">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50/60 text-[10px] uppercase font-bold text-stone-500">
                          <th className="py-2 px-1">Service Description</th>
                          <th className="py-2 px-1 text-center">Duration</th>
                          <th className="py-2 px-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        <tr>
                          <td className="py-2.5 px-1 font-medium">
                            {selectedAppt.serviceTitle || 'Initial Chiropractic Consultation & Spinal Exam'}
                          </td>
                          <td className="py-2.5 px-1 text-center text-stone-500">
                            {selectedAppt.durationMinutes || 45} mins
                          </td>
                          <td className="py-2.5 px-1 text-right font-bold">
                            {selectedAppt.paymentAmount || '£49.00'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Total & Certification Footer */}
                    <div className="flex justify-between items-end pt-1 text-xs">
                      <div className="space-y-0.5 text-[10px] text-stone-500">
                        <p>VAT Status: Zero-rated medical healthcare services.</p>
                        <p>Approved for private healthcare reimbursement (Bupa, AXA, HSA, FSA).</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-500 block">Total Paid:</span>
                        <span className="font-serif font-black text-lg text-emerald-800">
                          {selectedAppt.paymentAmount || '£49.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Need telephone support? Call reception at <strong>{clinic.phone}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold cursor-pointer shadow-2xs"
          >
            Close Portal
          </button>
        </div>
      </div>
      {showIntakeModal && selectedAppt && (
        <IntakeQuestionnaireModal
          isOpen={showIntakeModal}
          onClose={() => setShowIntakeModal(false)}
          lead={selectedAppt}
          onIntakeCompleted={(updated) => {
            setSelectedAppt(updated);
          }}
        />
      )}
    </div>
  );
};
