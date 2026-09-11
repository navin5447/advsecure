import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiToggle2, FiGlobe } from 'react-icons/fi';

const Settings = () => {
  const [theme, setTheme] = useState('light');
  const [model, setModel] = useState('xgboost');
  const [epsilon, setEpsilon] = useState(0.1);
  const [apiStatus, setApiStatus] = useState('connected');

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiToggle2 /> Theme
        </h3>
        <div className="space-y-3">
          {['light', 'dark'].map(t => (
            <label key={t} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={t}
                checked={theme === t}
                onChange={(e) => setTheme(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-2 text-gray-700 capitalize">{t} Mode</span>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Model Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Model</h3>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="xgboost">XGBoost (Fast & Accurate)</option>
          <option value="dnn">Deep Neural Network (Gradient-based)</option>
        </select>
      </motion.div>

      {/* Epsilon Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Epsilon</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-gray-600">Current value: {epsilon}</p>
        </div>
      </motion.div>

      {/* API Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiGlobe /> API Status
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="font-semibold text-gray-900 capitalize">{apiStatus}</p>
            <p className="text-sm text-gray-600">API is operational</p>
          </div>
        </div>
      </motion.div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Version Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Application</span>
            <span className="font-semibold">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">API</span>
            <span className="font-semibold">v1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Database</span>
            <span className="font-semibold">SQLite 3.42.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Last Updated</span>
            <span className="font-semibold">2024-01-12</span>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
        Save Settings
      </button>
    </div>
  );
};

export { SettingsPage as default } from './SocPages';
