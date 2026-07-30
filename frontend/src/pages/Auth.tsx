import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useLogin, useSignup, useMagicLink } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/components/common/Toast';
import { GeometricPattern } from '@/components/common/GeometricPattern';
import type { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googlePopupRef = useRef<Window | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const login = useLogin();
  const signup = useSignup();
  const magicLink = useMagicLink();

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'AUTH_SUCCESS') {
        const storedState = sessionStorage.getItem('google_oauth_state');
        sessionStorage.removeItem('google_oauth_state');
        if (storedState && event.data.state && event.data.state !== storedState) {
          console.error('Auth: OAuth state mismatch - possible CSRF');
          showToast('Authentication failed. Please try again.');
          return;
        }
        console.log('Auth: Google OAuth success via popup', event.data.user);
        const store = useAuthStore.getState();
        store.login(event.data.user as User, event.data.token);
        setGoogleLoading(false);
        navigate('/today', { replace: true });
      } else if (event.data.type === 'AUTH_ERROR') {
        console.error('Auth: Google OAuth error via popup', event.data.error);
        showToast(event.data.error || 'Google sign-in failed');
        setGoogleLoading(false);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => {
      window.removeEventListener('message', handleAuthMessage);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setGoogleLoading(false);
    };
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { email, password };
      console.log('Auth: handleSubmit', isSignUp ? 'signup' : 'login', payload);

      if (isSignUp) {
        signup.mutate({ email, password, displayName: name }, {
          onSuccess: () => {
            console.log('Auth: Signup successful');
            showToast('Account created! Check your email.');
            setIsSignUp(false);
          },
          onError: (err: any) => {
            console.error('Auth: Signup failed', err);
            showToast(err?.message || 'Signup failed');
          },
        });
      } else {
        login.mutate(payload, {
          onSuccess: () => {
            console.log('Auth: Login successful');
          },
          onError: (err: any) => {
            console.error('Auth: Login failed', err);
            showToast(err?.message || 'Login failed');
          },
        });
      }
    } catch (error) {
      console.error('Auth: handleSubmit unexpected error', error);
      showToast('An unexpected error occurred');
    }
  };

  const handleMagicLink = () => {
    try {
      if (!magicLinkEmail) {
        console.log('Auth: Magic link email empty');
        return;
      }
      console.log('Auth: Sending magic link to', magicLinkEmail);
      magicLink.mutate(magicLinkEmail, {
        onSuccess: () => {
          console.log('Auth: Magic link sent');
          showToast('Magic link sent! Check your email.');
        },
        onError: (err: any) => {
          console.error('Auth: Magic link failed', err);
          showToast(err?.message || 'Failed to send magic link');
        },
      });
    } catch (error) {
      console.error('Auth: handleMagicLink unexpected error', error);
      showToast('An unexpected error occurred');
    }
  };

  const handleGoogleLogin = () => {
    try {
      console.log('Auth: Initiating Google OAuth flow');

      if (googlePopupRef.current && !googlePopupRef.current.closed) {
        googlePopupRef.current.focus();
        return;
      }

      setGoogleLoading(true);
      const state = crypto.randomUUID();
      sessionStorage.setItem('google_oauth_state', state);

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${API_URL}/auth/google?state=${state}`,
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!popup || popup.closed) {
        console.error('Auth: Google OAuth popup was blocked');
        sessionStorage.removeItem('google_oauth_state');
        setGoogleLoading(false);
        showToast('Please allow popups for this site to sign in with Google');
        return;
      }

      googlePopupRef.current = popup;
      console.log('Auth: Google OAuth popup opened');

      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => {
        if (!popup || popup.closed) {
          console.log('Auth: Google OAuth popup closed');
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
          googlePopupRef.current = null;
          setGoogleLoading(false);
          sessionStorage.removeItem('google_oauth_state');
        }
      }, 500);
    } catch (error) {
      console.error('Auth: Google OAuth initiation failed', error);
      setGoogleLoading(false);
      showToast('Failed to start Google sign-in. Please try again.');
    }
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
            {isSignUp && <Input label="Name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />}
            <Input label="Email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
            <Button type="submit" style={{ width: '100%' }} loading={login.isPending || signup.isPending}>{isSignUp ? 'Sign Up' : 'Log In'}</Button>
            <div className="divider" />
            <Button type="button" variant="secondary" style={{ width: '100%' }} onClick={() => setShowMagicLink(true)}><Mail size={16} /> Send Magic Link</Button>
            <Button type="button" variant="ghost" style={{ width: '100%' }} onClick={handleGoogleLogin} loading={googleLoading}>Continue with Google</Button>
            <p className="body-sm text-secondary" style={{ textAlign: 'center' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button type="button" style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'var(--weight-medium)' }} onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Log In' : 'Sign Up'}</button>
            </p>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input label="Email" type="email" autoComplete="email" value={magicLinkEmail} onChange={e => setMagicLinkEmail(e.target.value)} placeholder="you@example.com" />
            <Button onClick={handleMagicLink} style={{ width: '100%' }} loading={magicLink.isPending}>Send Magic Link</Button>
            <Button variant="ghost" onClick={() => setShowMagicLink(false)} style={{ width: '100%' }}>Back to login</Button>
          </div>
        )}
      </div>
    </div>
  );
}
