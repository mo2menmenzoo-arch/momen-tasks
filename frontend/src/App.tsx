import { useEffect } from 'react';
import { useRoutes, useNavigate } from 'react-router-dom';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineListener />
        <ThemeInitializer />
        <AuthListener />
        <Router />
        <InstallPrompt />
        <FocusSession />
        <TaskDetailSheet />
        <CaptureModal />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
