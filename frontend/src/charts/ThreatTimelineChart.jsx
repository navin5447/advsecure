import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', attacks: 0, normal: 45 },
  { time: '04:00', attacks: 2, normal: 52 },
  { time: '08:00', attacks: 5, normal: 48 },
  { time: '12:00', attacks: 3, normal: 61 },
  { time: '16:00', attacks: 7, normal: 55 },
  { time: '20:00', attacks: 4, normal: 58 },
  { time: '24:00', attacks: 2, normal: 63 },
];

const ThreatTimelineChart = () => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
        />
        <Area type="monotone" dataKey="attacks" stackId="1" stroke="#dc2626" fillOpacity={1} fill="url(#colorAttacks)" name="Attacks" />
        <Area type="monotone" dataKey="normal" stackId="1" stroke="#16a34a" fillOpacity={1} fill="url(#colorNormal)" name="Normal" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ThreatTimelineChart;
