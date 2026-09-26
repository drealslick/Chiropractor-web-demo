import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  DollarSign,
  Activity,
  MessageSquare,
  Bell,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  UserCheck,
  TrendingUp,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  RefreshCw,
  Mail,
  Send,
  Sliders,
  X,
  Copy,
  Check,
  FileText,
  User,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { ClinicInfo } from '../../types';

export interface RegisteredClinic {
  id: string;
  name: string;
  doctorName: string;
  doctorCredentials?: string;
  ownerEmail: string;
  phone: string;
  city: string;
  state: string;
  planTier: 'starter' | 'pro' | 'agency';
  mrr: number; // e.g. 199, 399, 799
  status: 'active' | 'trial' | 'suspended';
  createdDate: string;
  lastActive: string;
  data: ClinicInfo;
}

export interface SupportTicket {
  id: string;
  clinicId: string;
  clinicName: string;
  senderEmail: string;
  subject: string;
  category: 'billing' | 'technical' | 'setup' | 'feature_request';
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: { sender: 'clinic' | 'operator'; text: string; time: string }[];
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'feature' | 'maintenance' | 'alert';
  targetAudience: 'all' | 'starter' | 'pro' | 'agency';
  active: boolean;
  createdAt: string;
}

interface SuperAdminConsoleProps {
  currentClinic: ClinicInfo;
  onSelectClinicToManage: (clinic: ClinicInfo) => void;
  onClose?: () => void;
}

export function SuperAdminConsole({
  currentClinic,
  onSelectClinicToManage,
  onClose,
}: SuperAdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<'registry' | 'revenue' | 'health' | 'support' | 'announcements'>('registry');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial Sample Clinic Registry Data
  const [clinics, setClinics] = useState<RegisteredClinic[]>([
    {
      id: 'columbus-vance',
      name: 'Columbus Chiropractic Care',
      doctorName: 'Dr. Marcus Vance',
      doctorCredentials: 'D.C., DACBSP',
      ownerEmail: 'dr.vance@columbuschiro.com',
      phone: '(614) 555-0192',
      city: 'Columbus',
      state: 'OH',
      planTier: 'pro',
      mrr: 399,
      status: 'active',
      createdDate: '2026-01-15',
      lastActive: '2 mins ago',
      data: { ...currentClinic },
    },
    {
      id: 'apex-jenkins',
      name: 'Apex Spine & Sports Injury',
      doctorName: 'Dr. Sarah Jenkins',
      doctorCredentials: 'D.C., CSCS',
      ownerEmail: 's.jenkins@apexspine.com',
      phone: '(512) 555-0199',
      city: 'Austin',
      state: 'TX',
      planTier: 'pro',
      mrr: 399,
      status: 'active',
      createdDate: '2026-02-01',
      lastActive: '14 mins ago',
      data: {
        ...currentClinic,
        name: 'Apex Spine & Sports Injury',
        doctorName: 'Dr. Sarah Jenkins',
        city: 'Austin',
        state: 'TX',
        phone: '(512) 555-0199',
      },
    },
    {
      id: 'pacific-miller',
      name: 'Pacific Wellness Chiropractic',
      doctorName: 'Dr. Robert Miller',
      doctorCredentials: 'D.C.',
      ownerEmail: 'rmiller@pacificwellness.org',
      phone: '(206) 555-0144',
      city: 'Seattle',
      state: 'WA',
      planTier: 'agency',
      mrr: 799,
      status: 'active',
      createdDate: '2026-02-20',
      lastActive: '1 hour ago',
      data: {
        ...currentClinic,
        name: 'Pacific Wellness Chiropractic',
        doctorName: 'Dr. Robert Miller',
        city: 'Seattle',
        state: 'WA',
      },
    },
    {
      id: 'summit-spines',
      name: 'Summit Family Chiropractic',
      doctorName: 'Dr. Elena Rostova',
      doctorCredentials: 'D.C.',
      ownerEmail: 'elena@summitspines.com',
      phone: '(303) 555-0812',
      city: 'Denver',
      state: 'CO',
      planTier: 'starter',
      mrr: 199,
      status: 'trial',
      createdDate: '2026-03-10',
      lastActive: '1 day ago',
      data: {
        ...currentClinic,
        name: 'Summit Family Chiropractic',
        doctorName: 'Dr. Elena Rostova',
        city: 'Denver',
        state: 'CO',
      },
    },
  ]);

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-102',
      clinicId: 'apex-jenkins',
      clinicName: 'Apex Spine & Sports Injury',
      senderEmail: 's.jenkins@apexspine.com',
      subject: 'How do I add a 2nd associate chiropractor to the schedule?',
      category: 'setup',
      priority: 'medium',
      status: 'open',
      createdAt: '2026-09-26 08:30',
      messages: [
        {
          sender: 'clinic',
          text: 'Hi support team! We just hired Dr. Michael and want his column to show in the Reception Day-View. Where do we add him?',
          time: '08:30 AM',
        },
      ],
    },
    {
      id: 'TICK-099',
      clinicId: 'columbus-vance',
      clinicName: 'Columbus Chiropractic Care',
      senderEmail: 'dr.vance@columbuschiro.com',
      subject: 'Question regarding custom domain SSL certificate',
      category: 'technical',
      priority: 'low',
      status: 'resolved',
      createdAt: '2026-09-24 14:15',
      messages: [
        { sender: 'clinic', text: 'Is SSL provisioned automatically when we add our CNAME?', time: '02:15 PM' },
        { sender: 'operator', text: 'Yes, Dr. Vance! Let’s Encrypt SSL provisions within 60 seconds of CNAME propagation.', time: '02:22 PM' },
      ],
    },
  ]);

  // Global Announcements State
  const [announcements, setAnnouncements] = useState<GlobalAnnouncement[]>([
    {
      id: 'ANN-1',
      title: '✨ 2D Pain Map v2 Released',
      message: 'Patients can now select cervical, thoracic, lumbar, and extremity discomfort zones directly on mobile.',
      type: 'feature',
      targetAudience: 'all',
      active: true,
      createdAt: '2026-09-25',
    },
  ]);

  // Selected Ticket for Drawer
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  // Add New Clinic Modal State
  const [isAddClinicOpen, setIsAddClinicOpen] = useState(false);
  const [newClinicForm, setNewClinicForm] = useState({
    name: '',
    doctorName: '',
    doctorCredentials: 'D.C.',
    ownerEmail: '',
    phone: '',
    city: '',
    state: '',
    planTier: 'pro' as 'starter' | 'pro' | 'agency',
  });

  // Calculate Metrics
  const totalMRR = clinics.reduce((acc, c) => acc + (c.status === 'active' ? c.mrr : 0), 0);
  const totalARR = totalMRR * 12;
  const activeCount = clinics.filter((c) => c.status === 'active').length;
  const trialCount = clinics.filter((c) => c.status === 'trial').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  const filteredClinics = clinics.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicForm.name) return;

    const newId = newClinicForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newClinicEntry: RegisteredClinic = {
      id: newId,
      name: newClinicForm.name,
      doctorName: newClinicForm.doctorName || 'Dr. Practitioner',
      doctorCredentials: newClinicForm.doctorCredentials,
      ownerEmail: newClinicForm.ownerEmail,
      phone: newClinicForm.phone || '(555) 000-0000',
      city: newClinicForm.city || 'Metropolis',
      state: newClinicForm.state || 'US',
      planTier: newClinicForm.planTier,
      mrr: newClinicForm.planTier === 'agency' ? 799 : newClinicForm.planTier === 'pro' ? 399 : 199,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just created',
      data: {
        ...currentClinic,
        name: newClinicForm.name,
        doctorName: newClinicForm.doctorName || 'Dr. Practitioner',
        doctorCredentials: newClinicForm.doctorCredentials,
        city: newClinicForm.city,
        state: newClinicForm.state,
      },
    };

    setClinics([newClinicEntry, ...clinics]);
    setIsAddClinicOpen(false);
    setNewClinicForm({
      name: '',
      doctorName: '',
      doctorCredentials: 'D.C.',
      ownerEmail: '',
      phone: '',
      city: '',
      state: '',
      planTier: 'pro',
    });
  };

  const handleSendTicketReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'in_progress' as const,
          messages: [
            ...t.messages,
            { sender: 'operator' as const, text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ],
        };
      }
      return t;
    });

    setTickets(updated);
    setSelectedTicket(updated.find((t) => t.id === selectedTicket.id) || null);
    setReplyText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 max-w-6xl mx-auto my-4 min-h-[750px] flex flex-col">
      {/* Top Cockpit Header */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-indigo-950/60 p-6 border-b border-stone-800 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-indigo-400" />
                Super Admin Operator Console
              </span>
              <span className="text-stone-400 text-xs font-mono">SaaS Platform v3.2</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>SaaS Founder Cockpit</span>
            </h2>
            <p className="text-stone-300 text-xs mt-1">
              Central command console for managing client clinics, monitoring revenue, system health, and support.
            </p>
          </div>

          {/* Operator Action Buttons & Close */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddClinicOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Clinic</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 p-2.5 rounded-xl border border-stone-700 transition"
                title="Return to Clinic View"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Global Key Stat Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-stone-800/80">
          <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-stone-400">Total Active Clinics</div>
            <div className="text-xl font-bold text-white font-serif mt-0.5 flex items-baseline gap-2">
              <span>{activeCount}</span>
              <span className="text-[10px] text-emerald-400 font-mono font-normal">+{trialCount} in trial</span>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-stone-400">Monthly Recurring (MRR)</div>
            <div className="text-xl font-bold text-emerald-400 font-serif mt-0.5">
              ${totalMRR.toLocaleString()}
              <span className="text-xs text-stone-400 font-sans font-normal ml-1">/mo</span>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-stone-400">System Uptime / Health</div>
            <div className="text-xl font-bold text-emerald-300 font-serif mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>99.98%</span>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-stone-800 p-3 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-stone-400">Open Support Tickets</div>
            <div className="text-xl font-bold text-amber-400 font-serif mt-0.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>{openTicketsCount}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-2 border-t border-stone-800/60 overflow-x-auto">
          {[
            { id: 'registry', label: 'Clinic Registry', icon: Building2, badge: clinics.length },
            { id: 'revenue', label: 'Revenue & Billing', icon: DollarSign, badge: `$${totalMRR}` },
            { id: 'health', label: 'System Health & APIs', icon: Activity, badge: 'Operational' },
            { id: 'support', label: 'Support Inbox', icon: MessageSquare, badge: openTicketsCount > 0 ? openTicketsCount : undefined },
            { id: 'announcements', label: 'Announcements & Flags', icon: Bell, badge: announcements.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                    : 'bg-stone-900/80 text-stone-400 hover:bg-stone-850 hover:text-stone-200 border border-stone-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-indigo-950 text-indigo-200' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Console Body */}
      <div className="p-6 flex-1 bg-stone-900 overflow-y-auto">
        {/* SCREEN 1: CLINIC REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-950 border border-stone-800 p-3.5 rounded-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clinics by name, doctor, or city..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-xs text-stone-400 font-bold">Status:</span>
                {(['all', 'active', 'trial', 'suspended'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`text-[11px] font-bold capitalize px-2.5 py-1 rounded-lg transition ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Registry Table */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 text-stone-400 font-bold border-b border-stone-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Clinic Name & Location</th>
                      <th className="p-3.5">Lead Practitioner</th>
                      <th className="p-3.5">Plan Tier</th>
                      <th className="p-3.5">MRR</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Last Active</th>
                      <th className="p-3.5 text-right">Actions / Impersonate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-sans">
                    {filteredClinics.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-900/60 transition group">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm group-hover:text-indigo-300 flex items-center gap-1.5">
                            <span>{c.name}</span>
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                            ID: {c.id} • {c.city}, {c.state}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-stone-200">{c.doctorName}</div>
                          <div className="text-[10px] text-stone-400">{c.ownerEmail}</div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              c.planTier === 'agency'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                                : c.planTier === 'pro'
                                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                                : 'bg-stone-850 text-stone-300 border border-stone-750'
                            }`}
                          >
                            {c.planTier}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold font-mono text-emerald-400 text-sm">
                          ${c.mrr}/mo
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                              c.status === 'active'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : c.status === 'trial'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-red-950 text-red-300 border border-red-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.status === 'active' ? 'bg-emerald-400' : c.status === 'trial' ? 'bg-amber-400' : 'bg-red-400'
                              }`}
                            />
                            {c.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-stone-400 text-[11px] font-mono">{c.lastActive}</td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => onSelectClinicToManage(c.data)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition shadow-sm cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Impersonate & Launch</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: REVENUE & BILLING */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-5">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Annual Run Rate (ARR)</div>
                <div className="text-2xl font-serif font-bold text-emerald-400 mt-2">${totalARR.toLocaleString()}</div>
                <div className="text-xs text-stone-400 mt-1">Based on ${totalMRR} current MRR</div>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-5">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Average Revenue / Clinic (ARPU)</div>
                <div className="text-2xl font-serif font-bold text-white mt-2">
                  ${activeCount > 0 ? Math.round(totalMRR / activeCount) : 0}/mo
                </div>
                <div className="text-xs text-stone-400 mt-1">Across {activeCount} paying clinics</div>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-5">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Net Monthly Churn</div>
                <div className="text-2xl font-serif font-bold text-emerald-300 mt-2">0.0%</div>
                <div className="text-xs text-stone-400 mt-1">Zero cancellations past 30 days</div>
              </div>
            </div>

            {/* Revenue Ledger */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Subscription Ledger & Invoice Records</span>
              </h3>
              <div className="space-y-2 text-xs">
                {clinics.map((c) => (
                  <div key={c.id} className="bg-stone-900 p-3 rounded-xl border border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        Plan: {c.planTier.toUpperCase()} • Billing email: {c.ownerEmail}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400 font-mono">${c.mrr}.00 / mo</div>
                      <div className="text-[10px] text-stone-400">Renews Oct 15, 2026</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: SYSTEM HEALTH */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Firestore Database Latency
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-800">
                    24ms • 100% HEALTHY
                  </span>
                </div>
                <p className="text-xs text-stone-400">Multi-tenant document partition active across all clinic records.</p>
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Twilio SMS & Resend Gateway
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-800">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-stone-400">Patient text reminders & email dispatch servers operating normally.</p>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: SUPPORT INBOX */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-3">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Incoming Clinic Support Tickets</div>
              {tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicket(t)}
                  className={`w-full p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedTicket?.id === t.id
                      ? 'bg-indigo-950/80 border-indigo-500 text-white'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-stone-400">{t.id}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.2 rounded-full ${
                        t.status === 'open'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white mt-1 truncate">{t.subject}</div>
                  <div className="text-[10px] text-stone-400 mt-1">{t.clinicName}</div>
                </button>
              ))}
            </div>

            {/* Ticket Thread Drawer */}
            <div className="lg:col-span-2 bg-stone-950 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between min-h-[400px]">
              {selectedTicket ? (
                <>
                  <div className="space-y-4">
                    <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{selectedTicket.subject}</h4>
                        <div className="text-xs text-stone-400 mt-0.5">
                          From {selectedTicket.clinicName} ({selectedTicket.senderEmail})
                        </div>
                      </div>
                      <span className="text-xs text-stone-400 font-mono">{selectedTicket.createdAt}</span>
                    </div>

                    <div className="space-y-3 max-h-[250px] overflow-y-auto p-2">
                      {selectedTicket.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl text-xs ${
                            m.sender === 'operator'
                              ? 'bg-indigo-950/80 border border-indigo-800 text-indigo-100 ml-6'
                              : 'bg-stone-900 border border-stone-800 text-stone-200 mr-6'
                          }`}
                        >
                          <div className="text-[10px] font-bold text-stone-400 mb-1">
                            {m.sender === 'operator' ? 'You (SaaS Operator)' : selectedTicket.clinicName} • {m.time}
                          </div>
                          <div>{m.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type reply to clinic owner..."
                      className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleSendTicketReply}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-stone-500 text-xs">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                  <span>Select a ticket from the left panel to reply</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Global Platform Announcements & Broadcasts</span>
              </h3>
              <p className="text-xs text-stone-400">
                Push update notifications directly to all clinic admin workspaces (e.g. feature releases, maintenance notes).
              </p>

              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{a.title}</div>
                      <div className="text-xs text-stone-300 mt-1">{a.message}</div>
                      <div className="text-[10px] text-stone-400 font-mono mt-2">
                        Target: {a.targetAudience.toUpperCase()} • Created: {a.createdAt}
                      </div>
                    </div>
                    <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PROVISION NEW CLINIC MODAL */}
      {isAddClinicOpen && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-lg w-full space-y-4 text-stone-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Provision New Client Clinic</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddClinicOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClinic} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={newClinicForm.name}
                  onChange={(e) => setNewClinicForm({ ...newClinicForm, name: e.target.value })}
                  placeholder="e.g. Apex Health Chiropractic"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Lead Doctor Name</label>
                  <input
                    type="text"
                    value={newClinicForm.doctorName}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Credentials</label>
                  <input
                    type="text"
                    value={newClinicForm.doctorCredentials}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, doctorCredentials: e.target.value })}
                    placeholder="e.g. D.C., DACBSP"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Owner Email</label>
                  <input
                    type="email"
                    value={newClinicForm.ownerEmail}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, ownerEmail: e.target.value })}
                    placeholder="doctor@apexhealth.com"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newClinicForm.phone}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, phone: e.target.value })}
                    placeholder="(512) 555-0199"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-300 mb-1">City</label>
                  <input
                    type="text"
                    value={newClinicForm.city}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, city: e.target.value })}
                    placeholder="Austin"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 mb-1">State</label>
                  <input
                    type="text"
                    value={newClinicForm.state}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, state: e.target.value })}
                    placeholder="TX"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-300 mb-1">Plan Tier</label>
                  <select
                    value={newClinicForm.planTier}
                    onChange={(e) => setNewClinicForm({ ...newClinicForm, planTier: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="starter">Starter ($199/mo)</option>
                    <option value="pro">Pro ($399/mo)</option>
                    <option value="agency">Agency ($799/mo)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClinicOpen(false)}
                  className="bg-stone-800 text-stone-300 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-indigo-950/60"
                >
                  Create & Register Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
