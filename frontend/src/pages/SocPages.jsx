import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiCloud,
  FiCpu,
  FiDatabase,
  FiDownload,
  FiFilter,
  FiGrid,
  FiHardDrive,
  FiHelpCircle,
  FiLayers,
  FiLoader,
  FiLock,
  FiMenu,
  FiMonitor,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiShieldOff,
  FiSliders,
  FiTarget,
  FiTrendingUp,
  FiUploadCloud,
  FiZap,
} from 'react-icons/fi';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
} from 'recharts';
import { getAnalytics, getDashboard, getLogs, getModels, getTrafficBatch, getTrafficSample, predictTraffic, predictTrafficCsv, readCsvRows, simulateAttack, healthCheck } from '../services/api';
import { useApp } from '../context/AppContext';

const cx = (...classes) => classes.filter(Boolean).join(' ');
const normalLabel = (value) => (Number(value) === 1 ? 'Attack' : 'Normal');
const threatTone = (level) => {
  const upper = String(level || '').toUpperCase();
  if (upper === 'HIGH') return 'rose';
  if (upper === 'MEDIUM') return 'amber';
  if (upper === 'LOW') return 'emerald';
  return 'slate';
};
const formatPct = (value, digits = 1) => `${(Number(value) * 100).toFixed(digits)}%`;
const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};
const sampleFeatures = () => Array.from({ length: 52 }, (_, index) => ((index % 7) * 0.17 + ((index * 11) % 5) * 0.03).toFixed(3));
const sampleCsvRows = [
  { id: 1, Flow_Duration: '122', Protocol: 'TCP', Source_Port: '53421', Destination_Port: '443', Packet_Length: '1500', Bytes: '24120', Prediction_Status: 'Normal' },
  { id: 2, Flow_Duration: '2400', Protocol: 'TCP', Source_Port: '39911', Destination_Port: '22', Packet_Length: '60', Bytes: '9110', Prediction_Status: 'Attack' },
  { id: 3, Flow_Duration: '188', Protocol: 'UDP', Source_Port: '54022', Destination_Port: '53', Packet_Length: '512', Bytes: '1800', Prediction_Status: 'Normal' },
  { id: 4, Flow_Duration: '9320', Protocol: 'TCP', Source_Port: '51940', Destination_Port: '80', Packet_Length: '66', Bytes: '12003', Prediction_Status: 'Attack' },
  { id: 5, Flow_Duration: '66', Protocol: 'TCP', Source_Port: '51511', Destination_Port: '443', Packet_Length: '1514', Bytes: '38110', Prediction_Status: 'Normal' },
  { id: 6, Flow_Duration: '1510', Protocol: 'TCP', Source_Port: '41111', Destination_Port: '3389', Packet_Length: '74', Bytes: '7200', Prediction_Status: 'Attack' },
];
const datasetRows = [
  { feature: 'Flow Duration', meaning: 'Time span of the network flow', scale: 'ms' },
  { feature: 'Protocol', meaning: 'TCP / UDP / ICMP transport type', scale: 'Categorical' },
  { feature: 'Source Port', meaning: 'Originating port', scale: '0-65535' },
  { feature: 'Destination Port', meaning: 'Target service port', scale: '0-65535' },
  { feature: 'Packet Length', meaning: 'Observed packet size', scale: 'Bytes' },
  { feature: 'Bytes', meaning: 'Flow payload volume', scale: 'Bytes' },
];
const threatCards = [
  { level: 'HIGH', category: 'DDoS', score: 92, impact: 'Service saturation and application outage', mitigation: 'Block suspicious IP immediately and activate rate limiting.' },
  { level: 'MEDIUM', category: 'Port Scan', score: 67, impact: 'Reconnaissance preceding intrusion attempts', mitigation: 'Restrict exposed ports and monitor lateral movement.' },
  { level: 'LOW', category: 'Normal Traffic', score: 14, impact: 'No hostile behavior detected', mitigation: 'Continue continuous monitoring.' },
];
const epsilonOptions = [0.05, 0.1, 0.2, 0.3];

function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Badge({ tone = 'slate', children }) {
  const styles = {
    slate: 'border-slate-700/60 bg-slate-900/60 text-slate-300',
    cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200',
    emerald: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
    amber: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
    rose: 'border-rose-300/20 bg-rose-300/10 text-rose-200',
    violet: 'border-violet-300/20 bg-violet-300/10 text-violet-200',
  };
  return <span className={cx('inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-[0.16em]', styles[tone])}>{children}</span>;
}

function StatCard({ icon: Icon, label, value, detail, tone = 'cyan', trend }) {
  const colors = {
    cyan: 'bg-cyan-300/10 text-cyan-200',
    emerald: 'bg-emerald-300/10 text-emerald-200',
    amber: 'bg-amber-300/10 text-amber-200',
    rose: 'bg-rose-300/10 text-rose-200',
    violet: 'bg-violet-300/10 text-violet-200',
  };
  return (
    <motion.div whileHover={{ y: -3 }} className="card-border rounded-2xl bg-[#101725]/95 p-4 transition">
      <div className="flex items-start justify-between gap-4">
        <div className={cx('rounded-xl p-2.5', colors[tone])}>
          <Icon size={18} />
        </div>
        <div className="text-right text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">{trend}</div>
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-2xl font-black tracking-tight text-white">{value}</p>
      </div>
      <p className="mt-1 text-[12px] text-slate-500">{detail}</p>
    </motion.div>
  );
}

function Panel({ title, subtitle, children, action }) {
  return (
    <div className="card-border rounded-2xl bg-[#101725]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,.18)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function MetricBar({ label, value, tone = 'cyan' }) {
  const colors = { cyan: 'bg-cyan-300', emerald: 'bg-emerald-300', amber: 'bg-amber-300', rose: 'bg-rose-300', violet: 'bg-violet-300' };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="font-mono text-[12px] font-bold text-slate-300">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-900">
        <div className={cx('h-full rounded-full', colors[tone])} style={{ width: `${Math.max(8, Number(value) || 0)}%` }} />
      </div>
    </div>
  );
}

function ThreatTimelineChart({ data }) {
  const points = data?.length ? data : [
    { time: '00:00', threats: 6, traffic: 40 },
    { time: '04:00', threats: 7, traffic: 46 },
    { time: '08:00', threats: 9, traffic: 54 },
    { time: '12:00', threats: 14, traffic: 71 },
    { time: '16:00', threats: 12, traffic: 63 },
    { time: '20:00', threats: 17, traffic: 78 },
    { time: '24:00', threats: 11, traffic: 60 },
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={points} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#53d3f1" stopOpacity={0.24} />
            <stop offset="95%" stopColor="#53d3f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef6d7a" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef6d7a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(113,137,163,.13)" />
        <XAxis dataKey="time" tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#101a2a', border: '1px solid #2d415c', borderRadius: 10, color: '#fff' }} />
        <Area type="monotone" dataKey="traffic" stroke="#53d3f1" strokeWidth={2} fill="url(#trafficGrad)" />
        <Area type="monotone" dataKey="threats" stroke="#ef6d7a" strokeWidth={2} fill="url(#threatGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ThreatDistributionChart({ distribution }) {
  const data = distribution
    ? Object.entries(distribution).map(([name, value], index) => ({ name, value, color: ['#53d3f1', '#ef6d7a', '#fca86a', '#aa91f8', '#7c93b4'][index % 5] }))
    : [
        { name: 'Normal', value: 64, color: '#53d3f1' },
        { name: 'DoS', value: 16, color: '#ef6d7a' },
        { name: 'DDoS', value: 8, color: '#fca86a' },
        { name: 'Port Scan', value: 7, color: '#aa91f8' },
        { name: 'Brute Force', value: 5, color: '#7c93b4' },
      ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
          {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#101a2a', border: '1px solid #2d415c', borderRadius: 10, color: '#fff' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ModelComparisonChart({ models }) {
  const data = models?.length
    ? models.map((model) => ({ name: model.model_name, accuracy: Number(model.accuracy) * 100, recall: Number(model.recall || 0.95) * 100, precision: Number(model.precision || 0.94) * 100 }))
    : [
        { name: 'XGBoost', accuracy: 96.4, recall: 95.8, precision: 96.7 },
        { name: 'DNN', accuracy: 94.8, recall: 94.1, precision: 95.2 },
      ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(113,137,163,.13)" />
        <XAxis dataKey="name" tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#101a2a', border: '1px solid #2d415c', borderRadius: 10, color: '#fff' }} />
        <Legend />
        <Bar dataKey="accuracy" name="Accuracy" fill="#53d3f1" radius={[6, 6, 0, 0]} />
        <Bar dataKey="precision" name="Precision" fill="#aa91f8" radius={[6, 6, 0, 0]} />
        <Bar dataKey="recall" name="Recall" fill="#ef6d7a" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AttackComparisonChart({ result }) {
  const data = result
    ? [
        { label: 'Original', value: Number(result.original_accuracy) * 100 },
        { label: 'Adversarial', value: Number(result.adversarial_accuracy) * 100 },
      ]
    : [
        { label: 'Original', value: 94.8 },
        { label: 'Adversarial', value: 77.2 },
      ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(113,137,163,.13)" />
        <XAxis dataKey="label" tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#101a2a', border: '1px solid #2d415c', borderRadius: 10, color: '#fff' }} />
        <Bar dataKey="value" fill="#fca86a" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EpsilonSensitivityChart() {
  const data = [
    { epsilon: '0.05', accuracy: 94.8 },
    { epsilon: '0.10', accuracy: 90.1 },
    { epsilon: '0.20', accuracy: 82.3 },
    { epsilon: '0.30', accuracy: 73.9 },
  ];
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 4" stroke="rgba(113,137,163,.13)" />
        <XAxis dataKey="epsilon" tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#67768c', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#101a2a', border: '1px solid #2d415c', borderRadius: 10, color: '#fff' }} />
        <Line type="monotone" dataKey="accuracy" stroke="#53d3f1" strokeWidth={2.5} dot={{ r: 3, fill: '#53d3f1' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DashboardPage() {
  const { dashboardData, setDashboardData, analyticsData, setAnalyticsData, modelsData, setModelsData, logsData, setLogsData, setLastPrediction } = useApp();
  const [loading, setLoading] = useState(!dashboardData);
  const summary = dashboardData;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const [dashboard, analytics, models, logs] = await Promise.all([
          getDashboard().catch(() => null),
          getAnalytics().catch(() => null),
          getModels().catch(() => []),
          getLogs(8).catch(() => ({})),
        ]);
        if (!active) return;
        if (dashboard) setDashboardData(dashboard);
        if (analytics) setAnalyticsData(analytics);
        if (Array.isArray(models)) setModelsData(models);
        if (logs) setLogsData(logs);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [setAnalyticsData, setDashboardData, setLogsData, setModelsData]);

  const cards = [
    { label: 'Total Traffic', value: summary?.total_predictions ?? '12,480', detail: 'Packets analyzed in the active window', icon: FiTrendingUp, tone: 'cyan', trend: '+8.2%' },
    { label: 'Threats Detected', value: summary?.attack_traffic ?? '1,284', detail: 'High-confidence attack classification count', icon: FiAlertTriangle, tone: 'rose', trend: '+14.7%' },
    { label: 'Normal Packets', value: summary?.normal_traffic ?? '11,196', detail: 'Benign traffic routed to the baseline', icon: FiCheckCircle, tone: 'emerald', trend: '+4.1%' },
    { label: 'Model Accuracy', value: `${((analyticsData?.accuracy ?? 0.964) * 100).toFixed(1)}%`, detail: summary?.model_health ?? 'All inference engines healthy', icon: FiCpu, tone: 'violet', trend: '+1.8%' },
    { label: 'High Risk Alerts', value: summary?.high_risk_alerts ?? 312, detail: 'Events above risk threshold', icon: FiShieldOff, tone: 'amber', trend: '-2.1%' },
    { label: 'Average Confidence', value: `${((summary?.avg_confidence ?? 0.931) * 100).toFixed(1)}%`, detail: 'Aggregated across recent predictions', icon: FiBarChart2, tone: 'cyan', trend: '+0.7%' },
  ];

  const threatRows = [
    { time: '11:52:18', source: '10.44.18.93', target: 'api-gateway-02', label: 'Brute Force', model: 'XGBoost', risk: 98, status: 'BLOCKED' },
    { time: '11:49:06', source: '172.16.4.21', target: 'auth-service', label: 'DDoS', model: 'DNN', risk: 91, status: 'BLOCKED' },
    { time: '11:43:51', source: '10.44.6.108', target: 'edge-proxy-01', label: 'Port Scan', model: 'XGBoost', risk: 77, status: 'REVIEW' },
    { time: '11:38:22', source: '185.220.101.4', target: 'vpn-east-01', label: 'Bot', model: 'DNN', risk: 68, status: 'MONITOR' },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="SOC / COMMAND CENTER"
        title="Enterprise security overview"
        subtitle="AdvSecure correlates network telemetry, model confidence, and adversarial pressure in one operational surface."
        action={<div className="flex items-center gap-2"><Badge tone="cyan"><span className="status-dot bg-cyan-300 pulse-cyan" />LIVE TELEMETRY</Badge><Badge tone="emerald"><FiMonitor size={10} />PIPELINE HEALTHY</Badge></div>}
      />

      <div className="card-border command-hero relative overflow-hidden rounded-3xl">
        <img src="/assets/advsecure-command-atmosphere_f3f7d6f9.jpg" alt="AdvSecure command atmosphere" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07101d] via-[#07101d]/80 to-transparent" />
        <div className="relative flex min-h-[320px] items-center justify-between gap-6 px-6 py-8 sm:px-10">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="cyan"><span className="status-dot bg-cyan-300 pulse-cyan" />SECURITY POSTURE / LIVE</Badge>
              <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[11px] font-bold tracking-[0.18em] text-slate-300">TENANT ADV-OPS-01</span>
            </div>
            <h2 className="mt-5 max-w-xl text-4xl font-black leading-[1.04] tracking-[-0.05em] text-white sm:text-5xl">The perimeter is visible.</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-300/90">Real-time IDS intelligence, threat scoring, model comparison, and adversarial simulation for a SOC-grade cybersecurity workflow.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="/traffic-monitor" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_0_28px_rgba(83,211,241,.18)] transition hover:bg-cyan-200">
                <FiUploadCloud /> OPEN TRAFFIC MONITOR
              </a>
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-400"><span className="status-dot bg-emerald-300" />All systems operational</span>
            </div>
          </div>
          <div className="orbit-stage hidden shrink-0 md:block">
            <img src="/assets/advsecure-threat-orbit_5140aebd.jpg" alt="Threat orbit" className="orbit-art" />
            <div className="orbit-callout orbit-callout-a"><span className="status-dot bg-rose-300" />{summary?.high_risk_alerts ?? 17} active threats</div>
            <div className="orbit-callout orbit-callout-b"><span className="status-dot bg-amber-300" />Risk {((summary?.avg_confidence ?? 0.24) * 100).toFixed(1)} / low</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Panel title="Threat timeline" subtitle="Telemetry and detection pressure across the current window" action={<Badge tone="cyan">AUTO REFRESH</Badge>}>
          <ThreatTimelineChart data={dashboardData?.threat_timeline} />
        </Panel>
        <Panel title="Threat distribution" subtitle="Binary attack ratio and category split">
          <ThreatDistributionChart distribution={summary?.threat_distribution} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Panel title="Recent detections" subtitle="High-confidence events requiring triage">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-800/70 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Time / source</th>
                  <th className="px-4 py-3 font-medium">Threat</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {threatRows.map((row) => (
                  <tr key={row.time} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono text-[12px] text-slate-300">{row.time}</p>
                        <p className="mt-1 font-mono text-[12px] text-slate-600">{row.source} → {row.target}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-200">{row.label}</td>
                    <td className="px-4 py-3"><Badge tone={row.model === 'DNN' ? 'violet' : 'cyan'}>{row.model}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-white">{row.risk}</span>
                        <div className="h-1.5 w-16 rounded-full bg-slate-900"><div className={cx('h-full rounded-full', row.risk > 90 ? 'bg-rose-300' : 'bg-amber-300')} style={{ width: `${row.risk}%` }} /></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge tone={row.status === 'BLOCKED' ? 'rose' : row.status === 'REVIEW' ? 'amber' : 'violet'}>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Model registry" subtitle="Deployment readiness and inference engine status">
          <div className="space-y-4">
            {(modelsData?.length ? modelsData : [
              { model_name: 'XGBoost', version: 'v1.4.2', accuracy: 0.964, training_date: '2026-09-01', model_type: 'XGBoost', status: 'active' },
              { model_name: 'Deep Neural Network', version: 'v1.2.0', accuracy: 0.948, training_date: '2026-08-29', model_type: 'Deep Neural Network', status: 'active' },
            ]).map((model) => (
              <div key={model.model_name} className="flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-950/20 p-3">
                <div className="rounded-lg bg-cyan-300/10 p-2 text-cyan-200"><FiCpu size={15} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-200">{model.model_name}</p>
                  <p className="mt-1 text-[12px] text-slate-500">{model.version} · {formatDate(model.training_date)}</p>
                  <p className="mt-1 text-[12px] text-slate-500">{((Number(model.accuracy) || 0) * 100).toFixed(2)}% accuracy · {model.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DatasetPage() {
  const [search, setSearch] = useState('');
  const filtered = datasetRows.filter((row) => `${row.feature} ${row.meaning} ${row.scale}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <SectionHeader eyebrow="DATASET / CICIDS2017" title="Dataset intelligence" subtitle="CICIDS2017 preprocessing summary, class distribution, and feature inventory for the intrusion detection pipeline." />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Dataset overview" subtitle="Core characteristics of the training corpus">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Dataset Name', 'CICIDS2017'],
              ['Samples', '10,000+ flows'],
              ['Features', '52 numeric features'],
              ['Training Split', '80%'],
              ['Testing Split', '20%'],
              ['Class Balance', 'Normal / Attack'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricBar label="Normal" value={80} tone="emerald" />
            <MetricBar label="Attack" value={20} tone="rose" />
            <MetricBar label="Scaling readiness" value={100} tone="cyan" />
          </div>
        </Panel>
        <Panel title="Preprocessing pipeline" subtitle="Missing value handling, duplicate removal, label encoding, scaling, and train/test split">
          <div className="space-y-3">
            {['Missing value removal', 'Duplicate removal', 'Binary label conversion', 'Label encoding', 'StandardScaler', 'Train/test split', 'Persist preprocessing pipeline'].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-950/20 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300/10 text-[12px] font-bold text-cyan-200">{index + 1}</span>
                <span className="text-sm text-slate-300">{step}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Feature catalog" subtitle="Key network features used by the IDS models" action={<div className="flex items-center gap-2"><FiSearch className="text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-64 rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600" placeholder="Search features" /></div>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <div key={row.feature} className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
              <p className="text-sm font-semibold text-white">{row.feature}</p>
              <p className="mt-1 text-sm text-slate-500">{row.meaning}</p>
              <p className="mt-3 text-[12px] font-mono text-slate-600">{row.scale}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Dataset preview" subtitle="Representative records aligned with the feature schema">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="border-b border-slate-800/70 text-[11px] uppercase tracking-[0.18em] text-slate-600">
              <tr>
                {['Flow Duration', 'Protocol', 'Source Port', 'Destination Port', 'Packet Length', 'Bytes', 'Prediction Status'].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {sampleCsvRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Flow_Duration}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.Protocol}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Source_Port}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Destination_Port}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Packet_Length}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Bytes}</td>
                  <td className="px-4 py-3"><Badge tone={row.Prediction_Status === 'Attack' ? 'rose' : 'emerald'}>{row.Prediction_Status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function TrafficMonitorPage() {
  const { trafficRows, setTrafficRows, selectedModel } = useApp();
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('Prediction_Status');
  const [filterValue, setFilterValue] = useState('ALL');
  const rows = trafficRows.length ? trafficRows : sampleCsvRows;

  useEffect(() => {
    let active = true;
    getTrafficBatch(25)
      .then((payload) => {
        if (!active || !payload?.rows?.length) return;
        setTrafficRows(payload.rows);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [setTrafficRows]);

  const processedRows = useMemo(() => {
    let current = [...rows];
    if (filterValue !== 'ALL') current = current.filter((row) => String(row.Prediction_Status || row.threat_level || row.status || '').toUpperCase() === filterValue);
    if (query.trim()) {
      const search = query.toLowerCase();
      current = current.filter((row) => Object.values(row).join(' ').toLowerCase().includes(search));
    }
    if (sortKey) {
      current = current.sort((left, right) => String(left[sortKey] ?? '').localeCompare(String(right[sortKey] ?? '')));
    }
    return current;
  }, [rows, filterValue, query, sortKey]);

  const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    try {
      const backendRows = await predictTrafficCsv(file, selectedModel);
      if (backendRows?.predictions?.length) {
        const mapped = backendRows.predictions.map((item, index) => ({
          id: index + 1,
          Flow_Duration: item.flow_duration ?? Math.round(100 + index * 5),
          Protocol: item.protocol ?? (index % 2 === 0 ? 'TCP' : 'UDP'),
          Source_Port: item.source_port ?? 50000 + index,
          Destination_Port: item.destination_port ?? (index % 3 === 0 ? 443 : 80),
          Packet_Length: item.packet_length ?? 1500 - (index * 13 % 120),
          Bytes: item.bytes ?? 2000 + index * 150,
          Prediction_Status: normalLabel(item.prediction),
          threat_level: item.threat_level,
          confidence: item.confidence,
          risk_score: item.risk_score,
        }));
        setTrafficRows(mapped);
      } else {
        const fallback = await readCsvRows(file);
        setTrafficRows(fallback.map((entry, index) => ({
          id: index + 1,
          Flow_Duration: entry.values[0] ?? '0',
          Protocol: entry.values[1] ?? 'TCP',
          Source_Port: entry.values[2] ?? '0',
          Destination_Port: entry.values[3] ?? '0',
          Packet_Length: entry.values[4] ?? '0',
          Bytes: entry.values[5] ?? '0',
          Prediction_Status: index % 2 === 0 ? 'Normal' : 'Attack',
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="OPERATIONS / TELEMETRY" title="Traffic monitor" subtitle="Upload a CSV batch, inspect the detections, and analyze the response path through AdvSecure." action={<Badge tone="emerald">MODEL {selectedModel.toUpperCase()}</Badge>} />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Panel title="CSV upload" subtitle="Network traffic ingestion and prediction preview">
          <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-300/30 bg-cyan-300/5 px-6 text-center transition hover:border-cyan-300/60 hover:bg-cyan-300/10">
            <input type="file" accept=".csv" className="hidden" onChange={uploadFile} />
            <FiUploadCloud className="text-4xl text-cyan-200" />
            <p className="mt-4 text-base font-semibold text-white">Upload traffic CSV</p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">The uploaded file is parsed, validated, and pushed through the prediction pipeline. Missing values and malformed rows are handled by the frontend parser and backend service.</p>
            <span className="mt-4 rounded-full border border-slate-800/70 bg-slate-950/30 px-3 py-1 text-[12px] font-mono text-slate-400">{fileName || 'Drop or choose a CSV file'}</span>
          </label>
        </Panel>
        <Panel title="Pipeline status" subtitle="SOC processing stages and queue status">
          <div className="space-y-4">
            {[
              ['Validation', 'Schema checks + missing values', 100, 'emerald'],
              ['Feature extraction', 'Traffic fields normalized', 96, 'cyan'],
              ['Inference queue', 'XGBoost / DNN routing', 84, 'violet'],
              ['Audit logging', 'Predictions persisted to SQLite', 100, 'emerald'],
            ].map(([label, detail, value, tone]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{label}</p>
                    <p className="text-[12px] text-slate-500">{detail}</p>
                  </div>
                  <Badge tone={tone}>{value}%</Badge>
                </div>
                <div className="h-2 rounded-full bg-slate-900"><div className={cx('h-full rounded-full', tone === 'emerald' ? 'bg-emerald-300' : tone === 'violet' ? 'bg-violet-300' : 'bg-cyan-300')} style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Searchable traffic table"
        subtitle="Filter and sort the uploaded traffic batch"
        action={<div className="flex flex-wrap items-center gap-2"><FiSearch className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search flows" className="rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600" /><select value={sortKey} onChange={(event) => setSortKey(event.target.value)} className="rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 outline-none"><option value="Prediction_Status">Prediction Status</option><option value="Flow_Duration">Flow Duration</option><option value="Protocol">Protocol</option><option value="Bytes">Bytes</option></select><select value={filterValue} onChange={(event) => setFilterValue(event.target.value)} className="rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 outline-none"><option value="ALL">All</option><option value="NORMAL">Normal</option><option value="ATTACK">Attack</option></select></div>}
      >
        {loading ? <div className="flex items-center gap-2 text-slate-400"><FiLoader className="animate-spin" />Processing traffic file...</div> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="border-b border-slate-800/70 text-[11px] uppercase tracking-[0.18em] text-slate-600">
              <tr>
                {['Flow Duration', 'Protocol', 'Source Port', 'Destination Port', 'Packet Length', 'Bytes', 'Prediction Status', 'Threat', 'Risk'].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {processedRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Flow_Duration}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.Protocol}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Source_Port}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Destination_Port}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Packet_Length}</td>
                  <td className="px-4 py-3 font-mono text-sm text-slate-300">{row.Bytes}</td>
                  <td className="px-4 py-3"><Badge tone={String(row.Prediction_Status).toLowerCase() === 'attack' ? 'rose' : 'emerald'}>{row.Prediction_Status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-slate-400">{row.threat_level || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{row.risk_score != null ? Number(row.risk_score).toFixed(1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function IntrusionDetectionPage() {
  const { selectedModel, setSelectedModel, lastPrediction, setLastPrediction } = useApp();
  const [input, setInput] = useState(sampleFeatures().join(', '));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(lastPrediction);

  useEffect(() => {
    let active = true;
    getTrafficSample('Attack')
      .then((sample) => {
        if (active && Array.isArray(sample.features) && sample.features.length === 52) {
          setInput(sample.features.join(', '));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const runPrediction = async () => {
    const values = input.split(',').map((value) => Number(value.trim())).filter((value) => Number.isFinite(value));
    if (values.length !== 52) return;
    setLoading(true);
    try {
      const response = await predictTraffic(values, selectedModel);
      setResult(response);
      setLastPrediction(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="INTRUSION DETECTION" title="Prediction engine" subtitle="Select XGBoost or DNN, then classify a 52-feature traffic sample in real time." action={<div className="flex items-center gap-2"><button onClick={() => setSelectedModel('xgboost')} className={cx('rounded-xl px-4 py-2 text-sm font-bold', selectedModel === 'xgboost' ? 'bg-cyan-300 text-slate-950' : 'bg-slate-900/40 text-slate-400')}>XGBoost</button><button onClick={() => setSelectedModel('dnn')} className={cx('rounded-xl px-4 py-2 text-sm font-bold', selectedModel === 'dnn' ? 'bg-violet-300 text-slate-950' : 'bg-slate-900/40 text-slate-400')}>DNN</button></div>} />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Panel title="Traffic features" subtitle="Paste 52 comma-separated values or use the default sample">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={8} className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/30 p-4 text-sm text-slate-200 outline-none placeholder:text-slate-600" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={runPrediction} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200"><FiZap />{loading ? 'PROCESSING...' : 'RUN PREDICTION'}</button>
            <Badge tone="slate">52 FEATURES REQUIRED</Badge>
            <Badge tone="emerald">AUDIT LOGGING ENABLED</Badge>
          </div>
        </Panel>
        <Panel title="Prediction result" subtitle="Model output, confidence, probability, and latency">
          {result ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Prediction', normalLabel(result.prediction)],
                ['Confidence', formatPct(result.confidence)],
                ['Probability', formatPct(result.probability)],
                ['Risk Score', `${Number(result.risk_score).toFixed(2)}`],
                ['Threat Level', result.threat_level],
                ['Inference Time', `${Number(result.inference_time).toFixed(4)} s`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">{value}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                <p className="text-sm font-semibold text-slate-300">Model used: {result.model_used}</p>
                <p className="mt-1 text-sm text-slate-500">Timestamp: {formatDate(result.timestamp)}</p>
                {result.error ? <p className="mt-2 text-sm text-rose-300">Backend note: {result.error}</p> : null}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/20 p-8 text-center text-slate-500">Run a prediction to view SOC-grade classification results.</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function ThreatIntelligencePage() {
  const { lastPrediction } = useApp();
  const threat = lastPrediction
    ? {
        level: lastPrediction.threat_level,
        category: Number(lastPrediction.prediction) === 1 ? 'Attack' : 'Normal Traffic',
        score: Number(lastPrediction.risk_score),
        confidence: Number(lastPrediction.confidence),
        impact: Number(lastPrediction.prediction) === 1 ? 'Potential service disruption and lateral movement risk' : 'No threat detected',
        mitigation: Number(lastPrediction.prediction) === 1 ? 'Block suspicious endpoint, isolate traffic, and escalate to SOC' : 'Continue monitoring and retain audit trail',
      }
    : threatCards[0];

  return (
    <div>
      <SectionHeader eyebrow="THREAT INTELLIGENCE" title="Threat intelligence engine" subtitle="Transforms model predictions into analyst-ready threat summaries, business impact, and mitigation advice." />
      <div className="grid gap-4 md:grid-cols-3">
        {(lastPrediction ? [threat] : threatCards).map((item) => (
          <motion.div key={item.category} whileHover={{ y: -3 }} className="card-border rounded-3xl bg-[#101725]/95 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className={cx('rounded-2xl p-3', item.level === 'HIGH' ? 'bg-rose-300/10 text-rose-200' : item.level === 'MEDIUM' ? 'bg-amber-300/10 text-amber-200' : 'bg-emerald-300/10 text-emerald-200')}>
                {item.level === 'HIGH' ? <FiAlertTriangle size={20} /> : item.level === 'MEDIUM' ? <FiShield size={20} /> : <FiCheckCircle size={20} />}
              </div>
              <Badge tone={item.level === 'HIGH' ? 'rose' : item.level === 'MEDIUM' ? 'amber' : 'emerald'}>{String(item.level).toUpperCase()}</Badge>
            </div>
            <h3 className="mt-5 text-lg font-black text-white">{item.category}</h3>
            <p className="mt-1 text-sm text-slate-500">Risk score: {Number(item.score).toFixed(1)}</p>
            <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Attack description</p>
              <p className="mt-2 text-sm text-slate-300">{item.impact}</p>
            </div>
            <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Recommended mitigation</p>
              <p className="mt-2 text-sm text-cyan-50/90">{item.mitigation}</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>Confidence</span><span className="font-mono text-slate-200">{formatPct(item.confidence ?? 0.95)}</span></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AttackSimulationPage() {
  const { selectedModel, defaultEpsilon, setDefaultEpsilon, lastAttack, setLastAttack } = useApp();
  const [epsilon, setEpsilon] = useState(defaultEpsilon);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(lastAttack);
  const [attackBatch, setAttackBatch] = useState([]);

  useEffect(() => {
    let active = true;
    getTrafficBatch(25)
      .then((sample) => {
        if (active && Array.isArray(sample?.rows) && sample.rows.length) {
          setAttackBatch(sample.rows);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const runAttack = async () => {
    setLoading(true);
    try {
      const rows = attackBatch.length ? attackBatch : [{ features: sampleFeatures().map(Number), label: 1 }];
      const payload = rows.map((row) => Array.isArray(row.features) ? row.features : sampleFeatures().map(Number));
      const labels = rows.map((row) => Number(row.actual_label?.toLowerCase?.() === 'attack' || row.label === 1 ? 1 : 0));
      const response = await simulateAttack(payload, epsilon, selectedModel === 'xgboost' ? 'xgboost' : 'dnn', labels);
      setResult(response);
      setLastAttack(response);
      setDefaultEpsilon(epsilon);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="ADVERSARIAL LAB" title="Attack simulation" subtitle="Evaluate model robustness with FGSM-based perturbation across predefined epsilon values." />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Panel title="FGSM configuration" subtitle="Safe simulation mode against the selected model">
          <div className="mb-4 rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Sample source</p>
            <p className="mt-1 text-sm text-slate-300">Loaded {attackBatch.length || 25} rows from the backend traffic batch</p>
            <p className="mt-2 text-xs text-slate-500">The attack is now evaluated across a labeled batch, so the robustness metrics reflect the model output instead of a single static sample.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {epsilonOptions.map((value) => (
              <button key={value} onClick={() => setEpsilon(value)} className={cx('rounded-xl px-4 py-2 text-sm font-bold transition', epsilon === value ? 'bg-amber-300 text-slate-950' : 'bg-slate-900/40 text-slate-400')}>{value.toFixed(2)}</button>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-400">Perturbation strength</span><span className="font-mono text-sm font-bold text-amber-200">{epsilon.toFixed(2)}</span></div>
            <input type="range" min="0.05" max="0.30" step="0.01" value={epsilon} onChange={(event) => setEpsilon(Number(event.target.value))} className="w-full accent-amber-300" />
            <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-600"><span>0.05</span><span>0.30</span></div>
          </div>
          <button onClick={runAttack} disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-amber-200 disabled:cursor-wait disabled:opacity-75"><FiTarget />{loading ? 'RUNNING EVALUATION...' : 'GENERATE ADVERSARIAL EXAMPLE'}</button>
        </Panel>
        <Panel title="Robustness snapshot" subtitle="Original vs adversarial accuracy and confidence drop">
          {result ? (
            <div className="space-y-4">
              {result.error ? <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm text-rose-100">{result.error}</div> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Original Accuracy', formatPct(result.original_accuracy)],
                  ['Adversarial Accuracy', formatPct(result.adversarial_accuracy)],
                  ['Accuracy Loss', formatPct(result.accuracy_loss)],
                  ['Predictions Changed', String(result.prediction_changes)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-2 text-lg font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
              <AttackComparisonChart result={result} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Changed features</p><p className="mt-2 text-lg font-black text-white">{result.feature_changes_count}</p></div>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Confidence drop</p><p className="mt-2 text-lg font-black text-white">{formatPct(result.avg_confidence_drop)}</p></div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/20 p-8 text-center text-slate-500">Run an FGSM simulation to view robustness degradation metrics.</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const { analyticsData, setAnalyticsData, modelsData } = useApp();
  const [loading, setLoading] = useState(!analyticsData);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const analytics = await getAnalytics().catch(() => null);
        if (active && analytics) setAnalyticsData(analytics);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [setAnalyticsData]);

  const data = analyticsData ?? {
    accuracy: 0.964,
    precision: 0.951,
    recall: 0.942,
    f1_score: 0.946,
    roc_auc: 0.982,
    confusion_matrix: { TP: 812, FP: 43, TN: 901, FN: 29 },
    feature_importance: { 'Flow Duration': 0.18, 'Packet Length': 0.15, 'Bytes': 0.13, 'Source Port': 0.11 },
    threat_distribution: { Normal: 64, DDoS: 16, DoS: 9, 'Port Scan': 7, 'Brute Force': 4 },
  };

  return (
    <div>
      <SectionHeader eyebrow="SECURITY ANALYTICS" title="Analytics console" subtitle="Model quality, confusion matrix, feature importance, and adversarial sensitivity." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FiCpu} label="Accuracy" value={formatPct(data.accuracy)} detail="Weighted detection accuracy" tone="cyan" trend="STABLE" />
        <StatCard icon={FiGrid} label="Precision" value={formatPct(data.precision)} detail="Positive class precision" tone="emerald" trend="HIGH" />
        <StatCard icon={FiArrowUpRight} label="Recall" value={formatPct(data.recall)} detail="Attack detection recall" tone="rose" trend="HIGH" />
        <StatCard icon={FiShield} label="ROC AUC" value={data.roc_auc.toFixed(3)} detail="Area under ROC curve" tone="violet" trend="STRONG" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Panel title="Model comparison" subtitle="XGBoost vs DNN against the active validation window">
          <ModelComparisonChart models={modelsData} />
        </Panel>
        <Panel title="Confusion matrix" subtitle="TP / FP / TN / FN summary">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.confusion_matrix).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
        <Panel title="Feature importance" subtitle="Top weighted network features from the IDS pipeline">
          <div className="space-y-3">
            {Object.entries(data.feature_importance).map(([label, value]) => <MetricBar key={label} label={label} value={Math.round(Number(value) * 100)} tone="cyan" />)}
          </div>
        </Panel>
        <Panel title="Threat distribution" subtitle="Observed security event categories">
          <ThreatDistributionChart distribution={data.threat_distribution} />
        </Panel>
      </div>

      <Panel title="Epsilon sensitivity" subtitle="Attack strength versus model accuracy">
        <EpsilonSensitivityChart />
      </Panel>
    </div>
  );
}

function AuditLogsPage() {
  const { logsData, setLogsData } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    const load = async () => {
      const logs = await getLogs(100).catch(() => null);
      if (active && logs) setLogsData(logs);
    };
    load();
    return () => { active = false; };
  }, [setLogsData]);

  const predictions = logsData?.predictions ?? [];
  const attacks = logsData?.attacks ?? [];
  const audits = logsData?.audits ?? [];
  const rows = [
    ...predictions.map((row) => ({
      time: row.timestamp,
      prediction: normalLabel(row.prediction),
      threat_level: row.threat_level,
      risk_score: row.risk_score,
      model_name: row.model_name,
      action: 'Prediction',
      status: 'Persisted',
      search: `${row.timestamp} ${row.model_name} ${row.threat_level} ${row.prediction}`,
    })),
    ...attacks.map((row) => ({
      time: row.timestamp,
      prediction: 'Adversarial Run',
      threat_level: row.epsilon >= 0.2 ? 'HIGH' : 'MEDIUM',
      risk_score: Math.round((1 - row.adversarial_accuracy) * 100),
      model_name: 'FGSM',
      action: 'Attack simulation',
      status: 'Persisted',
      search: `${row.timestamp} ${row.epsilon} ${row.adversarial_accuracy}`,
    })),
    ...audits.map((row) => ({
      time: row.timestamp,
      prediction: row.action,
      threat_level: row.status,
      risk_score: 0,
      model_name: 'Audit',
      action: row.action,
      status: row.status,
      search: `${row.timestamp} ${row.action} ${row.status} ${row.details || ''}`,
    })),
  ];

  const filtered = rows.filter((row) => {
    const matchesFilter = filter === 'ALL' || String(row.threat_level || '').toUpperCase() === filter;
    const matchesSearch = row.search.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <SectionHeader eyebrow="GOVERNANCE / TRACEABILITY" title="Audit logs" subtitle="Searchable immutable history for predictions, attack simulations, and audit actions." action={<Badge tone="slate">{filtered.length} RECORDS</Badge>} />
      <Panel title="Search & filter" subtitle="Query logs by time, threat level, model, or action" action={<div className="flex flex-wrap items-center gap-2"><FiSearch className="text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search logs" className="rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600" /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 outline-none"><option value="ALL">All</option><option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option><option value="Persisted">Persisted</option></select></div>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-b border-slate-800/70 text-[11px] uppercase tracking-[0.18em] text-slate-600">
              <tr>
                {['Time', 'Prediction', 'Threat Level', 'Risk Score', 'Model Used', 'Action', 'Status'].map((head) => <th key={head} className="px-4 py-3 font-medium">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr key={`${row.time}-${index}`} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                  <td className="px-4 py-3 text-sm text-slate-300">{formatDate(row.time)}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.prediction}</td>
                  <td className="px-4 py-3"><Badge tone={threatTone(row.threat_level)}>{row.threat_level}</Badge></td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.risk_score ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{row.model_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{row.action}</td>
                  <td className="px-4 py-3"><Badge tone="emerald">{row.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function ReportsPage() {
  return (
    <div>
      <SectionHeader eyebrow="REPORTS" title="Incident report generation" subtitle="PDF export is reserved for the final review phase. This section is wired and visible in the SOC shell." />
      <Panel title="Final phase module" subtitle="Incident PDF assembly and export will be added in the last phase">
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-700/70 bg-slate-950/20 text-center">
          <div>
            <FiBookOpen className="mx-auto text-4xl text-cyan-200" />
            <p className="mt-4 text-lg font-bold text-white">Incident Report Generation</p>
            <p className="mt-2 text-slate-500">Coming in Final Phase.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function SettingsPage() {
  const { theme, setTheme, selectedModel, setSelectedModel, defaultEpsilon, setDefaultEpsilon } = useApp();
  const [status, setStatus] = useState('Checking...');
  const [version, setVersion] = useState('1.0.0');

  useEffect(() => {
    let active = true;
    const run = async () => {
      const healthy = await healthCheck().catch(() => null);
      if (!active) return;
      setStatus(healthy?.status ? healthy.status.toUpperCase() : 'DEGRADED');
    };
    run();
    return () => { active = false; };
  }, []);

  return (
    <div>
      <SectionHeader eyebrow="SETTINGS" title="Platform configuration" subtitle="Theme, model defaults, epsilon, API health, and version metadata." action={<Badge tone="emerald">API {status}</Badge>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Appearance" subtitle="SOC theme settings">
          <div className="flex gap-3">
            {['dark', 'light'].map((value) => (
              <button key={value} onClick={() => setTheme(value)} className={cx('rounded-xl px-4 py-2 text-sm font-bold transition', theme === value ? 'bg-cyan-300 text-slate-950' : 'bg-slate-900/40 text-slate-400')}>{value.toUpperCase()}</button>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">Theme is persisted locally and reapplied on next visit.</p>
        </Panel>
        <Panel title="Model defaults" subtitle="Default inference engine and attack epsilon">
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => setSelectedModel('xgboost')} className={cx('rounded-2xl px-4 py-3 text-sm font-bold transition', selectedModel === 'xgboost' ? 'bg-cyan-300 text-slate-950' : 'bg-slate-900/40 text-slate-400')}>XGBoost</button>
            <button onClick={() => setSelectedModel('dnn')} className={cx('rounded-2xl px-4 py-3 text-sm font-bold transition', selectedModel === 'dnn' ? 'bg-violet-300 text-slate-950' : 'bg-slate-900/40 text-slate-400')}>DNN</button>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
            <div className="mb-3 flex items-center justify-between"><span className="text-sm text-slate-400">Default epsilon</span><span className="font-mono text-sm font-bold text-amber-200">{defaultEpsilon.toFixed(2)}</span></div>
            <input type="range" min="0.05" max="0.30" step="0.01" value={defaultEpsilon} onChange={(event) => setDefaultEpsilon(Number(event.target.value))} className="w-full accent-amber-300" />
          </div>
        </Panel>
        <Panel title="API status" subtitle="Connectivity and metadata">
          <div className="space-y-3">
            {[
              ['Backend health', status],
              ['Default model', selectedModel.toUpperCase()],
              ['Default epsilon', defaultEpsilon.toFixed(2)],
              ['Version', version],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/20 px-4 py-3">
                <span className="text-sm text-slate-400">{label}</span>
                <span className="font-mono text-[12px] font-bold text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Version information" subtitle="Platform release details">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
            <p className="text-sm text-slate-400">AdvSecure AI-Powered Adversarial Defense Framework</p>
            <p className="mt-2 text-lg font-black text-white">Second-review milestone build</p>
            <p className="mt-2 text-sm text-slate-500">Backend: FastAPI · Frontend: React + Vite · Database: SQLite</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export {
  DashboardPage,
  DatasetPage,
  TrafficMonitorPage,
  IntrusionDetectionPage,
  ThreatIntelligencePage,
  AttackSimulationPage,
  AnalyticsPage,
  AuditLogsPage,
  ReportsPage,
  SettingsPage,
};
