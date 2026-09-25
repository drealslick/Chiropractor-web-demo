import React, { useState, useEffect } from 'react';
import {
  Inbox,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Download,
  Trash2,
  CheckCircle,
  Clock3,
  Archive,
  Search,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  CalendarPlus,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import {
  PatientLead,
  getStoredLeads,
  updateLeadStatus,
  deleteLead,
  clearAllLeads,
  exportLeadsToCSV,
  saveLead,
} from '../../data/leadsStore';
import { UserRole } from '../../types';

interface LeadsInboxProps {
  clinicName: string;
  role?: UserRole;
  onAssignToCalendar?: (lead: PatientLead) => void;
}

function getRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}

export function LeadsInbox({ clinicName, role = 'admin', onAssignToCalendar }: LeadsInboxProps) {
  const [leads, setLeads] = useState<PatientLead[]>(getStoredLeads);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'booked' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingPromptLead, setBookingPromptLead] = useState<PatientLead | null>(null);

  const isStaff = role === 'staff';

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PatientLead[]>;
      if (customEvent.detail) {
        setLeads(customEvent.detail);
      } else {
        setLeads(getStoredLeads());
      }
    };
    window.addEventListener('leads_updated', handleUpdate);
    return () => window.removeEventListener('leads_updated', handleUpdate);
  }, []);

  const handleStatusChange = (id: string, status: PatientLead['status']) => {
    const targetLead = leads.find((l) => l.id === id);
    if (status === 'booked' && targetLead) {
      // Trigger receptionist modal to prompt calendar assignment
      setBookingPromptLead(targetLead);
      return;
    }
    const updated = updateLeadStatus(id, status);
    setLeads(updated);
  };

  const handleConfirmAssignToCalendar = () => {
    if (!bookingPromptLead) return;
    const updated = updateLeadStatus(bookingPromptLead.id, 'booked');
    setLeads(updated);
    if (onAssignToCalendar) {
      onAssignToCalendar(bookingPromptLead);
    }
    setBookingPromptLead(null);
  };

  const handleConfirmJustBooked = () => {
    if (!bookingPromptLead) return;
    const updated = updateLeadStatus(bookingPromptLead.id, 'booked');
    setLeads(updated);
    setBookingPromptLead(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this inquiry record?')) {
      const updated = deleteLead(id);
      setLeads(updated);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all stored leads? This cannot be undone.')) {
      clearAllLeads();
      setLeads([]);
    }
  };

  const handleAddDemoLead = () => {
    const names = ['Sarah Jenkins', 'Marcus Vance', 'David Chen', 'Emma Watson', 'Robert Taylor'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const conditions = ['Sciatica & Lumbar Pain', 'Neck Stiffness / Tech Neck', 'Sports Injury Assessment', 'Migraine & Posture'];
    const randomCond = conditions[Math.floor(Math.random() * conditions.length)];
    
    saveLead({
      source: 'booking',
      name: randomName,
      phone: '+44 7700 900' + Math.floor(100 + Math.random() * 900),
      email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
      condition: randomCond,
      date: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: '10:30 AM',
      notes: 'Has had lower back pain for 6 weeks, worse after running. Seeking initial diagnosis.',
      clinicName,
      status: 'new',
    });
  };

  const filtered = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        (l.condition && l.condition.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const newCount = leads.filter((l) => l.status === 'new').length;
  const bookedCount = leads.filter((l) => l.status === 'booked').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-stone-850 border border-stone-800 p-2.5 rounded-lg">
          <span className="text-xl font-bold text-stone-100">{leads.length}</span>
          <span className="block text-[10px] text-stone-400 font-medium">Total</span>
        </div>
        <div className="bg-stone-850 border border-stone-800 p-2.5 rounded-lg">
          <span className="text-xl font-bold text-amber-400">{newCount}</span>
          <span className="block text-[10px] text-stone-400 font-medium">New</span>
        </div>
        <div className="bg-stone-850 border border-stone-800 p-2.5 rounded-lg">
          <span className="text-xl font-bold text-emerald-400">{bookedCount}</span>
          <span className="block text-[10px] text-stone-400 font-medium">Booked</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search name, phone, condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {/* "Add Sample" only visible to Admin role */}
          {!isStaff && (
            <button
              onClick={handleAddDemoLead}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-stone-400" />
              <span>Add Sample</span>
            </button>
          )}
          <button
            onClick={() => exportLeadsToCSV(leads, clinicName)}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 text-xs border-b border-stone-800">
        {(['all', 'new', 'contacted', 'booked', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium capitalize transition whitespace-nowrap cursor-pointer ${
              filter === tab
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            {tab}
            {tab === 'new' && newCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-full">
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lead Cards List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-stone-800 rounded-xl p-6">
          <Inbox className="w-8 h-8 text-stone-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-stone-300">No requests found</p>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Inquiries from booking modal and contact form appear here.
          </p>
          {!isStaff && (
            <button
              onClick={handleAddDemoLead}
              className="mt-3 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg inline-flex items-center gap-1.5 border border-stone-700 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-stone-400" /> Add Sample
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((lead) => {
            const isNew = lead.status === 'new';
            const isBooked = lead.status === 'booked';
            const isContacted = lead.status === 'contacted';
            const isArchived = lead.status === 'archived';
            const relTime = getRelativeTime(lead.createdAt);

            // Urgency Visual Border & Dot Styling
            let borderClass = 'border-l-4 border-l-stone-600 bg-stone-850/60 border-stone-800';
            let dotColor = 'bg-stone-500';
            let urgencyLabel = 'Archived';

            if (isNew) {
              borderClass = 'border-l-4 border-l-amber-500 bg-stone-850 border-stone-750 shadow-xs';
              dotColor = 'bg-amber-400 animate-pulse';
              urgencyLabel = 'Needs Response';
            } else if (isContacted) {
              borderClass = 'border-l-4 border-l-sky-500 bg-stone-850/80 border-stone-800';
              dotColor = 'bg-sky-400';
              urgencyLabel = 'Contacted';
            } else if (isBooked) {
              borderClass = 'border-l-4 border-l-emerald-500 bg-stone-850/70 border-stone-800';
              dotColor = 'bg-emerald-400';
              urgencyLabel = 'Booked';
            }

            const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9+]/g, '') : '';
            const emailSubject = encodeURIComponent(`Your Appointment Inquiry at ${clinicName}`);
            const emailBody = encodeURIComponent(
              `Hello ${lead.name},\n\nThank you for reaching out to ${clinicName} regarding ${lead.condition || 'your health concern'}.\n\n`
            );

            return (
              <div
                key={lead.id}
                className={`p-3.5 rounded-lg border transition ${borderClass}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100 text-xs">{lead.name}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          lead.source === 'booking'
                            ? 'bg-stone-800 text-emerald-300 border border-stone-700'
                            : 'bg-stone-800 text-stone-300 border border-stone-700'
                        }`}
                      >
                        {lead.source === 'booking' ? 'Booking' : 'Contact'}
                      </span>

                      {/* Payment Status Pill */}
                      {lead.paymentStatus && (
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                            lead.paymentStatus === 'paid_full'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : lead.paymentStatus === 'deposit_paid'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800'
                              : lead.paymentStatus === 'card_hold'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : lead.paymentStatus === 'refunded'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-stone-800 text-stone-400 border border-stone-700'
                          }`}
                        >
                          <CreditCard className="w-2.5 h-2.5" />
                          <span>
                            {lead.paymentStatus === 'deposit_paid'
                              ? `Deposit ${lead.paymentAmount || '£25'}`
                              : lead.paymentStatus === 'paid_full'
                              ? `Paid ${lead.paymentAmount || '£49'}`
                              : lead.paymentStatus === 'card_hold'
                              ? 'Card Hold'
                              : lead.paymentStatus === 'refunded'
                              ? 'Refunded'
                              : 'Pay at Clinic'}
                          </span>
                        </span>
                      )}

                      {/* Visual Urgency Dot & Label */}
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-stone-400 font-medium ml-1">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        <span>{urgencyLabel}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                      <span className="text-stone-300 font-medium">{relTime}</span>
                      <span>•</span>
                      <span>
                        {new Date(lead.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as PatientLead['status'])}
                    className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="booked">Booked</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300 my-2 pt-2 border-t border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <a
                      href={`tel:${cleanPhone}`}
                      className="hover:text-emerald-400 font-medium text-stone-200 hover:underline"
                      title="Open device dialer / softphone"
                    >
                      {lead.phone || 'No phone'}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <a
                      href={`mailto:${lead.email}?subject=${emailSubject}&body=${emailBody}`}
                      className="hover:text-emerald-400 truncate text-stone-200 hover:underline"
                      title="Compose email to patient"
                    >
                      {lead.email || 'No email'}
                    </a>
                  </div>
                  {lead.condition && (
                    <div className="col-span-1 sm:col-span-2 text-stone-300 text-xs flex flex-wrap items-center gap-1.5">
                      <span className="text-stone-500 font-medium">Service / Concern:</span>{' '}
                      {lead.serviceTitle ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 font-semibold text-[11px]">
                          {lead.serviceTitle}
                        </span>
                      ) : null}
                      <span className="text-stone-200 font-semibold">{lead.condition}</span>
                    </div>
                  )}
                  {lead.date && (
                    <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 text-xs text-stone-400">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>
                        Requested Time: <strong className="text-stone-200">{lead.date} at {lead.time}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Callback note */}
                {lead.notes && (
                  <div className="p-2.5 bg-stone-900 rounded-lg text-xs text-stone-300 mt-2 border border-stone-800">
                    <span className="text-stone-500 font-medium block text-[10px] mb-0.5 uppercase tracking-wider">
                      Callback note
                    </span>
                    <p className="whitespace-pre-line text-stone-300">{lead.notes}</p>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-800 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Call: Opens native phone dialer */}
                    <a
                      href={cleanPhone ? `tel:${cleanPhone}` : undefined}
                      className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                        cleanPhone
                          ? 'bg-stone-800 hover:bg-emerald-900/60 hover:text-emerald-300 text-stone-200 border border-stone-700'
                          : 'bg-stone-850 text-stone-500 cursor-not-allowed border border-stone-800'
                      }`}
                      title={cleanPhone ? `Call ${lead.name} (${cleanPhone})` : 'No phone number available'}
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Call</span>
                    </a>

                    {/* Email: Opens default email client with address pre-filled */}
                    <a
                      href={lead.email ? `mailto:${lead.email}?subject=${emailSubject}&body=${emailBody}` : undefined}
                      className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                        lead.email
                          ? 'bg-stone-800 hover:bg-sky-900/60 hover:text-sky-300 text-stone-200 border border-stone-700'
                          : 'bg-stone-850 text-stone-500 cursor-not-allowed border border-stone-800'
                      }`}
                      title={lead.email ? `Email ${lead.email}` : 'No email address available'}
                    >
                      <Mail className="w-3 h-3 text-sky-400" />
                      <span>Email</span>
                    </a>

                    {/* Quick Assign to Calendar button */}
                    {onAssignToCalendar && (
                      <button
                        type="button"
                        onClick={() => onAssignToCalendar(lead)}
                        className="px-2.5 py-1 rounded text-xs font-medium text-stone-400 hover:text-emerald-300 hover:bg-stone-800 transition flex items-center gap-1 cursor-pointer"
                        title="Schedule this patient into an open calendar slot"
                      >
                        <CalendarPlus className="w-3 h-3" />
                        <span className="hidden sm:inline">Schedule Slot</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="p-1 text-stone-500 hover:text-red-400 transition cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal when user changes status to 'Booked' */}
      {bookingPromptLead && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-stone-900 border border-stone-750 rounded-2xl p-5 shadow-2xl space-y-4 text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Assign to Calendar Slot?</h4>
                  <span className="text-[11px] text-stone-400">Status changed to Booked</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingPromptLead(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Do you want to assign <strong>{bookingPromptLead.name}</strong>{' '}
              ({bookingPromptLead.condition || 'Consultation'}) to a specific time slot on the doctor schedule now?
            </p>

            <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-xs space-y-1">
              <div className="text-stone-400">
                <span className="font-semibold text-stone-200">Patient:</span> {bookingPromptLead.name} ({bookingPromptLead.phone})
              </div>
              {bookingPromptLead.date && (
                <div className="text-stone-400">
                  <span className="font-semibold text-stone-200">Requested:</span> {bookingPromptLead.date} at {bookingPromptLead.time || 'Preferred time'}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={handleConfirmAssignToCalendar}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Assign to Calendar Slot</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmJustBooked}
                className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold transition cursor-pointer"
              >
                Just Mark as Booked
              </button>
            </div>
          </div>
        </div>
      )}

      {leads.length > 0 && (
        <div className="pt-2 flex justify-between items-center text-xs text-stone-500">
          <span>{leads.length} records saved on this device</span>
          {!isStaff && (
            <button
              onClick={handleClearAll}
              className="text-stone-500 hover:text-red-400 text-xs underline cursor-pointer"
            >
              Clear All Leads
            </button>
          )}
        </div>
      )}
    </div>
  );
}
