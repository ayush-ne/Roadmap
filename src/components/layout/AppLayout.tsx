import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import NodePanel from '@/components/Sidebar/NodePanel';

export default function AppLayout() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Navbar />
      <div className="relative flex flex-1 overflow-hidden">
        <Outlet />
        <NodePanel />
      </div>
    </div>
  );
}
