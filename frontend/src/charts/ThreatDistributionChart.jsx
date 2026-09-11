import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Normal', value: 8000, color: '#16a34a' },
  { name: 'DoS', value: 800, color: '#dc2626' },
  { name: 'DDoS', value: 600, color: '#ea580c' },
  { name: 'Port Scan', value: 400, color: '#f59e0b' },
  { name: 'Brute Force', value: 200, color: '#8b5cf6' },
];

const ThreatDistributionChart = () => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ThreatDistributionChart;
