import { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { useAuthStore } from './stores/auth.store';
import { useOfflineStore } from './stores/offline.store';
import { useUiStore } from './stores/ui.store';
import { wsManager } from './services/websocket';
import { startSyncEngine } from './services/sync-engine';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { FocusSession } from './components/focus/FocusSession';
import { TaskDetailSheet } from './components/task/TaskDetailSheet';
import { CaptureModal } from './components/capture/CaptureModal';
import { ToastContainer } from '@/components/common/Toast';
import { Skeleton } from '@/components/common/Skeleton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { getApiBase } from '@/api/client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 30_000,
    },
  },
});

function OfflineListener() {
  const setOnline = useOfflineStore(s => s.setOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return null;
}

function ThemeInitializer() {
  const theme = useUiStore(s => s.theme);
  const setTheme = useUiStore(s => s.setTheme);

  useEffect(() => {
    setTheme(theme);
  }, []);

  return null;
}

function AuthListener() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    if (isAuthenticated && token) {
      wsManager.setQueryClient(queryClient);
      wsManager.connect(token);
      startSyncEngine();
    } else {
      wsManager.disconnect();
    }
    return () => wsManager.disconnect();
  }, [isAuthenticated, token]);

  return null;
}

function Router() {
  const element = useRoutes(routes);
  return element;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const logout = useAuthStore(s => s.logout);
  const [ready, setReady] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(true);
      return;
    }

    // Validate the session before allowing any API calls to fire
    fetch(`${getApiBase()}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => {
        if (res.status === 401) {
          logout(); // Stale tokens — clear auth, AuthGuard redirects to /login
        }
        setReady(true);
      })
      .catch(() => {
        // Network error — don't log out, user may be offline with valid tokens
        setReady(true);
      });
  }, []); // Only on mount

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        maxWidth: 600,
        margin: '0 auto',
        marginTop: 'var(--space-8)',
      }}>
        <div className="skeleton card" style={{ height: 60, borderRadius: 'var(--radius-full)' }} />
        <Skeleton className="card" style={{ height: 120 }} />
        <Skeleton className="task-card" style={{ height: 64 }} count={3} />
      </div>
    );
  }

  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineListener />
        <ThemeInitializer />
        <AuthInitializer>
          <AuthListener />
          <Router />
          <InstallPrompt />
          <FocusSession />
          <TaskDetailSheet />
          <CaptureModal />
          <ToastContainer />
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
