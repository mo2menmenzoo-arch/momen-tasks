import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useLogin, useSignup, useMagicLink } from '@/hooks/useAuth';
import { showToast } from '@/components/common/Toast';
import { GeometricPattern } from '@/components/common/GeometricPattern';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
const FRONTEND_URL = window.location.origin;

export function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);

  const login = useLogin();
  const signup = useSignup();
  const magicLink = useMagicLink();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      signup.mutate({ email, password, displayName: name }, {
        onSuccess: () => { showToast('Account created! Check your email.'); setIsSignUp(false); },
        onError: (err: any) => showToast(err.message || 'Signup failed'),
      });
    } else {
      login.mutate({ email, password }, {
        onError: (err: any) => showToast(err.message || 'Login failed'),
      });
    }
  };

  const handleMagicLink = () => {
    if (!magicLinkEmail) return;
    magicLink.mutate(magicLinkEmail, {
      onSuccess: () => showToast('Magic link sent! Check your email.'),
      onError: (err: any) => showToast(err.message || 'Failed to send magic link'),
    });
  };

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${API_URL}/auth/google`,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    const interval = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 500);
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', position: 'relative' }}>
      <GeometricPattern subtle />
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 className="heading-3xl" style={{ marginBottom: 'var(--space-2)' }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="body-md text-secondary">{isSignUp ? 'Start your journey to clarity' : 'Sign in to continue'}</p>
        </div>
        {!showMagicLink ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {isSignUp && <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />}
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
            <Button type="submit" style={{ width: '100%' }} disabled={login.isPending || signup.isPending}>{isSignUp ? 'Sign Up' : 'Log In'}</Button>
            <div className="divider" />
            <Button variant="secondary" style={{ width: '100%' }} onClick={() => setShowMagicLink(true)}><Mail size={16} /> Send Magic Link</Button>
            <Button variant="ghost" style={{ width: '100%' }} onClick={handleGoogleLogin}>Continue with Google</Button>
            <p className="body-sm text-secondary" style={{ textAlign: 'center' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'var(--weight-medium)' }} onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Log In' : 'Sign Up'}</button>
            </p>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input label="Email" type="email" value={magicLinkEmail} onChange={e => setMagicLinkEmail(e.target.value)} placeholder="you@example.com" />
            <Button onClick={handleMagicLink} style={{ width: '100%' }} disabled={magicLink.isPending}>Send Magic Link</Button>
            <Button variant="ghost" onClick={() => setShowMagicLink(false)} style={{ width: '100%' }}>Back to login</Button>
          </div>
        )}
      </div>
    </div>
  );
}
