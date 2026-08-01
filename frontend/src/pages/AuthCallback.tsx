import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/components/common/Toast';
import type { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function fetchTokenViaRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken || null;
  } catch {
    return null;
  }
}

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');
    const oauthState = searchParams.get('state');

    console.log('AuthCallback: Processing OAuth callback', { hasUser: !!userStr, error });

    if (error) {
      console.error('AuthCallback: OAuth error received', error);
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_ERROR', error }, window.location.origin);
        window.close();
      } else {
        navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      }
      return;
    }

    if (!userStr) {
      console.error('AuthCallback: Missing user parameter');
      const msg = 'Invalid sign-in response';
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_ERROR', error: msg }, window.location.origin);
        window.close();
      } else {
        showToast(msg);
        navigate('/login', { replace: true });
      }
      return;
    }

    const doAuth = async () => {
      try {
        const user: User = JSON.parse(userStr);
        const token = await fetchTokenViaRefresh();

        if (!token) {
          throw new Error('Failed to obtain access token');
        }

        console.log('AuthCallback: Login successful', user.email);

        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_SUCCESS', user, token, state: oauthState }, window.location.origin);
          window.close();
        } else {
          login(user, token);
          navigate('/today', { replace: true });
        }
      } catch (err: any) {
        console.error('AuthCallback: Auth failed', err);
        const msg = err?.message || 'Failed to process sign-in';
        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_ERROR', error: msg }, window.location.origin);
          window.close();
        } else {
          showToast(msg);
          navigate('/login', { replace: true });
        }
      }
    };

    doAuth();
  }, [searchParams, login, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <p className="body-md text-secondary">Signing you in...</p>
    </div>
  );
}
