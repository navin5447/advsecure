import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiCheckCircle, FiShield } from 'react-icons/fi';

const ThreatIntelligence = () => {
  const [activeTab, setActiveTab] = useState('all');

  const threats = [
    {
      id: 1,
      level: 'HIGH',
      category: 'DDoS Attack',
      riskScore: 92,
      confidence: 0.95,
      impact: 'Critical network impact detected',
      mitigation: 'Block suspicious IP immediately and engage ISP',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      level: 'MEDIUM',
      category: 'Port Scan',
      riskScore: 65,
      confidence: 0.78,
      impact: 'Potential reconnaissance activity',
      mitigation: 'Enable IDS/IPS and restrict network access',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      level: 'LOW',
      category: 'Normal Traffic',
      riskScore: 15,
      confidence: 0.99,
      impact: 'No threat detected',
      mitigation: 'Continue monitoring',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
  ];

  const ThreatCard = ({ threat }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600 hover:shadow-lg transition"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {threat.level === 'HIGH' ? (
            <FiAlertTriangle className="text-3xl text-red-600" />
          ) : threat.level === 'MEDIUM' ? (
            <FiShield className="text-3xl text-yellow-600" />
          ) : (
            <FiCheckCircle className="text-3xl text-green-600" />
          )}
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{threat.category}</h4>
            <p className="text-sm text-gray-500">{new Date(threat.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          threat.level === 'HIGH'
            ? 'bg-red-100 text-red-800'
            : threat.level === 'MEDIUM'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {threat.level}
        </span>
      </div>

      <div className="space-y-3">
        {/* Risk Score */}
        <div>
          <p className="text-sm text-gray-600 font-medium">Risk Score</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  threat.riskScore > 70 ? 'bg-red-600' : 'bg-yellow-600'
                }`}
                style={{ width: `${threat.riskScore}%` }}
              />
            </div>
            <span className="font-semibold text-gray-900 min-w-fit">{threat.riskScore}%</span>
          </div>
        </div>

        {/* Confidence */}
        <div>
          <p className="text-sm text-gray-600 font-medium">Confidence</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{(threat.confidence * 100).toFixed(0)}%</p>
        </div>

        {/* Business Impact */}
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-600 font-medium">BUSINESS IMPACT</p>
          <p className="text-sm text-gray-900 mt-1">{threat.impact}</p>
        </div>

        {/* Recommended Mitigation */}
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-xs text-blue-600 font-medium">RECOMMENDED MITIGATION</p>
          <p className="text-sm text-blue-900 mt-1">{threat.mitigation}</p>
        </div>
      </div>
    </motion.div>
  );

  const filteredThreats = threats.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'high') return t.level === 'HIGH';
    if (activeTab === 'medium') return t.level === 'MEDIUM';
    if (activeTab === 'low') return t.level === 'LOW';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Threats', value: threats.length, color: 'bg-red-100 text-red-800' },
          { label: 'High Risk', value: threats.filter(t => t.level === 'HIGH').length, color: 'bg-red-100 text-red-800' },
          { label: 'Medium Risk', value: threats.filter(t => t.level === 'MEDIUM').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Avg Confidence', value: '92%', color: 'bg-blue-100 text-blue-800' },
        ].map((stat, idx) => (
          <motion.div key={idx} className={`rounded-lg p-4 ${stat.color}`}>
            <p className="text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          {['all', 'high', 'medium', 'low'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Threat Cards */}
      <div className="space-y-4">
        {filteredThreats.map(threat => (
          <ThreatCard key={threat.id} threat={threat} />
        ))}
      </div>
    </div>
  );
};

export { ThreatIntelligencePage as default } from './SocPages';
