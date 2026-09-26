import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useClinic } from '../data/ClinicContext';
import {
  PatientLead,
  findPatientAppointments,
  findPatientAppointmentsByEmail,
  registerPatientAccount,
  authenticatePatientAccount,
  getStoredLeads,
  requestPatientReschedule,
  requestPatientCancellation,
  PatientAccount,
} from '../data/leadsStore';
import {
  registerPatientWithFirebaseAuth,
  loginPatientWithFirebaseAuth,
  sendRealPasswordReset,
  fetchAppointmentsByEmailFromFirestore,
  fetchAppointmentByIdFromFirestore,
  logoutPatientFromFirebase,
} from '../services/firebaseSync';
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
  UserPlus,
  KeyRound,
} from 'lucide-react';

const PATIENT_SESSION_KEY = 'vance_patient_portal_session_v2';

export default function PatientPortalPage() {
  const { clinicData: clinic, openBookingModal } = useClinic();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const portalConfig = {
    pageTitle: clinic.portalSettings?.pageTitle || 'Patient Self-Service Hub',
    pageSubtitle: clinic.portalSettings?.pageSubtitle || `Secure patient access for ${clinic.name}. View appointments, download receipts, and manage your care.`,
    welcomeMessage: clinic.portalSettings?.welcomeMessage || 'Sign in with your email account or enter your unique Booking Reference Key to manage your visits.',
    showEmergencyBanner: clinic.portalSettings?.showEmergencyBanner !== false,
    emergencyBannerText: clinic.portalSettings?.emergencyBannerText || 'For sudden loss of bowel/bladder sensation, acute trauma, or progressive limb numbness, please contact emergency medical services immediately.',
    allowSelfReschedule: clinic.portalSettings?.allowSelfReschedule !== false,
    allowSelfCancellation: clinic.portalSettings?.allowSelfCancellation !== false,
    allowReceiptDownload: clinic.portalSettings?.allowReceiptDownload !== false,
    allowExerciseGuides: clinic.portalSettings?.allowExerciseGuides !== false,
    supportPhone: clinic.portalSettings?.supportPhone || clinic.phone || '+44 20 7946 0192',
    supportEmail: clinic.portalSettings?.supportEmail || clinic.email || 'reception@vancehealth.co.uk',
  };

  // Auth Mode: 'account' (Email/Password) vs 'quickRef' (Booking ID)
  const [authMode, setAuthMode] = useState<'account' | 'quickRef'>('account');
  const [accountTab, setAccountTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Account Form Fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Quick Ref Form Fields
  const [refInput, setRefInput] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');

  // State & Loading
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active Authenticated Patient State
  const [activePatient, setActivePatient] = useState<{ email?: string; name: string; isAccount?: boolean } | null>(null);
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

  // Exercises state tracking
  const [exerciseStatus, setExerciseStatus] = useState<Record<string, boolean>>({});
  const [exerciseStreak, setExerciseStreak] = useState<number>(3); // start at a motivated 3-day streak!

  const handleToggleExercise = (exerciseId: string) => {
    setExerciseStatus(prev => {
      const next = { ...prev, [exerciseId]: !prev[exerciseId] };
      const currentCondition = selectedAppt?.condition || 'Back pain';
      const exercisesList = getExercisesForCondition(currentCondition);
      const allDone = exercisesList.every(ex => next[ex.id]);
      if (allDone) {
        setExerciseStreak(s => s + 1);
      }
      return next;
    });
  };

  const getExercisesForCondition = (cond: string) => {
    const lower = (cond || '').toLowerCase();
    if (lower.includes('neck') || lower.includes('headache') || lower.includes('cervical') || lower.includes('posture')) {
      return [
        { id: 'ex-1', title: 'Cervical Chin Tucks', instructions: 'Sit upright, slide your chin straight back as if making a double chin. Hold 5s. Repeat 10 times.', frequency: '3x daily', benefit: 'Strengthens deep neck flexors & corrects head alignment' },
        { id: 'ex-2', title: 'Suboccipital Soft Tissue Release', instructions: 'Place a firm foam ball under the base of your skull while lying flat. Gently tilt your chin up and down for 5 mins.', frequency: 'Nightly', benefit: 'Releases chronic upper neck nerve tension' },
        { id: 'ex-3', title: 'Scapular Squeezes', instructions: 'Pull shoulders down and back, squeezing your shoulder blades together. Hold 3s. Repeat 15 times.', frequency: '2x daily', benefit: 'Stabilizes thoracic spine & supports posture' }
      ];
    }
    if (lower.includes('back') || lower.includes('lumbar') || lower.includes('disc') || lower.includes('sciatica')) {
      return [
        { id: 'ex-1', title: 'Prone McKenzie Press-Ups', instructions: 'Lie flat on your stomach, push up with your hands keeping your hips down. Hold 2s, slowly lower down. Repeat 10 times.', frequency: '3x daily', benefit: 'Centers disc material & relieves sciatic pressure' },
        { id: 'ex-2', title: 'Pelvic Tilts & Core Activation', instructions: 'Lie on your back, knees bent. Flatten your lower back into the floor by contracting your abs. Hold 5s. Repeat 15 times.', frequency: 'Daily', benefit: 'Stabilizes hyper-mobile lower spinal segments' },
        { id: 'ex-3', title: 'Decompression Bench Hang', instructions: 'Hold a stable bar or table edge, bend knees slightly, letting your hips hang down to traction the lower spine. Hold 45s.', frequency: 'Twice daily', benefit: 'Gently tractions & rehydrates compressed discs' }
      ];
    }
    // General Spine Care
    return [
      { id: 'ex-1', title: 'Cat-Cow Spinal Mobilization', instructions: 'On all fours, slowly arch your spine upward like a cat, then drop your belly toward the floor looking up. Perform 15 slow reps.', frequency: 'Daily', benefit: 'Improves segment-by-segment spinal column mobility' },
      { id: 'ex-2', title: 'Thoracic Windmills', instructions: 'Lie on your side, knees tucked 90 degrees. Sweep your top arm open to the opposite side, rotating your upper chest. Repeat 10 times each side.', frequency: 'Daily', benefit: 'Restores chest expansion & thoracic rib movement' },
      { id: 'ex-3', title: 'Deep Diaphragmatic Breathing', instructions: 'Inhale into your lower ribs for 4s, hold 2s, exhale 6s. Focus on expanding the ribcage outwards. Perform for 5 minutes.', frequency: 'Twice daily', benefit: 'Regulates autonomous nervous system and calms musculature' }
    ];
  };

  const getTreatmentPlanForCondition = (cond: string) => {
    const lower = (cond || '').toLowerCase();
    if (lower.includes('neck') || lower.includes('headache') || lower.includes('cervical') || lower.includes('posture')) {
      return {
        phase: 'Phase 2: Corrective Spine Care & Structural Stabilization',
        milestone: 'Suboccipital nerve pathways are 70% calm. Next up: Scapular tracking evaluation in 2 visits.',
        progress: 70,
        frequency: '1 visit every 2 weeks',
        doctorNote: 'Maintain chin-tuck exercises at your desk. Avoid looking down at your mobile screen; lift the screen to eye level.'
      };
    }
    if (lower.includes('back') || lower.includes('lumbar') || lower.includes('disc') || lower.includes('sciatica')) {
      return {
        phase: 'Phase 1: Acute Decompression & Pain Management',
        milestone: 'Sciatic pain has centralized. Focus is on rehydrating the L4/L5 disc spaces. Re-evaluation in 3 visits.',
        progress: 45,
        frequency: '2 visits per week for 2 more weeks',
        doctorNote: 'Strictly avoid heavy forward-bending or single-sided loaded carries. Continue McKenzie extension press-ups.'
      };
    }
    return {
      phase: 'Phase 3: Prevention, Maintenance & Spinal Resilience',
      milestone: 'All major mechanical alignment blocks have resolved. Focus is on maintaining segment health and postural posture.',
      progress: 90,
      frequency: '1 wellness visit per month',
      doctorNote: 'Maintain good core stability exercises. Schedule your monthly check-in whenever your mobility feels restricted.'
    };
  };

  // Check existing session or URL query params on mount
  useEffect(() => {
    const urlRef = searchParams.get('ref') || searchParams.get('query');
    if (urlRef) {
      setAuthMode('quickRef');
      handleDirectRefLookup(urlRef);
      return;
    }

    try {
      const savedSession = sessionStorage.getItem(PATIENT_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed?.email) {
          const appts = findPatientAppointmentsByEmail(parsed.email);
          setActivePatient({ name: parsed.name || 'Patient', email: parsed.email, isAccount: true });
          setPatientAppointments(appts);
          if (appts.length > 0) setSelectedAppt(appts[0]);
        } else if (parsed?.id) {
          handleDirectRefLookup(parsed.id);
        }
      }
    } catch {
      // Ignore
    }
  }, [searchParams]);

  const handleDirectRefLookup = async (query: string, phoneCheck?: string) => {
    setLoginError('');
    const cleanId = query.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!cleanId) {
      setLoginError('Please enter your unique Booking Reference Key.');
      return;
    }

    let matches = findPatientAppointments(cleanId);
    if (matches.length === 0) {
      // Query Cloud Firestore directly
      const firestoreAppt = await fetchAppointmentByIdFromFirestore(cleanId);
      if (firestoreAppt) {
        matches = [firestoreAppt];
      }
    }

    if (matches.length > 0) {
      const primary = matches[0];

      if (phoneCheck && phoneCheck.trim().length === 4) {
        const leadDigits = (primary.phone || '').replace(/\D/g, '');
        const last4 = leadDigits.slice(-4);
        if (last4 && last4 !== phoneCheck.trim()) {
          setLoginError('The last 4 digits of the phone number do not match this booking record.');
          return;
        }
      }

      setActivePatient({ name: primary.name, email: primary.email, isAccount: false });
      setPatientAppointments(matches);
      setSelectedAppt(primary);
      try {
        sessionStorage.setItem(
          PATIENT_SESSION_KEY,
          JSON.stringify({ id: primary.id, name: primary.name, email: primary.email, isAccount: false })
        );
      } catch {
        // Ignore
      }
    } else {
      setLoginError(`Invalid Reference Key "${query}". Access requires an exact booking passkey (e.g. VH-9428-K82X).`);
    }
  };

  const handleQuickRefLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!refInput.trim()) {
      setLoginError('Please enter your unique Booking Reference Key.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handleDirectRefLookup(refInput, phoneLast4);
    }, 400);
  };

  const handleAccountAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessMessage('');

    if (accountTab === 'forgot') {
      if (!emailInput.trim()) {
        setLoginError('Please enter your registered email address.');
        return;
      }

      setIsLoading(true);
      try {
        const resetRes = await sendRealPasswordReset(emailInput.trim());
        setIsLoading(false);
        if (resetRes.success) {
          setLoginSuccessMessage(resetRes.message);
          setAccountTab('login');
        } else {
          setLoginError(resetRes.message);
        }
      } catch (err: any) {
        setIsLoading(false);
        setLoginError(err.message || 'Failed to dispatch password recovery link.');
      }
      return;
    }

    if (accountTab === 'register') {
      if (!nameInput.trim() || !emailInput.trim() || !passwordInput.trim()) {
        setLoginError('Please complete your name, email, and password.');
        return;
      }

      setIsLoading(true);
      try {
        // 1. Register with Firebase Auth & Cloud Firestore
        const firebaseRes = await registerPatientWithFirebaseAuth(nameInput, emailInput, passwordInput, phoneInput);
        
        // Also register in local registry as cache fallback
        registerPatientAccount(nameInput, emailInput, passwordInput, phoneInput);

        setIsLoading(false);
        if (firebaseRes.success && firebaseRes.account) {
          // Fetch appointments from Cloud Firestore first, fallback to local store
          let appts = await fetchAppointmentsByEmailFromFirestore(firebaseRes.account.email);
          if (appts.length === 0) {
            appts = findPatientAppointmentsByEmail(firebaseRes.account.email);
          }

          setActivePatient({ name: firebaseRes.account.name, email: firebaseRes.account.email, isAccount: true });
          setPatientAppointments(appts);
          if (appts.length > 0) setSelectedAppt(appts[0]);

          try {
            sessionStorage.setItem(
              PATIENT_SESSION_KEY,
              JSON.stringify({ id: firebaseRes.account.id, name: firebaseRes.account.name, email: firebaseRes.account.email, isAccount: true })
            );
          } catch {
            // Ignore
          }
        } else {
          setLoginError(firebaseRes.message);
        }
      } catch (err: any) {
        setIsLoading(false);
        setLoginError(err.message || 'Account registration failed.');
      }
    } else {
      // Login
      if (!emailInput.trim() || !passwordInput.trim()) {
        setLoginError('Please provide your account email and password.');
        return;
      }

      setIsLoading(true);
      try {
        // Try Firebase Auth first
        const authRes = await loginPatientWithFirebaseAuth(emailInput, passwordInput);
        
        setIsLoading(false);
        if (authRes.success && authRes.account) {
          // Fetch live appointments from Cloud Firestore
          let appts = await fetchAppointmentsByEmailFromFirestore(authRes.account.email);
          if (appts.length === 0) {
            appts = findPatientAppointmentsByEmail(authRes.account.email);
          }

          setActivePatient({ name: authRes.account.name, email: authRes.account.email, isAccount: true });
          setPatientAppointments(appts);
          if (appts.length > 0) setSelectedAppt(appts[0]);

          try {
            sessionStorage.setItem(
              PATIENT_SESSION_KEY,
              JSON.stringify({ id: authRes.account.id, name: authRes.account.name, email: authRes.account.email, isAccount: true })
            );
          } catch {
            // Ignore
          }
        } else {
          // Fallback check against local seed accounts
          const localRes = authenticatePatientAccount(emailInput, passwordInput);
          if (localRes.success && localRes.account) {
            const appts = findPatientAppointmentsByEmail(localRes.account.email);
            setActivePatient({ name: localRes.account.name, email: localRes.account.email, isAccount: true });
            setPatientAppointments(appts);
            if (appts.length > 0) setSelectedAppt(appts[0]);

            try {
              sessionStorage.setItem(
                PATIENT_SESSION_KEY,
                JSON.stringify({ id: localRes.account.id, name: localRes.account.name, email: localRes.account.email, isAccount: true })
              );
            } catch {
              // Ignore
            }
          } else {
            setLoginError(authRes.message || localRes.message);
          }
        }
      } catch (err: any) {
        setIsLoading(false);
        setLoginError(err.message || 'Authentication error.');
      }
    }
  };

  const handleLogout = () => {
    logoutPatientFromFirebase();
    sessionStorage.removeItem(PATIENT_SESSION_KEY);
    setActivePatient(null);
    setSelectedAppt(null);
    setPatientAppointments([]);
    setRefInput('');
    setPhoneLast4('');
    setEmailInput('');
    setPasswordInput('');
    setNameInput('');
    setPhoneInput('');
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
              {portalConfig.pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              {portalConfig.pageSubtitle}
            </p>
          </div>

          {activePatient && (
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs self-start sm:self-auto">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                {activePatient.name.charAt(0)}
              </div>
              <div className="text-left">
                <span className="font-bold text-xs text-stone-900 block">{activePatient.name}</span>
                <span className="text-[10px] text-emerald-800 font-mono">
                  {activePatient.isAccount ? 'Account Active ✓' : 'Patient Verified ✓'}
                </span>
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

        {/* Dynamic Emergency Red-Flag Banner */}
        {portalConfig.showEmergencyBanner && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold block mb-0.5 text-amber-950">Clinical Red-Flag Advisory:</strong>
              <span>{portalConfig.emergencyBannerText}</span>
            </div>
          </div>
        )}

        {/* ----------------- STATE 1: PATIENT LOGIN CARD (If Not Signed In) ----------------- */}
        {!activePatient && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Login / Account Card */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6">
              
              {/* Access Method Tabs */}
              <div className="flex bg-stone-100 p-1 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('account');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'account'
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Patient Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('quickRef');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'quickRef'
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Quick Booking ID</span>
                </button>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccessMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{loginSuccessMessage}</span>
                </div>
              )}

              {/* TAB 1: PATIENT ACCOUNT (EMAIL & PASSWORD) */}
              {authMode === 'account' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-950">
                        {accountTab === 'login' 
                          ? 'Patient Sign In' 
                          : accountTab === 'forgot'
                          ? 'Forgot Password'
                          : 'Create Patient Account'}
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {accountTab === 'login'
                          ? 'Access all your visits, receipts & recovery plan without booking IDs.'
                          : accountTab === 'forgot'
                          ? 'Enter your registered email address to request a secure password recovery link.'
                          : 'Set up your credentials to automatically link all current and future bookings.'}
                      </p>
                    </div>
                    <div className="flex gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountTab(accountTab === 'login' ? 'register' : 'login');
                          setLoginError('');
                          setLoginSuccessMessage('');
                        }}
                        className="text-emerald-800 hover:text-emerald-950 font-bold underline underline-offset-2 cursor-pointer text-right min-w-[90px]"
                      >
                        {accountTab === 'login' ? 'Create Account' : 'Back to Login'}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleAccountAuth} className="space-y-3.5">
                    {accountTab === 'register' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. (303) 555-0199"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. patient@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    {accountTab !== 'forgot' && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                            Password *
                          </label>
                          {accountTab === 'login' && (
                            <button
                              type="button"
                              onClick={() => {
                                setAccountTab('forgot');
                                setLoginError('');
                                setLoginSuccessMessage('');
                              }}
                              className="text-[11px] text-stone-500 hover:text-emerald-800 underline font-medium cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          )}
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                      {accountTab === 'register' ? (
                        <>
                          <UserPlus className="w-4 h-4 text-emerald-400" />
                          <span>{isLoading ? 'Creating Account...' : 'Register & Enter Portal →'}</span>
                        </>
                      ) : accountTab === 'forgot' ? (
                        <>
                          <Mail className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>{isLoading ? 'Sending Link...' : 'Send Recovery Link →'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal →'}</span>
                        </>
                      )}
                    </button>

                    {accountTab === 'forgot' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAccountTab('login');
                          setLoginError('');
                          setLoginSuccessMessage('');
                        }}
                        className="w-full text-center text-xs font-bold text-stone-500 hover:text-stone-900 transition py-1 cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    )}
                  </form>

                  {/* Demo Account Passkeys */}
                  <div className="pt-3 border-t border-stone-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Quick Demo Credentials (Click to Autofill):
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountTab('login');
                          setEmailInput('johndoe@example.com');
                          setPasswordInput('password123');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 text-xs font-semibold transition cursor-pointer border border-stone-200 text-left flex items-center justify-between"
                      >
                        <span>👤 <strong>John Doe</strong></span>
                        <span className="text-[10px] text-stone-400">johndoe@example.com</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountTab('login');
                          setEmailInput('emily.w@example.com');
                          setPasswordInput('password123');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 text-xs font-semibold transition cursor-pointer border border-stone-200 text-left flex items-center justify-between"
                      >
                        <span>👤 <strong>Emily Watson</strong></span>
                        <span className="text-[10px] text-stone-400">emily.w@example.com</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUICK BOOKING ID LOOKUP */}
              {authMode === 'quickRef' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-950">
                      Quick Booking ID Lookup
                    </h2>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Don't have an account? Enter the booking key sent on your receipt screen or email.
                    </p>
                  </div>

                  <form onSubmit={handleQuickRefLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Booking Reference Key *
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. VH-9428-K82X"
                          value={refInput}
                          onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono tracking-wider focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center justify-between">
                        <span>Phone Last 4 Digits</span>
                        <span className="text-[10px] text-stone-400 font-normal">Optional 2FA</span>
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 0199"
                        value={phoneLast4}
                        onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
                        className="w-full py-2 px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 font-mono tracking-widest focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>{isLoading ? 'Verifying Key...' : 'Lookup Booking Itinerary →'}</span>
                    </button>
                  </form>

                  {/* Demo Reference Passkeys */}
                  <div className="pt-3 border-t border-stone-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Quick Demo Passkeys:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRefInput('VH-9428-K82X');
                          handleDirectRefLookup('VH-9428-K82X');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 text-xs font-semibold transition cursor-pointer border border-stone-200 text-left"
                      >
                        🔑 <strong>VH-9428-K82X</strong> — John Doe
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRefInput('VH-4402-Z33W');
                          handleDirectRefLookup('VH-4402-Z33W');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 text-xs font-semibold transition cursor-pointer border border-stone-200 text-left"
                      >
                        🔑 <strong>VH-4402-Z33W</strong> — Emily Watson
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Portal Capabilities Guide */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif font-bold text-base text-white">Patient Portal Features</h3>
                </div>

                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Official Medical Receipts</strong>
                      <span>Download itemized invoices with VAT exemption codes for private insurance claims.</span>
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
                  <span>Need Assistance from Reception?</span>
                </div>
                <p className="text-stone-700 leading-relaxed text-[11px]">
                  If you need urgent clinical triage or have questions regarding insurance pre-authorization:
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

        {/* ----------------- STATE 2A: LOGGED IN WITH NO BOOKINGS YET ----------------- */}
        {activePatient && patientAppointments.length === 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-950">Welcome, {activePatient.name}!</h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                You have no scheduled appointments on file under <strong className="text-stone-900">{activePatient.email}</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openBookingModal()}
              className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Book Your First Consultation</span>
            </button>
          </div>
        )}

        {/* ----------------- STATE 2B: AUTHENTICATED DASHBOARD (With Appointments) ----------------- */}
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
                    Recovery Dashboard
                  </button>
                  {portalConfig.allowReceiptDownload && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('receipts')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        activeTab === 'receipts'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Receipt
                    </button>
                  )}
                  {portalConfig.allowSelfReschedule && selectedAppt.status !== 'cancelled' && (
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
                  )}
                  {portalConfig.allowSelfCancellation && selectedAppt.status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('cancel')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        activeTab === 'cancel'
                          ? 'bg-rose-900 text-white shadow-2xs'
                          : 'text-stone-400 hover:text-rose-400'
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* TAB 1: RECOVERY DASHBOARD VIEW */}
              {activeTab === 'itinerary' && (
                <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
                  
                  {/* Appointment Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Appointment Date</span>
                      </span>
                      <p className="text-base font-bold text-stone-900">
                        {selectedAppt.date || 'To be scheduled'}
                      </p>
                      <p className="text-xs text-stone-500 font-medium">
                        {selectedAppt.time || '10:00 AM'} ({selectedAppt.durationMinutes || 45} mins)
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Attending Doctor</span>
                      </span>
                      <p className="text-base font-bold text-stone-900">
                        {selectedAppt.practitionerName || clinic.leadPractitionerName || 'Doctor of Chiropractic'}
                      </p>
                      <p className="text-xs text-emerald-800 font-medium">
                        GCC Registered Practitioner
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Payment / Protection</span>
                      </span>
                      <p className="text-base font-bold text-stone-900">
                        {selectedAppt.paymentAmount || '£49.00 Consultation'}
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{selectedAppt.paymentStatus === 'paid_full' ? 'Paid in Full' : selectedAppt.paymentStatus === 'deposit_paid' ? 'Deposit Paid (£25)' : 'No-Show Card Protected'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Calendar Export */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-4 border-b border-stone-100">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleDownloadCalendarFile}
                        className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-2xs"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Add to Calendar (.ics)</span>
                      </button>

                      <a
                        href={mapDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition cursor-pointer flex items-center gap-2 border border-stone-200"
                      >
                        <MapPin className="w-4 h-4 text-emerald-800" />
                        <span>Directions to Practice</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                    </div>

                    {activePatient?.isAccount === true && (
                      <button
                        type="button"
                        onClick={() => openBookingModal()}
                        className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-sm border border-emerald-700/50"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                        <span>Book Next Visit (Pre-Filled)</span>
                      </button>
                    )}
                  </div>

                  {activePatient?.isAccount === true && (
                    <>
                      {/* HEALTH DASHBOARD INTERACTIVE SECTIONS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        
                        {/* CARE PLAN PHASE & MILESTONES */}
                        {(() => {
                          const plan = getTreatmentPlanForCondition(selectedAppt.condition);
                          return (
                            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                                  <ShieldCheck className="w-5 h-5 text-emerald-750" />
                                  <span>Clinical Care Plan</span>
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  Active Track
                                </span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">CURRENT CARE PHASE:</span>
                                <span className="text-sm font-bold text-stone-900 block leading-tight">{plan.phase}</span>
                              </div>

                              {/* Progress bar */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold text-stone-750">
                                  <span>Milestone Progress</span>
                                  <span>{plan.progress}%</span>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                                  <div 
                                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${plan.progress}%` }}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 pt-1 text-xs">
                                <span className="font-bold text-stone-800 block uppercase text-[10px]">NEXT OUTCOME TARGET:</span>
                                <p className="text-stone-600 leading-relaxed font-sans">{plan.milestone}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs border-t border-stone-150">
                                <div>
                                  <span className="font-bold text-stone-400 block uppercase text-[9px] tracking-wider">PRESCRIBED FREQUENCY</span>
                                  <span className="font-bold text-stone-800 mt-0.5 block">{plan.frequency}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-stone-400 block uppercase text-[9px] tracking-wider">CLINICAL EXCELLENCE</span>
                                  <span className="font-bold text-emerald-800 mt-0.5 block">Statutory Regulated</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* REHAB EXERCISES & STREAKS */}
                        <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-750" />
                              <span>Home Rehab Exercises</span>
                            </h3>
                            <div className="flex items-center gap-1.5 bg-amber-55 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-md text-xs font-bold">
                              <span>🔥 {exerciseStreak} Day Streak</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {getExercisesForCondition(selectedAppt.condition).map((ex) => (
                              <div 
                                key={ex.id}
                                onClick={() => handleToggleExercise(ex.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                                  exerciseStatus[ex.id] 
                                    ? 'bg-emerald-50/40 border-emerald-500/30 shadow-2xs' 
                                    : 'bg-white border-stone-250 hover:border-stone-350'
                                }`}
                              >
                                <div className="pt-0.5 shrink-0">
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                    exerciseStatus[ex.id]
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-stone-300 bg-white text-transparent'
                                  }`}>
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={`text-xs font-bold truncate ${exerciseStatus[ex.id] ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                                      {ex.title}
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                                      {ex.frequency}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500 leading-snug mt-0.5 font-sans">
                                    {ex.instructions}
                                  </p>
                                  <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                                    Benefit: {ex.benefit}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="text-[10px] text-stone-400 text-center italic pt-1 border-t border-stone-150">
                            * Complete these daily to reinforce alignment. Tapping a finished exercise increases your daily recovery streak.
                          </div>
                        </div>

                      </div>

                      {/* CLINICAL OUTCOME RECOMMENDATIONS */}
                      {(() => {
                        const plan = getTreatmentPlanForCondition(selectedAppt.condition);
                        return (
                          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-250/70 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-amber-700" />
                              <span>Specialist clinical recommendation</span>
                            </span>
                            <p className="text-xs sm:text-sm text-stone-750 leading-relaxed font-semibold">
                              "{plan.doctorNote}"
                            </p>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {/* Before You Arrive */}
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                      <span>Before You Arrive Checklist</span>
                    </h4>
                    <ul className="text-xs text-stone-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span><strong>Attire:</strong> Please wear comfortable, athletic clothing or loose trousers for unrestricted range of motion testing.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span><strong>Medical Records:</strong> Bring any recent spinal MRI scans, X-rays, or relevant surgical discharge summaries on a USB drive or printed report.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span><strong>Arrival:</strong> Please arrive 10 minutes prior to your scheduled consultation time to complete your digital intake review.</span>
                      </li>
                    </ul>
                  </div>

                </div>
              )}

              {/* TAB 2: OFFICIAL MEDICAL RECEIPT */}
              {activeTab === 'receipts' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-stone-950">Official Health Insurance Receipt</h3>
                      <p className="text-xs text-stone-500">Itemized with GCC provider credentials for Bupa, AXA, Aviva & HSA reimbursement.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition cursor-pointer flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                  </div>

                  {/* Printable Invoice Card */}
                  <div ref={receiptRef} className="p-6 sm:p-8 rounded-2xl border border-stone-200 bg-white space-y-6 text-stone-900 shadow-2xs font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-6">
                      <div>
                        <div className="font-serif font-bold text-xl text-stone-950">{clinic.name}</div>
                        <p className="text-xs text-stone-500 mt-0.5">{clinic.address}, {clinic.cityState || clinic.city} {clinic.zip}</p>
                        <p className="text-xs text-stone-500">Phone: {clinic.phone} • Email: {clinic.email}</p>
                        <p className="text-xs font-mono text-emerald-800 mt-1 font-semibold">GCC Registration: 04182 • Statutory Regulated Healthcare Provider</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">RECEIPT / INVOICE</span>
                        <span className="font-mono font-bold text-sm text-stone-900">INV-{selectedAppt.id}</span>
                        <p className="text-xs text-stone-500 mt-1">Date: {selectedAppt.date || new Date().toISOString().split('T')[0]}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">PATIENT DETAILS</span>
                        <strong className="text-stone-900 text-sm block mt-0.5">{selectedAppt.name}</strong>
                        <span className="text-stone-500">{selectedAppt.email}</span>
                        <span className="text-stone-500 block">{selectedAppt.phone}</span>
                      </div>
                      <div>
                        <span className="font-bold text-stone-400 uppercase tracking-wider block text-[10px]">ATTENDING CLINICIAN</span>
                        <strong className="text-stone-900 text-sm block mt-0.5">{selectedAppt.practitionerName || clinic.leadPractitionerName || 'Chiropractic Specialist'}</strong>
                        <span className="text-stone-500">Doctor of Chiropractic (DC, MChiro)</span>
                      </div>
                    </div>

                    <table className="w-full text-xs text-left border-t border-stone-200 pt-4">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2">Service Description</th>
                          <th className="py-2">Type</th>
                          <th className="py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        <tr>
                          <td className="py-3 font-medium text-stone-900">
                            {selectedAppt.serviceTitle || selectedAppt.condition || 'Initial Diagnostic Consultation & Assessment'}
                          </td>
                          <td className="py-3 text-stone-500">VAT Exempt (Healthcare)</td>
                          <td className="py-3 text-right font-mono font-bold text-stone-900">{selectedAppt.paymentAmount || '£49.00'}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-stone-900 font-bold text-stone-950">
                          <td colSpan={2} className="py-3 text-right">Total Paid:</td>
                          <td className="py-3 text-right font-mono text-sm">{selectedAppt.paymentAmount || '£49.00'}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 space-y-1">
                      <p><strong>Note for Insurance Providers:</strong> Chiropractic care provided at this clinic is delivered by a statutory registered practitioner regulated under the Chiropractors Act 1994. Invoices are exempt from VAT under VATA 1994, Sch 9, Group 7.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RESCHEDULE VIEW */}
              {activeTab === 'reschedule' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-950">Reschedule Your Appointment</h3>
                    <p className="text-xs text-stone-500">Select a new date and time for your consultation with {selectedAppt.practitionerName || 'your chiropractor'}.</p>
                  </div>

                  {rescheduleSuccess ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <strong className="block font-bold">Reschedule Request Submitted!</strong>
                        <span>Your updated request for {newDate} at {newTime} has been transmitted to reception.</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleResubmitReschedule} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Select New Date *
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Select Preferred Time *
                        </label>
                        <select
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                        >
                          {['08:30 AM', '09:15 AM', '10:00 AM', '11:30 AM', '01:15 PM', '02:00 PM', '03:45 PM', '05:00 PM', '06:15 PM'].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Reason for Rescheduling
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Work schedule change"
                          value={rescheduleNote}
                          onChange={(e) => setRescheduleNote(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                        >
                          Confirm Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('itinerary')}
                          className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition cursor-pointer"
                        >
                          Keep Current Time
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 4: CANCELLATION VIEW */}
              {activeTab === 'cancel' && (
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-rose-950">Cancel Your Booking</h3>
                    <p className="text-xs text-stone-500">Cancellations made more than 24 hours in advance incur no penalty under our practice policy.</p>
                  </div>

                  {cancelSuccess ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-3">
                      <Ban className="w-5 h-5 text-rose-700 shrink-0" />
                      <div>
                        <strong className="block font-bold">Appointment Cancelled</strong>
                        <span>Your booking has been cancelled and the time slot opened for waitlist patients.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                          Reason for Cancellation
                        </label>
                        <select
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:bg-white focus:border-rose-700 focus:ring-1 focus:ring-rose-700 cursor-pointer"
                        >
                          <option value="Schedule Conflict">Schedule Conflict</option>
                          <option value="Symptoms Resolved">Symptoms Resolved / Feeling Better</option>
                          <option value="Seeking Care Elsewhere">Seeking Care Elsewhere</option>
                          <option value="Financial / Insurance Concern">Financial / Insurance Concern</option>
                          <option value="Transportation Issue">Transportation Issue</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                        If you are suffering from persistent spinal pain or nerve symptoms, we recommend rescheduling rather than cancelling so your recovery progress is not delayed.
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleConfirmCancellation}
                          className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                        >
                          Confirm Cancellation
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('itinerary')}
                          className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition cursor-pointer"
                        >
                          Never Mind, Keep Booking
                        </button>
                      </div>
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
