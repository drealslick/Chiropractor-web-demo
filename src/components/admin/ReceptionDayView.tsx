import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Search,
  Check,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  UserCheck,
  CalendarCheck,
  AlertTriangle,
  MoveHorizontal,
  CreditCard,
  Shield,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { PatientLead, updateLeadDetails, updateLeadStatus, saveLead, updateLeadPayment } from '../../data/leadsStore';
import { PublicTeamMember } from '../../types';

interface ReceptionDayViewProps {
  leads: PatientLead[];
  practitioners: PublicTeamMember[];
  clinicName: string;
  onOpenNewBookingModal: () => void;
  onOpenWaitlistModal: () => void;
  waitlistCount: number;
}

const DEFAULT_TIME_SLOTS = [
  '8:00 AM',
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
];

export const ReceptionDayView: React.FC<ReceptionDayViewProps> = ({
  leads,
  practitioners,
  clinicName,
  onOpenNewBookingModal,
  onOpenWaitlistModal,
  waitlistCount,
}) => {
  // Selected date for Day View (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Selected appointment for patient profile slide-out panel
  const [selectedPatient, setSelectedPatient] = useState<PatientLead | null>(null);

  // New staff note inside patient slide-out
  const [newStaffNote, setNewStaffNote] = useState<string>('');

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ doctor: string; time: string } | null>(null);
  const [rescheduleToast, setRescheduleToast] = useState<string | null>(null);

  // Doctor filter
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');

  // Filter practitioners
  const displayPractitioners =
    selectedDoctorFilter === 'all'
      ? practitioners
      : practitioners.filter((p) => p.name === selectedDoctorFilter);

  // Navigate date
  const handlePrevDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() - 1);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + 1);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Format date display
  const dateFormatted = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, lead: PatientLead) => {
    e.dataTransfer.setData('text/plain', lead.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(lead.id);
  };

  const handleDragOver = (e: React.DragEvent, doctorName: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverSlot || dragOverSlot.doctor !== doctorName || dragOverSlot.time !== time) {
      setDragOverSlot({ doctor: doctorName, time });
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetDoctor: string, targetTime: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    const leadToMove = leads.find((l) => l.id === leadId);
    if (!leadToMove) return;

    // Update appointment with new time, doctor, and date
    updateLeadDetails(leadId, {
      date: selectedDate,
      time: targetTime,
      practitionerName: targetDoctor,
    });

    setRescheduleToast(
      `✓ Rescheduled: ${leadToMove.name} moved to ${targetTime} with ${targetDoctor.split(' ')[0]} ${targetDoctor.split(' ')[1] || ''}`
    );

    setTimeout(() => {
      setRescheduleToast(null);
    }, 3500);

    setDraggedLeadId(null);
  };

  // Patient profile action handlers
  const handleCheckInPatient = (lead: PatientLead) => {
    updateLeadStatus(lead.id, 'checked_in');
    setSelectedPatient({ ...lead, status: 'checked_in' });
  };

  const handleConfirmPatient = (lead: PatientLead) => {
    updateLeadStatus(lead.id, 'confirmed');
    setSelectedPatient({ ...lead, status: 'confirmed' });
  };

  const handleCancelPatient = (lead: PatientLead) => {
    if (confirm(`Cancel appointment for ${lead.name}?`)) {
      updateLeadStatus(lead.id, 'cancelled', 'Cancelled by front desk via calendar profile');
      setSelectedPatient(null);
    }
  };

  const handleSaveStaffNote = () => {
    if (!selectedPatient || !newStaffNote.trim()) return;
    const existingNotes = selectedPatient.notes ? `${selectedPatient.notes}\n` : '';
    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedNotes = `${existingNotes}[${timeStamp} Staff Note]: ${newStaffNote.trim()}`;
    updateLeadDetails(selectedPatient.id, { notes: updatedNotes });
    setSelectedPatient({ ...selectedPatient, notes: updatedNotes });
    setNewStaffNote('');
  };

  // Payment action handlers for Receptionist
  const handleMarkBalancePaid = (patient: PatientLead) => {
    updateLeadPayment(patient.id, {
      paymentStatus: 'paid_full',
      paymentAmount: '£49.00',
      notesAppend: 'Balance settled at reception on arrival.',
    });
    setSelectedPatient((prev) =>
      prev ? { ...prev, paymentStatus: 'paid_full', paymentAmount: '£49.00' } : null
    );
  };

  const handleChargeNoShowFee = (patient: PatientLead) => {
    const fee = '£35.00';
    if (confirm(`Authorize no-show penalty fee of ${fee} to ${patient.name}'s card on file?`)) {
      updateLeadPayment(patient.id, {
        notesAppend: `No-show fee of ${fee} charged to card ending in ${patient.cardLast4 || 'file'} due to patient non-attendance.`,
      });
      updateLeadStatus(patient.id, 'cancelled', 'No-show / fee charged');
      setSelectedPatient((prev) =>
        prev ? { ...prev, status: 'cancelled', notes: `${prev.notes} • [No-Show fee ${fee} charged]` } : null
      );
    }
  };

  const handleRefundPayment = (patient: PatientLead) => {
    if (confirm(`Issue full deposit refund of ${patient.paymentAmount || '£25'} to ${patient.name}'s original card?`)) {
      updateLeadPayment(patient.id, {
        paymentStatus: 'refunded',
        notesAppend: `Deposit of ${patient.paymentAmount || '£25'} refunded to card ending in ${patient.cardLast4 || 'file'} per 24h cancellation guarantee.`,
      });
      setSelectedPatient((prev) =>
        prev ? { ...prev, paymentStatus: 'refunded' } : null
      );
    }
  };

  // Day's active appointments
  const dayBookings = leads.filter(
    (l) =>
      l.source === 'booking' &&
      l.date === selectedDate &&
      l.status !== 'cancelled' &&
      l.status !== 'archived' &&
      l.status !== 'waitlist'
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner on Drag & Drop Reschedule */}
      {rescheduleToast && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/70 text-emerald-200 text-xs font-bold rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{rescheduleToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setRescheduleToast(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Reception Day Toolbar */}
      <div className="bg-stone-900 border border-stone-800 p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-850 border border-stone-750 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-stone-750 text-stone-300 hover:text-white rounded-lg transition cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                isToday
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-750'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1.5 hover:bg-stone-750 text-stone-300 hover:text-white rounded-lg transition cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-serif font-bold text-sm sm:text-base text-stone-100 tracking-tight">
              {dateFormatted}
            </span>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                Live
              </span>
            )}
          </div>
        </div>

        {/* Action Controls: Doctor Filter, Waitlist, New Booking */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {/* Doctor Filter */}
          <div className="flex items-center gap-1.5 bg-stone-850 border border-stone-750 px-2.5 py-1 rounded-xl text-xs text-stone-300">
            <span className="text-[10px] font-bold uppercase text-stone-400">Doctor:</span>
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="bg-transparent text-emerald-300 font-bold text-xs cursor-pointer outline-none"
            >
              <option value="all" className="bg-stone-900 text-stone-200">
                All Doctors ({practitioners.length})
              </option>
              {practitioners.map((doc) => (
                <option key={doc.id} value={doc.name} className="bg-stone-900 text-stone-200">
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Waitlist Button */}
          <button
            type="button"
            onClick={onOpenWaitlistModal}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            title="Open patient cancellation waitlist"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Waitlist</span>
            {waitlistCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-stone-950 text-[10px] font-black rounded-full">
                {waitlistCount}
              </span>
            )}
          </button>

          {/* New Booking Button */}
          <button
            type="button"
            onClick={onOpenNewBookingModal}
            className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Book Slot</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Guidance Banner for Receptionist */}
      <div className="px-3.5 py-2 rounded-xl bg-stone-850/80 border border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
        <div className="flex items-center gap-2">
          <MoveHorizontal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Drag-and-Drop Enabled:</strong> Grab any appointment card to move it between time slots (e.g. 10:00 AM to 3:00 PM) or reassign doctors.
          </span>
        </div>
        <span className="hidden sm:inline text-stone-500">
          Click any patient to open side profile & dialer
        </span>
      </div>

      {/* Vertical Doctor Columns Day Schedule Grid */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Doctor Column Headers */}
        <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] border-b border-stone-800 bg-stone-950 sticky top-0 z-10">
          {/* Time Gutter Header */}
          <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-center border-r border-stone-800/80">
            Time
          </div>

          {/* Each Doctor Column Header */}
          {displayPractitioners.map((doc) => {
            const docBookings = dayBookings.filter(
              (b) => !b.practitionerName || b.practitionerName === doc.name
            );
            return (
              <div
                key={doc.id}
                className="p-3 border-r border-stone-800/80 last:border-r-0 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-xs text-stone-100 truncate">{doc.name}</div>
                  <div className="text-[10px] text-emerald-400 font-medium truncate">
                    {doc.title || 'Chiropractor'}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-850 text-stone-300 border border-stone-750 shrink-0">
                  {docBookings.length} appts
                </span>
              </div>
            );
          })}
        </div>

        {/* Time Slot Rows with Droppable Cells */}
        <div className="divide-y divide-stone-800/60 max-h-[640px] overflow-y-auto">
          {DEFAULT_TIME_SLOTS.map((timeSlot) => {
            return (
              <div
                key={timeSlot}
                className="grid grid-cols-[80px_repeat(auto-fit,minmax(220px,1fr))] min-h-[64px]"
              >
                {/* Time Slot Label */}
                <div className="p-2.5 text-[11px] font-mono font-medium text-stone-400 flex items-center justify-center border-r border-stone-800/80 bg-stone-950/40 select-none">
                  {timeSlot}
                </div>

                {/* Doctor Slot Cells */}
                {displayPractitioners.map((doc) => {
                  // Find appointment matching this doctor and time slot
                  const matchingAppointments = dayBookings.filter((b) => {
                    const matchesDoctor =
                      !b.practitionerName ||
                      b.practitionerName.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1] || doc.name.toLowerCase()) ||
                      b.practitionerName.toLowerCase() === doc.name.toLowerCase();
                    return matchesDoctor && b.time === timeSlot;
                  });

                  const isSlotOver =
                    dragOverSlot?.doctor === doc.name && dragOverSlot?.time === timeSlot;

                  return (
                    <div
                      key={doc.id}
                      onDragOver={(e) => handleDragOver(e, doc.name, timeSlot)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, doc.name, timeSlot)}
                      className={`p-1.5 border-r border-stone-800/60 last:border-r-0 transition-colors relative flex flex-col gap-1 ${
                        isSlotOver
                          ? 'bg-emerald-950/60 border-2 border-dashed border-emerald-400/80'
                          : 'hover:bg-stone-850/30'
                      }`}
                    >
                      {matchingAppointments.length === 0 ? (
                        /* Empty Slot Droppable Placeholder */
                        <div className="h-full min-h-[48px] rounded-lg border border-dashed border-transparent hover:border-stone-800 flex items-center justify-center group cursor-pointer">
                          <span className="text-[10px] text-stone-600 group-hover:text-stone-400 opacity-0 group-hover:opacity-100 transition">
                            + Open Slot ({timeSlot})
                          </span>
                        </div>
                      ) : (
                        matchingAppointments.map((lead) => {
                          const isCheckedIn = lead.status === 'checked_in';
                          const isUnconfirmed = lead.status === 'new';
                          const isConfirmed = lead.status === 'confirmed' || lead.status === 'booked';

                          // Status Styling
                          let cardClasses = 'bg-stone-850 border-stone-750 text-stone-200';
                          let badgeClasses = 'bg-stone-800 text-stone-300';
                          let badgeText = 'Scheduled';

                          if (isCheckedIn) {
                            cardClasses =
                              'bg-emerald-950/70 border-emerald-500/80 text-emerald-100 shadow-sm shadow-emerald-950';
                            badgeClasses =
                              'bg-emerald-500 text-stone-950 font-bold';
                            badgeText = 'In Waiting Room';
                          } else if (isUnconfirmed) {
                            cardClasses =
                              'bg-amber-950/60 border-amber-500/70 text-amber-100';
                            badgeClasses =
                              'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
                            badgeText = 'Needs Call';
                          } else if (isConfirmed) {
                            cardClasses =
                              'bg-stone-850 border-emerald-800/80 text-stone-100';
                            badgeClasses =
                              'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold';
                            badgeText = 'Confirmed';
                          }

                          return (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead)}
                              onClick={() => setSelectedPatient(lead)}
                              className={`p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing hover:shadow-md select-none group relative ${cardClasses}`}
                            >
                              <div className="flex items-start justify-between gap-1.5 mb-1">
                                <span className="font-bold text-xs leading-tight group-hover:text-emerald-300 truncate">
                                  {lead.name}
                                </span>
                                <span
                                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full shrink-0 tracking-wider ${badgeClasses}`}
                                >
                                  {badgeText}
                                </span>
                              </div>

                              <div className="text-[10px] text-stone-400 truncate font-medium">
                                {lead.condition || 'General Chiropractic Consultation'}
                              </div>

                              {/* Upfront Payment Status Badge */}
                              {lead.paymentStatus && (
                                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold">
                                  {lead.paymentStatus === 'paid_full' ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                                      <CreditCard className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Paid {lead.paymentAmount || '£49'}</span>
                                    </span>
                                  ) : lead.paymentStatus === 'deposit_paid' ? (
                                    <span className="inline-flex items-center gap-1 text-teal-300 bg-teal-950/80 border border-teal-800/80 px-1.5 py-0.5 rounded">
                                      <CreditCard className="w-2.5 h-2.5 text-teal-400" />
                                      <span>Deposit {lead.paymentAmount || '£25'}</span>
                                    </span>
                                  ) : lead.paymentStatus === 'card_hold' ? (
                                    <span className="inline-flex items-center gap-1 text-blue-300 bg-blue-950/80 border border-blue-800/80 px-1.5 py-0.5 rounded">
                                      <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
                                      <span>Card Guaranteed</span>
                                    </span>
                                  ) : lead.paymentStatus === 'refunded' ? (
                                    <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-950/80 border border-rose-800/80 px-1.5 py-0.5 rounded">
                                      <span>Refunded</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-amber-300/80 bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">
                                      <span>Pay at Desk</span>
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-stone-800/80 text-[10px] text-stone-400">
                                <span className="flex items-center gap-1 font-mono text-[10px]">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  {lead.durationMinutes || 45}m
                                </span>

                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                  {lead.phone && (
                                    <a
                                      href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-1 rounded hover:bg-stone-800 text-stone-300 hover:text-emerald-400 transition"
                                      title={`Call ${lead.name}`}
                                    >
                                      <Phone className="w-3 h-3 text-emerald-400" />
                                    </a>
                                  )}
                                  {lead.email && (
                                    <a
                                      href={`mailto:${lead.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-1 rounded hover:bg-stone-800 text-stone-300 hover:text-sky-400 transition"
                                      title={`Email ${lead.name}`}
                                    >
                                      <Mail className="w-3 h-3 text-sky-400" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Profile Slide-out Side Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-stone-900 border-l border-stone-800 h-full flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {selectedPatient.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedPatient.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                    <span>Patient Profile</span>
                    <span>•</span>
                    <span className="capitalize text-emerald-400 font-semibold">
                      {selectedPatient.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-850 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Action Bar (Call / Email / Check-in) */}
            <div className="p-4 bg-stone-850/60 border-b border-stone-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Reception Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Call Button */}
                <a
                  href={`tel:${selectedPatient.phone ? selectedPatient.phone.replace(/[^0-9+]/g, '') : ''}`}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-emerald-950 hover:border-emerald-600 text-stone-100 hover:text-emerald-200 border border-stone-700 flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Patient</span>
                </a>

                {/* Email Button */}
                <a
                  href={`mailto:${selectedPatient.email}?subject=${encodeURIComponent(
                    `Your Appointment at ${clinicName}`
                  )}`}
                  className="p-2.5 rounded-xl bg-stone-800 hover:bg-sky-950 hover:border-sky-600 text-stone-100 hover:text-sky-200 border border-stone-700 flex items-center justify-center gap-2 font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Email Patient</span>
                </a>
              </div>

              {/* Status Change Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {selectedPatient.status !== 'checked_in' && (
                  <button
                    type="button"
                    onClick={() => handleCheckInPatient(selectedPatient)}
                    className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs col-span-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Check In Patient (Waiting Room)</span>
                  </button>
                )}

                {selectedPatient.status === 'new' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmPatient(selectedPatient)}
                    className="p-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer col-span-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mark Appointment Confirmed</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCancelPatient(selectedPatient)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-rose-950 hover:border-rose-700 text-stone-400 hover:text-rose-300 border border-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer col-span-2"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Appointment</span>
                </button>
              </div>
            </div>

            {/* Patient Clinical & Contact Details */}
            <div className="p-4 sm:p-5 space-y-4 flex-1">
              {/* Contact Information */}
              <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Contact Coordinates
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Phone:</span>
                  <a
                    href={`tel:${selectedPatient.phone}`}
                    className="text-stone-100 hover:text-emerald-400 font-medium"
                  >
                    {selectedPatient.phone || 'No phone provided'}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Email:</span>
                  <a
                    href={`mailto:${selectedPatient.email}`}
                    className="text-stone-100 hover:text-sky-400 font-medium truncate max-w-[200px]"
                  >
                    {selectedPatient.email || 'No email provided'}
                  </a>
                </div>
              </div>

              {/* Appointment Slot Details */}
              <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Schedule Details
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Date:</span>
                  <span className="text-stone-100 font-bold">{selectedPatient.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Time:</span>
                  <span className="text-emerald-400 font-bold">{selectedPatient.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Doctor:</span>
                  <span className="text-stone-100 font-bold">
                    {selectedPatient.practitionerName || 'First Available'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Duration:</span>
                  <span className="text-stone-200">{selectedPatient.durationMinutes || 45} mins</span>
                </div>
              </div>

              {/* Upfront Payment & No-Show Protection Drawer Panel */}
              <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Payment & Slot Protection
                  </span>
                  {selectedPatient.paymentStatus ? (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedPatient.paymentStatus === 'paid_full'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : selectedPatient.paymentStatus === 'deposit_paid'
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : selectedPatient.paymentStatus === 'card_hold'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : selectedPatient.paymentStatus === 'refunded'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {selectedPatient.paymentStatus.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="text-stone-500 text-[11px]">Unrecorded</span>
                  )}
                </div>

                <div className="space-y-1.5 text-stone-300 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Amount Recorded:</span>
                    <span className="font-bold text-white">
                      {selectedPatient.paymentAmount || (selectedPatient.paymentStatus === 'paid_full' ? '£49.00' : selectedPatient.paymentStatus === 'deposit_paid' ? '£25.00' : '£0.00')}
                    </span>
                  </div>
                  {selectedPatient.cardLast4 && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Card on File:</span>
                      <span className="font-mono text-stone-200">
                        {selectedPatient.cardBrand || 'Card'} ending •••• {selectedPatient.cardLast4}
                      </span>
                    </div>
                  )}
                  {selectedPatient.transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Transaction Ref:</span>
                      <span className="font-mono text-[10px] text-stone-400 truncate max-w-[160px]">
                        {selectedPatient.transactionId}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                    <span className="text-stone-400">No-Show Protection:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>£35 Fee Authorized</span>
                    </span>
                  </div>
                </div>

                {/* Quick Receptionist Payment Action Buttons */}
                <div className="pt-2 border-t border-stone-800 flex flex-wrap gap-1.5">
                  {selectedPatient.paymentStatus !== 'paid_full' && (
                    <button
                      type="button"
                      onClick={() => handleMarkBalancePaid(selectedPatient)}
                      className="flex-1 py-1.5 px-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-[11px] font-bold rounded-lg transition cursor-pointer"
                    >
                      Mark Paid at Desk (£49)
                    </button>
                  )}
                  {selectedPatient.paymentStatus !== 'refunded' && (
                    <button
                      type="button"
                      onClick={() => handleRefundPayment(selectedPatient)}
                      className="py-1.5 px-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-300 text-[11px] font-medium rounded-lg transition cursor-pointer"
                    >
                      Refund Deposit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleChargeNoShowFee(selectedPatient)}
                    className="py-1.5 px-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 text-[11px] font-bold rounded-lg transition cursor-pointer"
                  >
                    Charge No-Show (£35)
                  </button>
                </div>
              </div>

              {/* Primary Concern / Chief Complaint */}
              <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Chief Complaint / Reason for Visit
                </span>
                <p className="text-sm font-semibold text-stone-100">
                  {selectedPatient.condition || 'General consultation & spinal exam'}
                </p>
              </div>

              {/* Callback Notes & Intake History */}
              <div className="p-3.5 rounded-xl bg-stone-850 border border-stone-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Reception Callback & Intake Notes
                </span>
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 whitespace-pre-line text-xs font-mono">
                  {selectedPatient.notes || 'No intake notes recorded.'}
                </div>

                {/* Add Staff Note */}
                <div className="space-y-1.5 pt-2 border-t border-stone-800">
                  <label className="text-[11px] font-bold text-stone-400">Add Staff Follow-up Note:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Left voicemail at 10am; patient confirmed arrival..."
                      value={newStaffNote}
                      onChange={(e) => setNewStaffNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveStaffNote();
                      }}
                      className="flex-1 bg-stone-900 border border-stone-750 rounded-xl px-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveStaffNote}
                      disabled={!newStaffNote.trim()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
