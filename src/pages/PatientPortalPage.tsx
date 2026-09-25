import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import {
  PatientLead,
  findPatientAppointments,
  getStoredLeads,
  requestPatientReschedule,
  requestPatientCancellation,
} from '../data/leadsStore';
import {
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
  ShieldCheck,
  CreditCard,
  PhoneCall,
  Mail,
  ExternalLink,
  Sparkles,
  Lock,
  LogOut,
  ArrowRight,
  Search,
  Check,
  Shield,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

const PATIENT_SESSION_KEY = 'vance_patient_portal_session_v1';

export default function PatientPortalPage() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Authentication & Session state
  const [refInput, setRefInput] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active Authenticated State
  const [activePatient, setActivePatient] = useState<{ email?: string; name: string } | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<PatientLead[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<PatientLead | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'receipts' | 'reschedule' | 'cancel'>('itinerary');

  // Reschedule Form
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  // Cancellation Form
  const [cancelReason, setCancelReason] = useState('Schedule Conflict');
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Check existing session or URL query params on mount
  useEffect(() => {
    const urlRef = searchParams.get('ref') || searchParams.get('query');
    if (urlRef) {
      handleDirectLookup(urlRef);
      return;
    }

    try {
      const savedSession = sessionStorage.getItem(PATIENT_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed?.id) {
          handleDirectLookup(parsed.id);
        }
      }
    } catch {
      // Ignore
    }
  }, [searchParams]);

  const handleDirectLookup = (query: string, phoneCheck?: string) => {
    setLoginError('');
    const cleanId = query.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!cleanId) {
      setLoginError('Please enter your unique Booking Reference Key.');
      return;
    }

    const matches = findPatientAppointments(cleanId);
    if (matches.length > 0) {
      const primary = matches[0];

      // If phone check provided, verify last 4 digits
      if (phoneCheck && phoneCheck.trim().length === 4) {
        const leadDigits = (primary.phone || '').replace(/\D/g, '');
        const last4 = leadDigits.slice(-4);
        if (last4 && last4 !== phoneCheck.trim()) {
          setLoginError('The last 4 digits of the phone number do not match this booking record.');
          return;
        }
      }

      setActivePatient({ name: primary.name, email: primary.email });
      setPatientAppointments(matches);
      setSelectedAppt(primary);
      try {
        sessionStorage.setItem(
          PATIENT_SESSION_KEY,
          JSON.stringify({ id: primary.id, name: primary.name, email: primary.email })
        );
      } catch {
        // Ignore
      }
    } else {
      setLoginError(`Invalid Reference Key "${query}". Access requires an exact booking passkey (e.g. VH-9428-K82X).`);
    }
  };

  const handleSecureLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!refInput.trim()) {
      setLoginError('Please enter your unique Booking Reference Key.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handleDirectLookup(refInput, phoneLast4);
    }, 400);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(PATIENT_SESSION_KEY);
    setActivePatient(null);
    setSelectedAppt(null);
    setPatientAppointments([]);
    setRefInput('');
    setPhoneLast4('');
    setLoginError('');
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
        setActiveTab('itinerary');
      }, 2000);
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
        setActiveTab('itinerary');
      }, 2000);
    }
  };

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

  const fullAddress = [clinic.address, clinic.cityState || clinic.city, clinic.zip]
    .filter(Boolean)
    .join(', ');
  const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    fullAddress
  )}`;

  return (
    <div className="min-h-screen bg-stone-100/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* TOP BREADCRUMB & BRAND BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <Link to="/" className="hover:text-stone-900 transition">Home</Link>
              <span>/</span>
              <span className="text-emerald-800">Patient Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mt-1">
              Patient Self-Service Hub
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Secure patient access for {clinic.name}. View appointments, download receipts, and manage your care.
            </p>
          </div>

          {activePatient && (
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs self-start sm:self-auto">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                {activePatient.name.charAt(0)}
              </div>
              <div className="text-left">
                <span className="font-bold text-xs text-stone-900 block">{activePatient.name}</span>
                <span className="text-[10px] text-emerald-800 font-mono">Patient Verified ✓</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ----------------- STATE 1: PATIENT LOGIN CARD (If Not Signed In) ----------------- */}
        {!activePatient && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Login Form */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold mb-3">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Encrypted Patient Security Passkey</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-950">
                  Patient Portal Access
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  To protect your medical privacy, access requires the unique, non-predictable Booking Reference Key provided when scheduling your visit.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSecureLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Booking Reference Key *
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. VH-9428-K82X"
                      value={refInput}
                      onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 font-mono tracking-wider focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Found on your appointment confirmation screen and email receipt.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center justify-between">
                    <span>2FA Phone Verification (Last 4 Digits)</span>
                    <span className="text-[10px] text-stone-400 font-normal">Optional Extra Security</span>
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 0199"
                    value={phoneLast4}
                    onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 font-mono tracking-widest focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>{isLoading ? 'Verifying Key...' : 'Unlock Patient Record →'}</span>
                </button>
              </form>

              {/* Instant Test Accounts */}
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                  Quick Demo Passkeys (Click to Test):
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRefInput('VH-9428-K82X');
                      handleDirectLookup('VH-9428-K82X');
                    }}
                    className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 text-xs font-semibold transition cursor-pointer border border-stone-200 text-left"
                  >
                    🔑 <strong>VH-9428-K82X</strong> — John Doe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRefInput('VH-4402-Z33W');
                      handleDirectLookup('VH-4402-Z33W');
                    }}
                    className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 text-xs font-semibold transition cursor-pointer border border-stone-200 text-left"
                  >
                    🔑 <strong>VH-4402-Z33W</strong> — Emily Watson
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Portal Capabilities Guide */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif font-bold text-base text-white">What You Can Do Here</h3>
                </div>

                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Official Medical Receipts</strong>
                      <span>Download itemized invoices with VAT exemption codes for Bupa, AXA, HSA/FSA claims.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Reschedule & Modify Dates</strong>
                      <span>Pick a new time slot anytime up to 24 hours before your session.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">1-Click Calendar Sync</strong>
                      <span>Export `.ics` files directly into Apple Calendar, Google Calendar, or Outlook.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Need Assistance from Front Desk?</span>
                </div>
                <p className="text-stone-700 leading-relaxed text-[11px]">
                  If you need emergency triage or have questions regarding private insurance pre-authorization, our reception team is available:
                </p>
                <div className="pt-1">
                  <a
                    href={`tel:${clinic.phoneRaw || clinic.phone}`}
                    className="font-bold text-emerald-900 hover:underline flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Call {clinic.phone}</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- STATE 2: AUTHENTICATED DASHBOARD (Once Signed In) ----------------- */}
        {activePatient && selectedAppt && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Multi-appointment selector if patient has multiple bookings */}
            {patientAppointments.length > 1 && (
              <div className="p-4 bg-white border border-stone-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <span className="text-xs font-bold text-stone-700">
                  Select Appointment File ({patientAppointments.length} Found):
                </span>
                <div className="flex flex-wrap gap-2">
                  {patientAppointments.map((appt) => (
                    <button
                      key={appt.id}
                      type="button"
                      onClick={() => {
                        setSelectedAppt(appt);
                        setActiveTab('itinerary');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedAppt.id === appt.id
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {appt.date || 'TBD'} — {appt.serviceTitle || appt.condition || 'Consult'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard Main Container */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              
              {/* Tab Header Navigation */}
              <div className="p-4 sm:p-5 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-lg text-white">
                      {selectedAppt.serviceTitle || selectedAppt.condition || 'Chiropractic Consultation'}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                    Patient: <strong className="text-white">{selectedAppt.name}</strong> • Ref: <span className="font-mono text-emerald-400">#{selectedAppt.id}</span>
                  </p>
                </div>

                {/* Tab Pill Buttons */}
                <div className="flex items-center gap-1.5 bg-stone-800 p-1.5 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('itinerary')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'itinerary'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Itinerary
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('receipts')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'receipts'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Medical Receipt
                  </button>
                  {selectedAppt.status !== 'cancelled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab('reschedule')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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

              {/* TAB 1: ITINERARY & VISIT PREPARATION */}
              {activeTab === 'itinerary' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Appointment Details */}
                    <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                        Scheduled Time & Clinician
                      </span>

                      <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-3 text-stone-800">
                          <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
                          <div>
                            <span className="text-[11px] text-stone-500 block">Date</span>
                            <span className="font-bold text-stone-900">{selectedAppt.date || 'TBD'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-stone-800">
                          <Clock className="w-5 h-5 text-emerald-700 shrink-0" />
                          <div>
                            <span className="text-[11px] text-stone-500 block">Arrival Time</span>
                            <span className="font-bold text-stone-900">
                              {selectedAppt.time || 'Pending Review'} ({selectedAppt.durationMinutes || 45} mins)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-stone-800">
                          <User className="w-5 h-5 text-emerald-700 shrink-0" />
                          <div>
                            <span className="text-[11px] text-stone-500 block">Assigned Doctor</span>
                            <span className="font-bold text-stone-900">
                              {selectedAppt.practitionerName || clinic.leadPractitionerName || 'Chiropractor'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Clinic Address & Navigation */}
                    <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                          Clinic Location & Access
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm mt-1">{clinic.name}</h4>
                        <p className="text-xs text-stone-600 mt-0.5">{fullAddress}</p>
                        <p className="text-[11px] text-stone-500 mt-2">
                          {clinic.parkingNote || 'Free designated patient parking on site.'}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-2">
                        <a
                          href={mapDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google Maps Directions</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                        <button
                          type="button"
                          onClick={handleDownloadCalendarFile}
                          className="px-3 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>.ICS</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Insurance Protection Banner */}
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block text-xs sm:text-sm">
                          {selectedAppt.paymentStatus === 'deposit_paid'
                            ? `Deposit Paid: ${selectedAppt.paymentAmount || '£25.00'}`
                            : selectedAppt.paymentStatus === 'paid_full'
                            ? `Paid in Full: ${selectedAppt.paymentAmount}`
                            : selectedAppt.paymentStatus === 'card_hold'
                            ? 'Card-Hold Active (No-Show Protection)'
                            : 'Pay at Clinic Arrival'}
                        </span>
                        <span className="text-[11px] text-stone-600">
                          {selectedAppt.cardLast4
                            ? `Card ending in •••• ${selectedAppt.cardLast4} (${selectedAppt.cardBrand || 'Card'})`
                            : 'Itemized claim receipt generated automatically for insurance reimbursement'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('receipts')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-950 font-bold text-xs cursor-pointer shrink-0"
                    >
                      View Invoice Receipt →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PRINTABLE MEDICAL RECEIPT */}
              {activeTab === 'receipts' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-950">
                        Official Medical Receipt & Claim Invoice
                      </h3>
                      <p className="text-xs text-stone-500">
                        Zero-rated medical healthcare services for UK / US insurance claims.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>Print / PDF</span>
                    </button>
                  </div>

                  <div
                    ref={receiptRef}
                    className="p-6 sm:p-8 bg-white border border-stone-300 rounded-3xl shadow-xs space-y-6 text-stone-900"
                  >
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b border-stone-200 pb-5">
                      <div>
                        <h4 className="font-serif font-extrabold text-lg tracking-tight text-stone-950">
                          {clinic.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-1">{fullAddress}</p>
                        <p className="text-xs text-stone-500">Tel: {clinic.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                          Claim Receipt / Invoice
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          INV-{selectedAppt.id.slice(0, 8).toUpperCase()}
                        </span>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Date: {new Date(selectedAppt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Patient / Provider Info */}
                    <div className="grid grid-cols-2 gap-6 text-xs sm:text-sm">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                          Billed To (Patient):
                        </span>
                        <p className="font-bold text-stone-900">{selectedAppt.name}</p>
                        <p className="text-stone-600 text-xs">{selectedAppt.email}</p>
                        <p className="text-stone-600 text-xs">{selectedAppt.phone}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                          Treating Clinician:
                        </span>
                        <p className="font-bold text-stone-900">
                          {selectedAppt.practitionerName || clinic.leadPractitionerName || 'Chiropractor'}
                        </p>
                        <p className="text-stone-600 text-xs">
                          Condition Focus: {selectedAppt.condition || 'Spinal Assessment'}
                        </p>
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <table className="w-full text-left text-xs sm:text-sm border-t border-b border-stone-200">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50/60 text-[10px] uppercase font-bold text-stone-500">
                          <th className="py-2.5 px-2">Clinical Service Description</th>
                          <th className="py-2.5 px-2 text-center">Duration</th>
                          <th className="py-2.5 px-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        <tr>
                          <td className="py-3 px-2 font-medium">
                            {selectedAppt.serviceTitle || 'Initial Chiropractic Consultation & Spinal Exam'}
                          </td>
                          <td className="py-3 px-2 text-center text-stone-500">
                            {selectedAppt.durationMinutes || 45} mins
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-stone-900">
                            {selectedAppt.paymentAmount || '£49.00'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Certification Footer */}
                    <div className="flex justify-between items-end pt-2 text-xs">
                      <div className="space-y-0.5 text-[11px] text-stone-500">
                        <p>VAT Status: Zero-rated primary healthcare services.</p>
                        <p>Valid for reimbursement under private health insurance & cash plans.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-500 block">Total Settlement:</span>
                        <span className="font-serif font-black text-xl text-emerald-800">
                          {selectedAppt.paymentAmount || '£49.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RESCHEDULE */}
              {activeTab === 'reschedule' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <form onSubmit={handleResubmitReschedule} className="space-y-5">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-950">
                        Request a Reschedule
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Choose your new preferred date and time. Our reception will automatically verify clinician availability and send an updated confirmation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                          New Date:
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                          Preferred Time Window:
                        </label>
                        <select
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:bg-white"
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
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                        Reason for Front Desk (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Work travel conflict, need later time..."
                        value={rescheduleNote}
                        onChange={(e) => setRescheduleNote(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:bg-white"
                      />
                    </div>

                    {rescheduleSuccess ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>Reschedule submitted! Updating your itinerary...</span>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('itinerary')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Confirm Reschedule Request
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* TAB 4: CANCEL */}
              {activeTab === 'cancel' && (
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                    <h3 className="font-serif font-bold text-rose-950 text-base flex items-center gap-2">
                      <Ban className="w-4 h-4 text-rose-700" />
                      <span>Cancel Appointment</span>
                    </h3>
                    <p className="text-xs text-rose-900 leading-relaxed">
                      We understand plans change. Notice given at least 24 hours in advance incurs zero penalties or cancellation fees.
                    </p>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-rose-950 block mb-1">
                        Reason for Cancellation:
                      </label>
                      <select
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs font-semibold"
                      >
                        <option value="Schedule Conflict">Schedule / Work Conflict</option>
                        <option value="Symptoms Resolved">Symptoms Have Resolved</option>
                        <option value="Travel / Away">Away / Out of Town</option>
                        <option value="Financial / Insurance">Financial or Insurance Reason</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {cancelSuccess ? (
                    <div className="p-4 bg-rose-100 border border-rose-300 rounded-2xl text-rose-950 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-rose-700 shrink-0" />
                      <span>Your appointment has been cancelled.</span>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('itinerary')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                      >
                        Keep My Booking
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmCancellation}
                        className="px-6 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirm Cancellation
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
