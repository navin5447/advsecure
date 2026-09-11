import { motion } from 'framer-motion';

const Dataset = () => {
  const stats = [
    { label: 'Total Samples', value: '10,000', color: 'bg-blue-100' },
    { label: 'Features', value: '52', color: 'bg-purple-100' },
    { label: 'Training Samples', value: '8,000', color: 'bg-green-100' },
    { label: 'Test Samples', value: '2,000', color: 'bg-orange-100' },
  ];

  const classDistribution = [
    { label: 'Normal', value: 8000, percentage: 80 },
    { label: 'Attack', value: 2000, percentage: 20 },
  ];

  const features = [
    'Flow Duration', 'Total Fwd Packets', 'Total Bwd Packets', 'Total Length Fwd Packets',
    'Total Length Bwd Packets', 'Fwd Packet Length Max', 'Fwd Packet Length Min', 'Fwd Packet Length Mean',
    'Bwd Packet Length Max', 'Bwd Packet Length Min', 'Bwd Packet Length Mean', 'Flow Bytes/s',
    'Flow Packets/s', 'Flow IAT Mean', 'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min',
  ];

  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${stat.color} rounded-lg p-6 text-center`}
          >
            <p className="text-sm font-medium text-gray-700">{stat.label}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Class Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Distribution</h3>
        <div className="space-y-4">
          {classDistribution.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900">{item.label}</span>
                <span className="text-gray-600">{item.value.toLocaleString()} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${item.label === 'Normal' ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Features (52 total)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-700 font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preprocessing Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preprocessing Pipeline</h3>
        <ul className="space-y-2 text-gray-700">
          <li>✓ Missing values removed</li>
          <li>✓ Duplicates removed</li>
          <li>✓ Binary classification (Normal/Attack)</li>
          <li>✓ StandardScaler normalization applied</li>
          <li>✓ Train/test split (80/20)</li>
          <li>✓ Stratified sampling to maintain class balance</li>
        </ul>
      </motion.div>
    </div>
  );
};

export { DatasetPage as default } from './SocPages';
