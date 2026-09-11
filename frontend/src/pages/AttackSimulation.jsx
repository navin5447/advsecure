import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateAttack } from '../services/api';

const AttackSimulation = () => {
  const [epsilon, setEpsilon] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [attackType, setAttackType] = useState('xgboost');

  const epsilonOptions = [0.05, 0.10, 0.20, 0.30];

  const handleSimulateAttack = async () => {
    try {
      setLoading(true);
      // Generate sample data for demonstration
      const sampleData = Array(52).fill(0).map(() => Math.random());
      
      const response = await generateAttack([sampleData], epsilon, attackType);
      setResult(response.data);
    } catch (error) {
      console.error('Attack simulation error:', error);
      alert('Failed to simulate attack');
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const chartData = result ? [
    {
      name: 'Original',
      accuracy: result.original_accuracy * 100,
      adversarial: 0
    },
    {
      name: 'Adversarial',
      accuracy: 0,
      adversarial: result.adversarial_accuracy * 100
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Adversarial Attack Configuration</h3>

        <div className="space-y-6">
          {/* Attack Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Attack Target Model</label>
            <div className="flex gap-4">
              {['xgboost', 'dnn'].map((type) => (
                <button
                  key={type}
                  onClick={() => setAttackType(type)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    attackType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'xgboost' ? 'XGBoost' : 'DNN'}
                </button>
              ))}
            </div>
          </div>

          {/* Epsilon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Perturbation Strength (epsilon): {epsilon}
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={epsilon}
                onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex gap-2">
                {epsilonOptions.map((eps) => (
                  <button
                    key={eps}
                    onClick={() => setEpsilon(eps)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      epsilon === eps
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {eps}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulate Button */}
          <button
            onClick={handleSimulateAttack}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2"
          >
            <FiZap /> {loading ? 'Generating Attack...' : 'Generate FGSM Attack'}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {result && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <p className="text-sm text-gray-600 font-medium">Original Accuracy</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {(result.original_accuracy * 100).toFixed(2)}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <p className="text-sm text-gray-600 font-medium">Adversarial Accuracy</p>
              <p className="text-4xl font-bold text-red-600 mt-2">
                {(result.adversarial_accuracy * 100).toFixed(2)}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <p className="text-sm text-gray-600 font-medium">Accuracy Loss</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">
                {(result.accuracy_loss * 100).toFixed(2)}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <p className="text-sm text-gray-600 font-medium">Predictions Changed</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">
                {result.prediction_changes}
              </p>
            </motion.div>
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" fill="#16a34a" name="Original Accuracy" />
                <Bar dataKey="adversarial" fill="#dc2626" name="Adversarial Accuracy" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Detailed Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attack Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Features Modified</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.feature_changes_count}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Avg Confidence Drop</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{(result.avg_confidence_drop * 100).toFixed(2)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Epsilon Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{result.epsilon}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{new Date(result.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export { AttackSimulationPage as default } from './SocPages';
