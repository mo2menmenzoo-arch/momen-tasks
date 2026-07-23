import { useState } from 'react';
import { User, Moon, Sun, Monitor, Bell, Download, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { useUser, useLogout } from '@/hooks/useAuth';
import { usersApi } from '@/api/users';
import { showToast } from '@/components/common/Toast';

export function Profile() {
  const { user: authUser, setUser } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const { data: user } = useUser();
  const logout = useLogout();
  const [displayName, setDisplayName] = useState(user?.displayName || authUser?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.updateMe({ displayName });
      setUser(updated);
      showToast('Profile updated');
    } catch { showToast('Failed to update profile'); }
    setSaving(false);
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
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
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

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h3 className="heading-lg">Actions</h3>
        <Button variant="secondary" onClick={handleExport} style={{ width: '100%', justifyContent: 'flex-start' }}><Download size={16} /> Export Data</Button>
        <Button variant="ghost" onClick={() => logout.mutate()} style={{ width: '100%', justifyContent: 'flex-start' }}><LogOut size={16} /> Log Out</Button>
        <Button variant="danger" onClick={() => { if (confirm('Are you sure? This cannot be undone.')) usersApi.deleteAccount().then(() => { showToast('Account scheduled for deletion'); logout.mutate(); }); }} style={{ width: '100%', justifyContent: 'flex-start' }}><Trash2 size={16} /> Delete Account</Button>
      </div>
    </div>
  );
}
