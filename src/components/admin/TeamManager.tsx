import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  Sparkles,
  Info,
  Key,
} from 'lucide-react';
import { ClinicInfo } from '../../types';

export type UserRole = 'admin' | 'editor' | 'staff';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

interface TeamManagerProps {
  clinic: ClinicInfo;
  onUpdateClinic: (updated: ClinicInfo) => void;
  activeRolePreview: UserRole;
  onSelectRolePreview: (role: UserRole) => void;
}

const defaultTeam: TeamMember[] = [
  {
    id: 'u-1',
    name: 'Dr. Marcus Vance',
    email: 'marcus@vancechiro.com',
    role: 'admin',
    title: 'Lead Chiropractic Physician & Practice Owner',
    isCurrentUser: true,
  },
  {
    id: 'u-2',
    name: 'Sarah Jenkins',
    email: 'frontdesk@vancechiro.com',
    role: 'staff',
    title: 'Front Desk Coordinator & Patient Intake',
  },
  {
    id: 'u-3',
    name: 'Alex Rivera',
    email: 'content@vancechiro.com',
    role: 'editor',
    title: 'Marketing & Content Editor',
  },
];

export const TeamManager: React.FC<TeamManagerProps> = ({
  clinic,
  onUpdateClinic,
  activeRolePreview,
  onSelectRolePreview,
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    return clinic.customTeamMembers && clinic.customTeamMembers.length > 0
      ? clinic.customTeamMembers
      : defaultTeam;
  });

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberTitle, setNewMemberTitle] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('staff');
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const roleDefinitions: Record<
    UserRole,
    { title: string; color: string; badgeBg: string; description: string; permissions: string[] }
  > = {
    admin: {
      title: 'Administrator (Full Access)',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      description: 'Unrestricted control over clinical fees, design palettes, SEO, team accounts, backups, and leads.',
      permissions: [
        'Edit Branding, Hex Colors & Font Pairings',
        'Modify Exam Fees & Business Information',
        'Manage Leads & EHR Booking Integrations',
        'Edit All Content, Blog & Discomfort Selector',
        'Add & Remove Team Accounts',
        'Export & Restore Blueprints',
      ],
    },
    editor: {
      title: 'Content Editor (Copy & Blog)',
      color: 'text-blue-400',
      badgeBg: 'bg-blue-950 text-blue-300 border-blue-800',
      description: 'Can edit patient educational content, write blog articles, update FAQs, and adjust photo assets without altering fees or brand styling.',
      permissions: [
        'Create & Publish Blog Articles',
        'Edit Headline Copy & Value Descriptions',
        'Customize Discomfort Protocols & Conditions',
        'Manage Patient Reviews & FAQs',
        'Upload Photos & Alt Tags',
      ],
    },
    staff: {
      title: 'Staff / Front Desk (Leads & Booking)',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-950 text-amber-300 border-amber-800',
      description: 'Ideal for receptionists. Confined to viewing patient inquiries, contacting new leads, and verifying booking requests. Cannot alter site structure or design.',
      permissions: [
        'View & Export Patient Leads (CRM)',
        'Change Lead Triage Status (Contacted / Booked)',
        'Check Booking System Integrations',
        'View Executive Performance Overview',
      ],
    },
  };

  const handleSaveTeam = (updatedList: TeamMember[]) => {
    setTeamMembers(updatedList);
    onUpdateClinic({
      ...clinic,
      customTeamMembers: updatedList,
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      alert('Please provide name and email.');
      return;
    }

    const newMember: TeamMember = {
      id: `u-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      title: newMemberTitle.trim() || (newMemberRole === 'staff' ? 'Receptionist' : 'Team Member'),
      role: newMemberRole,
    };

    const updated = [...teamMembers, newMember];
    handleSaveTeam(updated);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberTitle('');
    setShowAddForm(false);
    setNotification(`Added ${newMember.name} as ${roleDefinitions[newMember.role].title}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Remove team member "${name}"?`)) {
      const updated = teamMembers.filter((m) => m.id !== id);
      handleSaveTeam(updated);
      setNotification(`Removed ${name}.`);
      setTimeout(() => setNotification(null), 2500);
    }
  };

  const handleRoleChange = (id: string, role: UserRole) => {
    const updated = teamMembers.map((m) => (m.id === id ? { ...m, role } : m));
    handleSaveTeam(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Team Management & Role-Based Permissions</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure access tiers for receptionists, editors, and clinical doctors with dedicated permission boundaries.
          </p>
        </div>

        {notification && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Role Simulator Live Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-950 border border-stone-800 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Active Admin Role Simulator
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            Test navigation restrictions as experienced by staff or editors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(['admin', 'editor', 'staff'] as UserRole[]).map((r) => {
            const isActive = activeRolePreview === r;
            const def = roleDefinitions[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => onSelectRolePreview(r)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500/50'
                    : 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold capitalize">{r}</span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[10px] text-stone-400 mt-1 leading-tight">{def.title}</p>
              </button>
            );
          })}
        </div>

        {activeRolePreview !== 'admin' && (
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Simulating <strong>{roleDefinitions[activeRolePreview].title}</strong> view: restricted sidebar tabs will be locked or hidden.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectRolePreview('admin')}
              className="text-[11px] underline font-semibold text-amber-300 hover:text-white cursor-pointer"
            >
              Reset to Full Admin
            </button>
          </div>
        )}
      </div>

      {/* Role Descriptions Accordion / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.entries(roleDefinitions) as [UserRole, typeof roleDefinitions['admin']][]).map(
          ([roleKey, def]) => (
            <div key={roleKey} className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${def.color}`}>
                  {roleKey}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${def.badgeBg}`}>
                  {roleKey === 'admin' ? 'Owner' : roleKey === 'editor' ? 'Marketing' : 'Front Desk'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">{def.description}</p>
              <div className="pt-2 border-t border-stone-800 space-y-1">
                <span className="text-[10px] font-bold text-stone-300 block uppercase">Permissions:</span>
                <ul className="space-y-1">
                  {def.permissions.slice(0, 3).map((perm, idx) => (
                    <li key={idx} className="text-[10px] text-stone-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </div>

      {/* Team Member List */}
      <div className="p-4 sm:p-5 bg-stone-850 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Active Practice Accounts ({teamMembers.length})
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Users assigned to this practice workspace and their permission levels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Team Member'}</span>
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddMember}
            className="p-4 bg-stone-900 border border-stone-750 rounded-xl space-y-3 animate-fade-in"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Invite New Team Member</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Miller"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-750 rounded-lg p-2 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jessica@clinic.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-stone-850 border border-stone-750 rounded-lg p-2 text-stone-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">Role / Access Level</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="w-full bg-stone-850 border border-stone-750 rounded-lg p-2 text-stone-200 text-xs cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  <option value="staff">Staff (Leads & Booking only)</option>
                  <option value="editor">Editor (Content & Blog)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* Members Table */}
        <div className="space-y-2">
          {teamMembers.map((member) => {
            const def = roleDefinitions[member.role];
            return (
              <div
                key={member.id}
                className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-xs text-stone-200">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-100">{member.name}</span>
                      {member.isCurrentUser && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                    className="bg-stone-850 border border-stone-750 text-stone-200 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer focus:outline-none focus:border-emerald-500"
                  >
                    <option value="admin">Admin (Full Access)</option>
                    <option value="editor">Editor (Content & Blog)</option>
                    <option value="staff">Staff (Front Desk)</option>
                  </select>

                  {!member.isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition cursor-pointer"
                      title="Remove Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
