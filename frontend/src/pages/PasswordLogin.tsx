import { useState } from 'react';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useMembers, useMemberLogin, useCreateMember } from '@/hooks/useAuth';
import { showToast } from '@/components/common/Toast';
import { GeometricPattern } from '@/components/common/GeometricPattern';

interface Member {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

function MemberAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      aria-hidden="true"
      style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-full)',
        background: 'var(--accent-primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--weight-semibold)',
        margin: '0 auto',
      }}
    >
      {initial}
    </div>
  );
}

export function PasswordLogin() {
  const [selected, setSelected] = useState<Member | null>(null);
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [firstPassword, setFirstPassword] = useState('');

  const { data: members, isLoading } = useMembers();
  const memberLogin = useMemberLogin();
  const createMember = useCreateMember();

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    memberLogin.mutate(
      { memberId: selected.id, password },
      {
        onError: (err: any) => {
          console.error('Login failed', err);
          showToast(err?.message || 'Wrong password, try again');
        },
      },
    );
  };

  const handleCreateFirst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !firstPassword) return;
    try {
      const user = await createMember.mutateAsync({
        displayName: firstName.trim(),
        password: firstPassword,
      });
      showToast(`Welcome, ${user.displayName}!`);
      memberLogin.mutate({ memberId: user.id, password: firstPassword });
    } catch (err: any) {
      console.error('Failed to create account', err);
      showToast(err?.message || 'Could not create the account');
    }
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
        <p className="body-md text-secondary">Loading family…</p>
      </main>
    );
  }

  const hasMembers = !!members && members.length > 0;

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', position: 'relative' }}>
      <GeometricPattern subtle />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {selected ? (
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setSelected(null); setPassword(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                marginBottom: 'var(--space-6)', padding: 'var(--space-2)', minHeight: 44,
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <MemberAvatar name={selected.displayName || 'Member'} />
            </div>
            <h1 className="heading-2xl" style={{ marginBottom: 'var(--space-1)' }}>{selected.displayName || 'Member'}</h1>
            <p className="body-sm text-secondary" style={{ marginBottom: 'var(--space-6)' }}>Enter their password to see their tasks</p>
            <form onSubmit={handleMemberLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input
                label="Password"
                type="password"
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Their password"
                required
                autoComplete="current-password"
              />
              <Button type="submit" style={{ width: '100%' }} loading={memberLogin.isPending}>Enter</Button>
            </form>
          </div>
        ) : creating || !hasMembers ? (
          <div style={{ textAlign: 'center' }}>
            <h1 className="heading-2xl" style={{ marginBottom: 'var(--space-2)' }}>{creating ? 'Add a Family Member' : 'Welcome to Momen'}</h1>
            <p className="body-md text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
              {creating ? 'Give this person a name and a password.' : 'Create the first account to get started.'}
            </p>
            <form onSubmit={handleCreateFirst} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Input label="Name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Mom" required />
              <Input
                label="Password"
                type="password"
                value={firstPassword}
                onChange={e => setFirstPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
              />
              <Button type="submit" style={{ width: '100%' }} loading={createMember.isPending || memberLogin.isPending}>
                {creating ? 'Add Member' : 'Create My Account'}
              </Button>
              {creating && (
                <Button type="button" variant="ghost" onClick={() => setCreating(false)} style={{ width: '100%' }}>Back</Button>
              )}
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <Users size={32} style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            </div>
            <h1 className="heading-2xl" style={{ marginBottom: 'var(--space-2)' }}>Who's using Momen?</h1>
            <p className="body-md text-secondary" style={{ marginBottom: 'var(--space-6)' }}>Pick a name and enter their password</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {members?.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className="card card-interactive"
                  onClick={() => { setSelected(m); setPassword(''); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-4)', cursor: 'pointer', background: 'none', border: '1px solid var(--border-subtle)',
                  }}
                >
                  <MemberAvatar name={m.displayName || 'Member'} />
                  <span className="body-sm" style={{ fontWeight: 'var(--weight-medium)' }}>{m.displayName || 'Member'}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => { setCreating(true); setFirstName(''); setFirstPassword(''); }}>
              + Add a family member
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
