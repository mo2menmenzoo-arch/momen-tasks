import { useState } from 'react';
import { User, UserPlus, Moon, Sun, Monitor, Bell, Download, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { useUser, useLogout, useCreateMember } from '@/hooks/useAuth';
import { usersApi } from '@/api/users';
import { showToast } from '@/components/common/Toast';

export function Profile() {
  const { user: authUser, setUser } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const { data: user } = useUser();
  const logout = useLogout();
  const createMember = useCreateMember();
  const [displayName, setDisplayName] = useState(user?.displayName || authUser?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.updateMe({ displayName });
      setUser(updated);
      showToast('Profile updated');
    } catch { showToast('Failed to update profile'); }
    setSaving(false);
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim() || !newMemberPassword) return;
    try {
      await createMember.mutateAsync({
        displayName: newMemberName.trim(),
        password: newMemberPassword,
      });
      showToast(`${newMemberName.trim()} added! Share the password with them.`);
      setNewMemberName('');
      setNewMemberPassword('');
    } catch (err: any) {
      showToast(err?.message || 'Failed to add member');
    }
  };

  const handleExport = async () => {
    try {
      const result = await usersApi.exportData('json');
      showToast(result.message);
    } catch { showToast('Export failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 className="heading-2xl">Profile</h1>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="white" />
          </div>
          <div>
            <div className="heading-lg">{user?.displayName || 'User'}</div>
            <div className="body-sm text-secondary">{user?.email}</div>
          </div>
        </div>
        <Input label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h3 className="heading-lg">Appearance</h3>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {([['dark', Moon], ['light', Sun], ['auto', Monitor]] as const).map(([mode, Icon]) => (
            <button key={mode} className={`chip ${theme === mode ? 'chip-active' : ''}`} onClick={() => setTheme(mode)}>
              <Icon size={14} /> {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h3 className="heading-lg">Family</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <UserPlus size={20} style={{ color: 'var(--accent-primary)' }} />
          <p className="body-sm text-secondary">Add a family member so they can use Momen from their own phone with their own password.</p>
        </div>
        <Input label="Their Name" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="e.g. Mom" />
        <Input
          label="Their Password"
          type="password"
          value={newMemberPassword}
          onChange={e => setNewMemberPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <Button onClick={handleAddMember} loading={createMember.isPending} disabled={!newMemberName.trim() || !newMemberPassword}>Add Family Member</Button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h3 className="heading-lg">Actions</h3>
        <Button variant="secondary" onClick={handleExport} style={{ width: '100%', justifyContent: 'flex-start' }}><Download size={16} /> Export Data</Button>
        <Button variant="ghost" onClick={() => logout.mutate()} style={{ width: '100%', justifyContent: 'flex-start' }}><LogOut size={16} /> Log Out</Button>
        <Button variant="danger" onClick={() => { if (confirm('Are you sure? This cannot be undone.')) usersApi.deleteAccount().then(() => { showToast('Account scheduled for deletion'); logout.mutate(); }); }} style={{ width: '100%', justifyContent: 'flex-start' }}><Trash2 size={16} /> Delete Account</Button>
      </div>
    </div>
  );
}
