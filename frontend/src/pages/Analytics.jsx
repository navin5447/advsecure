import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getAnalytics } from '../services/api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAnalytics();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const performanceData = [
    { metric: 'Accuracy', value: 99.7, fullMark: 100 },
    { metric: 'Precision', value: 99.5, fullMark: 100 },
    { metric: 'Recall', value: 99.0, fullMark: 100 },
    { metric: 'F1 Score', value: 99.25, fullMark: 100 },
  ];

  const epsilonData = [
    { epsilon: 0.05, accuracy: 98.5 },
    { epsilon: 0.10, accuracy: 96.2 },
    { epsilon: 0.20, accuracy: 88.5 },
    { epsilon: 0.30, accuracy: 75.3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const MetricCard = ({ label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-lg shadow p-6 border-t-4 ${color}`}
    >
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{(value * 100).toFixed(2)}%</p>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Accuracy" value={data?.accuracy || 0} color="border-blue-600" />
        <MetricCard label="Precision" value={data?.precision || 0} color="border-green-600" />
        <MetricCard label="Recall" value={data?.recall || 0} color="border-purple-600" />
        <MetricCard label="F1 Score" value={data?.f1_score || 0} color="border-orange-600" />
      </div>

      {/* Radar Chart - Model Performance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={performanceData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Score" dataKey="value" stroke="#1e40af" fill="#1e40af" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Epsilon Sensitivity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Epsilon Sensitivity Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={epsilonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epsilon" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#1e40af" 
              strokeWidth={2}
              dot={{ fill: '#1e40af', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Confusion Matrix */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confusion Matrix</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <p className="text-sm text-green-700 font-medium">True Positives</p>
            <p className="text-4xl font-bold text-green-600 mt-2">792</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <p className="text-sm text-red-700 font-medium">False Positives</p>
            <p className="text-4xl font-bold text-red-600 mt-2">8</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <p className="text-sm text-red-700 font-medium">False Negatives</p>
            <p className="text-4xl font-bold text-red-600 mt-2">4</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg text-center">
            <p className="text-sm text-green-700 font-medium">True Negatives</p>
            <p className="text-4xl font-bold text-green-600 mt-2">1396</p>
          </div>
        </div>
      </motion.div>

      {/* ROC AUC */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model ROC AUC</h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg text-center">
          <p className="text-sm text-gray-600 font-medium">ROC AUC Score</p>
          <p className="text-6xl font-bold text-blue-600 mt-2">{(data?.roc_auc * 100).toFixed(2)}%</p>
          <p className="text-gray-600 mt-2">Excellent model discrimination</p>
        </div>
      </motion.div>
    </div>
  );
};

export { AnalyticsPage as default } from './SocPages';
