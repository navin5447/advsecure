import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiSearch } from 'react-icons/fi';
import { predictCSV } from '../services/api';

const TrafficMonitor = () => {
  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await predictCSV(formData);
      setPredictions(response.data.predictions || []);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter((pred) =>
    pred.threat_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Traffic Data</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Click to upload CSV file</p>
            <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
          </label>
        </div>

        {file && (
          <p className="mt-2 text-sm text-green-600">✓ {file.name}</p>
        )}
      </motion.div>

      {/* Data Table */}
      {predictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Traffic Records ({filteredPredictions.length})</h3>
            
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <FiSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Filter by threat level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent ml-2 outline-none text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Timestamp</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Model</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Prediction</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Confidence</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Threat Level</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.slice(0, 10).map((pred, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-600">{new Date(pred.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{pred.model_used}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pred.prediction === 1
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {pred.prediction === 1 ? 'Attack' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{(pred.confidence * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pred.threat_level === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : pred.threat_level === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {pred.threat_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{pred.risk_score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export { TrafficMonitorPage as default } from './SocPages';
