import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/components/common/Toast';
import type { User } from '@/types';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const userStr = searchParams.get('user');
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('AuthCallback: Processing OAuth callback', { hasUser: !!userStr, hasToken: !!token, error });

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

    if (userStr && token) {
      try {
        const user: User = JSON.parse(userStr);
        console.log('AuthCallback: Login successful', user.email);

        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_SUCCESS', user, token }, window.location.origin);
          window.close();
        } else {
          login(user, token);
          navigate('/today', { replace: true });
        }
      } catch (parseError) {
        console.error('AuthCallback: Failed to parse user data', parseError);
        const msg = 'Failed to process sign-in data';
        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_ERROR', error: msg }, window.location.origin);
          window.close();
        } else {
          showToast(msg);
          navigate('/login', { replace: true });
        }
      }
    } else {
      console.error('AuthCallback: Missing user or token parameters');
      const msg = 'Invalid sign-in response';
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_ERROR', error: msg }, window.location.origin);
        window.close();
      } else {
        showToast(msg);
        navigate('/login', { replace: true });
      }
    }
  }, [searchParams, login, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}>
      <p className="body-md text-secondary">Signing you in...</p>
    </div>
  );
}
