import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../../lib/firebase';
import { getActiveClinicId } from '../../data/ClinicContext';

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
}
interface Invitation {
  inviteId: string;
  token: string;
  email: string;
}
const roles = ['staff', 'practitioner', 'editor', 'admin'];

export function LiveTeamManager() {
  const clinicId = getActiveClinicId();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    setLoading(true);
    setLoadError('');
    return onSnapshot(
      collection(db, 'clinics', clinicId, 'members'),
      (snapshot) => {
        setMembers(
          snapshot.docs
            .map((doc) => ({ ...doc.data(), id: doc.id }) as Member)
            .filter((member) => member.status === 'active')
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
        setLoadError(
          'Team accounts could not be loaded. Check your connection and administrator permissions.'
        );
      }
    );
  }, [clinicId, reload]);

  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await operation();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The account update failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const invite = (event: React.FormEvent) => {
    event.preventDefault();
    void run(async () => {
      setInvitation(null);
      const result = await httpsCallable<object, Invitation & { success: boolean }>(
        functions,
        'inviteStaffMember'
      )({ clinicId, email: email.trim(), name: name.trim(), role });
      if (!result.data.success || !result.data.token || !result.data.inviteId)
        throw new Error('Invitation was not confirmed by the server.');
      setInvitation({ ...result.data, email: email.trim() });
      setNotice(
        'Invitation created. No email was sent. Share the details securely with this person.'
      );
    });
  };

  const updateRole = (member: Member, newRole: string) => {
    if (
      !window.confirm(
        `Change ${member.email} to ${newRole}? This changes their account permissions.`
      )
    )
      return;
    void run(async () => {
      await httpsCallable(
        functions,
        'updateStaffRole'
      )({ clinicId, targetUid: member.id, newRole });
      setNotice(
        'Role updated by the server. The member must refresh their session to receive the new role.'
      );
    });
  };
  const remove = (member: Member) => {
    if (!window.confirm(`Deactivate ${member.email} and revoke their future session refreshes?`))
      return;
    void run(async () => {
      await httpsCallable(functions, 'removeStaffMember')({ clinicId, targetUid: member.id });
      setNotice(
        'Account deactivated and refresh tokens revoked. Existing ID tokens may remain valid until they expire.'
      );
    });
  };
  const fieldClass = 'w-full rounded-lg bg-stone-950 border border-stone-700 p-3 text-sm';
  return (
    <section className="space-y-6" aria-labelledby="team-heading">
      <header>
        <h3 id="team-heading" className="text-xl font-bold">
          Team access
        </h3>
        <p className="mt-2 text-sm text-stone-300">
          Manage verified accounts for this clinic. Account changes are confirmed by the server.
        </p>
      </header>
      {(error || loadError) && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-950 border border-rose-800 text-rose-200"
        >
          <p>{error || loadError}</p>
          {loadError && (
            <button
              type="button"
              className="underline mt-2"
              onClick={() => setReload((value) => value + 1)}
            >
              Retry loading team
            </button>
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="p-4 rounded-xl bg-stone-800 text-sm">
          {notice}
        </p>
      )}
      <div aria-busy={loading} className="space-y-3">
        {loading ? (
          <p role="status">Loading team accounts…</p>
        ) : !loadError && members.length === 0 ? (
          <p className="p-4 bg-stone-800 rounded-xl">
            No active membership records. Invite a team member to get started.
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="p-4 border border-stone-700 rounded-xl flex flex-col sm:flex-row gap-3 sm:items-center"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold break-words">
                  {member.name || member.email}
                  {member.id === auth.currentUser?.uid ? ' (You)' : ''}
                </p>
                <p className="text-sm text-stone-300 break-all">{member.email}</p>
              </div>
              <label className="text-sm">
                Role
                <select
                  aria-label={`Role for ${member.email}`}
                  value={member.role}
                  disabled={busy || member.id === auth.currentUser?.uid}
                  onChange={(event) => updateRole(member, event.target.value)}
                  className={`${fieldClass} mt-1`}
                >
                  {roles.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={busy || member.id === auth.currentUser?.uid}
                onClick={() => remove(member)}
                className="px-3 py-3 text-sm border border-rose-800 text-rose-200 rounded-lg disabled:opacity-40"
              >
                Deactivate
              </button>
            </div>
          ))
        )}
      </div>
      <form onSubmit={invite} className="space-y-4 p-4 rounded-xl border border-stone-700">
        <h4 className="font-bold">Create an invitation</h4>
        <p className="text-sm text-stone-300">
          The recipient needs an account with this verified email. They can accept through “Accept a
          staff invitation” on the admin sign-in screen. Invitations expire after seven days.
        </p>
        <label className="block text-sm">
          Name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className={`${fieldClass} mt-1`}
          />
        </label>
        <label className="block text-sm">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className={`${fieldClass} mt-1`}
          >
            {roles.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={busy || Boolean(loadError)}
          type="submit"
          className="px-4 py-3 bg-emerald-700 rounded-lg font-semibold disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Create invitation'}
        </button>
        {invitation && (
          <div className="space-y-3 text-sm p-4 bg-stone-950 rounded-lg">
            <p>Share these details only with {invitation.email}. No invitation email has been sent.</p>
            <label className="block">
              Clinic ID
              <input readOnly value={clinicId} className={`${fieldClass} mt-1`} />
            </label>
            <label className="block">
              Invitation ID
              <input readOnly value={invitation.inviteId} className={`${fieldClass} mt-1`} />
            </label>
            <label className="block">
              Invitation token
              <input
                readOnly
                type="password"
                value={invitation.token}
                className={`${fieldClass} mt-1`}
              />
            </label>
            <button
              type="button"
              className="underline"
              onClick={() => {
                void navigator.clipboard
                  .writeText(
                    `Clinic: ${clinicId}\nInvitation: ${invitation.inviteId}\nToken: ${invitation.token}`
                  )
                  .then(
                    () =>
                      setNotice(
                        'Invitation details copied. Share them securely with the recipient.'
                      ),
                    () =>
                      setError(
                        'Clipboard unavailable. Select and copy the invitation fields manually.'
                      )
                  );
              }}
            >
              Copy invitation details
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
