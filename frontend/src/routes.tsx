import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/auth.store';
import { Skeleton } from '@/components/common/Skeleton';

const Landing = lazy(() => import('@/pages/Landing').then(m => ({ default: m.Landing })));
const PasswordLogin = lazy(() => import('@/pages/PasswordLogin').then(m => ({ default: m.PasswordLogin })));
const Onboarding = lazy(() => import('@/pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Today = lazy(() => import('@/pages/Today').then(m => ({ default: m.Today })));
const Calendar = lazy(() => import('@/pages/Calendar').then(m => ({ default: m.Calendar })));
const Zones = lazy(() => import('@/pages/Zones').then(m => ({ default: m.Zones })));
const ZoneDetailPage = lazy(() => import('@/pages/ZoneDetailPage').then(m => ({ default: m.ZoneDetailPage })));
const Review = lazy(() => import('@/pages/Review').then(m => ({ default: m.Review })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const onboardingComplete = useAuthStore(s => s.onboardingComplete);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/today" replace />;
  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <Skeleton className="card" style={{ height: 120 }} />
      <Skeleton className="task-card" style={{ height: 60 }} />
      <Skeleton className="task-card" style={{ height: 60 }} />
    </div>
  );
}

export const routes = [
  {
    path: '/',
    element: <GuestGuard><Suspense fallback={<LoadingFallback />}><Landing /></Suspense></GuestGuard>,
  },
  {
    path: '/login',
    element: <GuestGuard><Suspense fallback={<LoadingFallback />}><PasswordLogin /></Suspense></GuestGuard>,
  },
  {
    path: '/',
    element: <AuthGuard><AppShell /></AuthGuard>,
    children: [
      { path: 'today', element: <Suspense fallback={<LoadingFallback />}><Today /></Suspense> },
      { path: 'calendar', element: <Suspense fallback={<LoadingFallback />}><Calendar /></Suspense> },
      { path: 'zones', element: <Suspense fallback={<LoadingFallback />}><Zones /></Suspense> },
      { path: 'zones/:id', element: <Suspense fallback={<LoadingFallback />}><ZoneDetailPage /></Suspense> },
      { path: 'review', element: <Suspense fallback={<LoadingFallback />}><Review /></Suspense> },
      { path: 'profile', element: <Suspense fallback={<LoadingFallback />}><Profile /></Suspense> },
      { path: 'onboarding', element: <Suspense fallback={<LoadingFallback />}><Onboarding /></Suspense> },
    ],
  },
  {
    path: '*', element: <Navigate to="/" replace /> },
];
