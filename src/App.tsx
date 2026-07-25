import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/Home';
import DashboardPage from '@/pages/Dashboard';
import StatisticsPage from '@/pages/Statistics';
import SearchPage from '@/pages/Search';
import SettingsPage from '@/pages/Settings';
import { useStore } from '@/store/useStore';
import { isReadOnlyBuild } from '@/utils/env';

export default function App() {
  const theme = useStore((s) => s.settings.theme);
  const accentColor = useStore((s) => s.settings.accentColor);
  const editMode = useStore((s) => s.settings.editMode);
  const updateSettings = useStore((s) => s.updateSettings);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--color-accent-hover', accentColor + 'cc');
    document.documentElement.style.setProperty('--color-accent-muted', accentColor + '33');
  }, [theme, accentColor]);

  useEffect(() => {
    if (isReadOnlyBuild && editMode) {
      updateSettings({ editMode: false });
    }
  }, [editMode, updateSettings]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
