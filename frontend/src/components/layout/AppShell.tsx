import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { CaptureBar } from './CaptureBar';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';

export function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
      <CaptureBar />
      <TabBar />
      <OfflineIndicator />
    </div>
  );
}
