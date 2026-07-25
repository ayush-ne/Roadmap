import { NavLink } from 'react-router-dom';
import {
  Network,
  LayoutDashboard,
  BarChart3,
  Search,
  Settings,
  Pencil,
  Eye,
  Moon,
  Sun,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import GlobalSearch from '@/components/Search/GlobalSearch';
import { isReadOnlyBuild } from '@/utils/env';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const navItems = [
  { to: '/', label: 'Graph', icon: Network },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const editMode = useStore((s) => s.settings.editMode);
  const theme = useStore((s) => s.settings.theme);
  const toggleEditMode = useStore((s) => s.toggleEditMode);
  const updateSettings = useStore((s) => s.updateSettings);
  const stats = useDashboardStats();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-surface-border bg-surface px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <Network className="h-4 w-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold leading-tight">Knowledge Graph</h1>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            {stats.overallProgress}% complete
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-accent-muted text-accent'
                  : 'text-[var(--color-text-muted)] hover:bg-surface-elevated hover:text-[var(--color-text)]'
              }`
            }
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <GlobalSearch compact />
        {!isReadOnlyBuild && (
        <button
          onClick={toggleEditMode}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            editMode
              ? 'bg-yellow-500/15 text-yellow-500'
              : 'bg-surface-elevated text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
          title={editMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        >
          {editMode ? (
            <>
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit Mode</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Mode</span>
            </>
          )}
        </button>
        )}
        <button
          onClick={() =>
            updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })
          }
          className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-surface-elevated hover:text-[var(--color-text)]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
