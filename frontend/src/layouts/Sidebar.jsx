import { motion } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiBarChart2, FiBookOpen, FiCpu, FiDatabase, FiGrid, FiHome, FiMenu, FiShield, FiSliders, FiTarget, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { path: '/', label: 'Dashboard', icon: FiHome, tag: 'SOC' },
  { path: '/dataset', label: 'Dataset', icon: FiDatabase, tag: 'DATA' },
  { path: '/traffic-monitor', label: 'Traffic Monitor', icon: FiActivity, tag: 'LIVE' },
  { path: '/detection', label: 'Intrusion Detection', icon: FiTarget, tag: 'AI' },
  { path: '/threat-intelligence', label: 'Threat Intelligence', icon: FiShield, tag: 'IOC' },
  { path: '/attack-simulation', label: 'Attack Simulation', icon: FiAlertTriangle, tag: 'LAB' },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2, tag: 'KPI' },
  { path: '/audit-logs', label: 'Audit Logs', icon: FiBookOpen, tag: 'TRACE' },
  { path: '/reports', label: 'Reports', icon: FiGrid, tag: 'PDF' },
  { path: '/settings', label: 'Settings', icon: FiSliders, tag: 'CTRL' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  return (
    <>
      <button onClick={() => setIsOpen((value) => !value)} className="fixed left-4 top-4 z-50 rounded-xl border border-slate-700/70 bg-[#0a0f18]/90 p-2 text-slate-200 shadow-lg lg:hidden">
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <motion.aside
        initial={{ x: -340 }}
        animate={{ x: isOpen ? 0 : -340 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="fixed inset-y-0 left-0 z-40 w-[272px] border-r border-slate-800/70 bg-[#0a0f18] text-slate-200 lg:translate-x-0"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-slate-800/70 px-5">
            <Link to="/" onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsOpen(false); }} className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_0_26px_rgba(83,211,241,.22)]">
              <FiShield size={18} />
              <FiCpu className="absolute text-[10px]" />
            </div>
            <div>
              <p className="text-[15px] font-black tracking-tight text-white">Adv<span className="text-cyan-300">Secure</span></p>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">AI SECURITY OPS</p>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-500 lg:hidden"><FiX size={16} /></button>
        </div>

        <div className="mx-4 mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 px-3 py-3">
          <div className="flex items-center gap-3">
            <span className="relative">
              <span className="status-dot pulse-cyan bg-emerald-300" />
              <span className="absolute -inset-1 rounded-full border border-emerald-300/20" />
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-emerald-200">SYSTEM OPERATIONAL</p>
              <p className="mt-0.5 text-[12px] text-slate-500">All detection services healthy</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-3 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-600">Operations</p>
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsOpen(false); }}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${active ? 'bg-cyan-300/10 text-cyan-200' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <Icon size={15} className={active ? 'text-cyan-300' : 'text-slate-600 group-hover:text-slate-300'} />
                  <span className="flex-1 text-sm font-semibold">{item.label}</span>
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${item.tag === 'LIVE' ? 'bg-emerald-300/10 text-emerald-200' : item.tag === 'LAB' ? 'bg-amber-300/10 text-amber-200' : 'bg-slate-800 text-slate-500'}`}>{item.tag}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800/70 p-4">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">SOC analyst</p>
            <p className="mt-1 text-sm font-semibold text-slate-200">Aarav Khan</p>
            <p className="mt-1 text-[12px] text-slate-600">a.khan@advsecure.local</p>
          </div>
        </div>
      </motion.aside>

      {isOpen ? <button onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden" aria-label="Close navigation" /> : null}
    </>
  );
}
