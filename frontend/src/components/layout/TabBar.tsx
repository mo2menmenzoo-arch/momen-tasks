import { useNavigate, useLocation } from 'react-router-dom';
import { CheckSquare, Calendar, Layers, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/stores/ui.store';

const TABS = [
  { path: '/today', label: 'Today', icon: CheckSquare },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/zones', label: 'Zones', icon: Layers },
  { path: '/review', label: 'Review', icon: TrendingUp },
  { path: '/profile', label: 'Profile', icon: User },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const setActiveTab = useUiStore(s => s.setActiveTab);

  return (
    <nav className="tab-bar safe-area-bottom">
      {TABS.map(tab => {
        const isActive = location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            className={cn('tab-bar-item', isActive && 'active')}
            onClick={() => {
              setActiveTab(tab.label.toLowerCase());
              navigate(tab.path);
            }}
          >
            <tab.icon className="tab-bar-item-icon" size={24} />
            <span className="tab-bar-item-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
