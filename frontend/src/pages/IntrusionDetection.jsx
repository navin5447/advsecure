import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiRefresh } from 'react-icons/fi';
import { predict } from '../services/api';

const IntrusionDetection = () => {
  const [model, setModel] = useState('xgboost');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sampleInput, setSampleInput] = useState('');

  const handlePredict = async () => {
    if (!sampleInput.trim()) {
      alert('Please enter feature values');
      return;
    }

    try {
      const features = sampleInput.split(',').map(v => parseFloat(v.trim()));
      if (features.length !== 52) {
        alert('Please provide exactly 52 features');
        return;
      }

      setLoading(true);
      const response = await predict(features, model);
      setResult(response.data);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  const ThreatBadge = ({ level }) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'HIGH': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-4 py-2 rounded-full font-semibold text-lg ${colors[level] || colors['LOW']}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Model Selection & Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Prediction</h3>
        
        <div className="space-y-4">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Model</label>
            <div className="flex gap-4">
              {['xgboost', 'dnn'].map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    model === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m === 'xgboost' ? 'XGBoost' : 'Deep Neural Network'}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Features (52 comma-separated values)
            </label>
            <textarea
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              placeholder="Example: 1.5, 2.3, 0.1, ... (52 values)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
            />
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FiZap /> {loading ? 'Processing...' : 'Make Prediction'}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Prediction Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Classification</p>
                <p className="text-3xl font-bold mt-1 text-gray-900">
                  {result.prediction === 1 ? '🚨 ATTACK' : '✓ NORMAL'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Confidence</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-bold text-gray-900">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Threat Level</p>
                <div className="mt-2">
                  <ThreatBadge level={result.threat_level} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Probability</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${result.probability * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{(result.probability * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="text-3xl font-bold mt-1 text-gray-900">{result.risk_score}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Model & Latency</p>
                <p className="text-sm mt-1 text-gray-900">
                  <span className="font-semibold">{result.model_used}</span> • {result.inference_time.toFixed(3)}ms
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export { IntrusionDetectionPage as default } from './SocPages';
