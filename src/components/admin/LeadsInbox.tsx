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

interface LeadsInboxProps {
  clinicName: string;
}

export function LeadsInbox({ clinicName }: LeadsInboxProps) {
  const [leads, setLeads] = useState<PatientLead[]>(getStoredLeads);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'booked' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    const updated = updateLeadStatus(id, status);
    setLeads(updated);
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
        <div className="bg-stone-800/80 border border-stone-700/60 p-2.5 rounded-xl">
          <span className="text-xl font-bold text-stone-100">{leads.length}</span>
          <span className="block text-[10px] text-stone-400 font-medium">Demo Requests</span>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-800/50 p-2.5 rounded-xl">
          <span className="text-xl font-bold text-emerald-400">{newCount}</span>
          <span className="block text-[10px] text-emerald-300 font-medium">Needs Review</span>
        </div>
        <div className="bg-blue-950/60 border border-blue-800/50 p-2.5 rounded-xl">
          <span className="text-xl font-bold text-blue-400">{bookedCount}</span>
          <span className="block text-[10px] text-blue-300 font-medium">Demo Bookings</span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search demo name, phone, concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleAddDemoLead}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            title="Simulate sample inquiry for presentation"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generate Demo Lead</span>
          </button>
          <button
            onClick={() => exportLeadsToCSV(leads, clinicName)}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
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
            className={`px-3 py-1.5 rounded-lg font-medium capitalize transition whitespace-nowrap ${
              filter === tab
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            {tab}
            {tab === 'new' && newCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-500 text-stone-950 font-bold text-[10px] rounded-full">
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lead Cards List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-stone-800 rounded-2xl p-6">
          <Inbox className="w-10 h-10 text-stone-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-300">No demo requests found</p>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            This tab simulates patient lead capture. If secure external Booking is active, patients are guided directly to JaneApp / Calendly.
          </p>
          <button
            onClick={handleAddDemoLead}
            className="mt-4 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg inline-flex items-center gap-1.5 border border-stone-700 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> Simulate Demo Booking
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const isNew = lead.status === 'new';
            return (
              <div
                key={lead.id}
                className={`p-4 rounded-xl border transition ${
                  isNew
                    ? 'bg-stone-800/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : 'bg-stone-800/50 border-stone-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-100 text-sm">{lead.name}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          lead.source === 'booking'
                            ? 'bg-purple-950/70 text-purple-300 border border-purple-800/50'
                            : 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                        }`}
                      >
                        {lead.source === 'booking' ? 'Appointment Request' : 'Contact Form'}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {new Date(lead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as PatientLead['status'])}
                    className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="new">🔴 New / Unread</option>
                    <option value="contacted">🟡 Contacted</option>
                    <option value="booked">🟢 Booked Visit</option>
                    <option value="archived">⚪ Archived</option>
                  </select>
                </div>

                {/* Patient Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300 my-2 pt-2 border-t border-stone-700/40">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a href={`tel:${lead.phone}`} className="hover:text-emerald-400 font-medium">
                      {lead.phone || 'No phone provided'}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="hover:text-emerald-400 truncate">
                      {lead.email || 'No email provided'}
                    </a>
                  </div>
                  {lead.condition && (
                    <div className="col-span-1 sm:col-span-2 text-stone-300 text-xs">
                      <span className="text-stone-500 font-medium">Concern:</span>{' '}
                      <span className="text-emerald-300 font-medium">{lead.condition}</span>
                    </div>
                  )}
                  {lead.date && (
                    <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 text-xs text-stone-400">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      <span>
                        Requested Time: <strong className="text-stone-200">{lead.date} at {lead.time}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Callback note */}
                {lead.notes && (
                  <div className="p-2.5 bg-stone-900/60 rounded-lg text-xs text-stone-300 mt-2 border border-stone-700/40">
                    <span className="text-stone-500 font-semibold block text-[10px] mb-0.5 uppercase tracking-wider">
                      Callback note
                    </span>
                    <p className="whitespace-pre-line text-stone-300 leading-relaxed">{lead.notes}</p>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-700/40 text-xs">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="px-2.5 py-1 bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 rounded text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call Patient
                    </a>
                    <a
                      href={`mailto:${lead.email}?subject=Your Consultation at ${clinicName}`}
                      className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded text-[11px] flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </div>

                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="p-1 text-stone-500 hover:text-red-400 transition"
                    title="Delete lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {leads.length > 0 && (
        <div className="pt-2 flex justify-between items-center text-xs text-stone-500">
          <span>{leads.length} records saved on this device</span>
          <button
            onClick={handleClearAll}
            className="text-stone-500 hover:text-red-400 text-xs underline"
          >
            Clear All Leads
          </button>
        </div>
      )}
    </div>
  );
}
