import { FiBell, FiChevronRight, FiLock, FiMenu, FiSearch, FiSettings } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const labelFromPath = (path) => {
  const map = {
    '/': 'COMMAND CENTER',
    '/dataset': 'DATASET',
    '/traffic-monitor': 'TRAFFIC MONITOR',
    '/detection': 'INTRUSION DETECTION',
    '/threat-intelligence': 'THREAT INTELLIGENCE',
    '/attack-simulation': 'ATTACK SIMULATION',
    '/analytics': 'ANALYTICS',
    '/audit-logs': 'AUDIT LOGS',
    '/reports': 'REPORTS',
    '/settings': 'SETTINGS',
  };
  return map[path] ?? 'COMMAND CENTER';
};

export default function Navbar() {
  const location = useLocation();
  const { setSidebarOpen } = useApp();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-800/70 bg-[#080c14]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-700/60 p-2 text-slate-400 lg:hidden"><FiMenu size={17} /></button>
        <div className="hidden items-center gap-2 text-[12px] font-bold text-slate-600 sm:flex">
          <span className="text-slate-500">ADVSECURE</span>
          <FiChevronRight size={12} />
          <span className="text-slate-300">{labelFromPath(location.pathname)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center rounded-xl border border-slate-700/60 bg-slate-900/30 px-3 py-2 text-[12px] text-slate-500 md:flex">
          <FiLock className="mr-2 text-slate-400" /> SECURE CONSOLE
        </div>
        <button className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-2 text-slate-500 hover:text-cyan-300"><FiSearch size={15} /></button>
        <button className="relative rounded-xl border border-slate-700/60 bg-slate-900/30 p-2 text-slate-500 hover:text-cyan-300"><FiBell size={15} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400" /></button>
        <button className="rounded-xl border border-slate-700/60 bg-slate-900/30 p-2 text-slate-500 hover:text-white"><FiSettings size={15} /></button>
      </div>
    </header>
  );
}
