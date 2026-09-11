import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { getLogs } from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [threatFilter, setThreatFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getLogs(100);
        setLogs(response.data.predictions || []);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.threat_level?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = threatFilter === 'all' || log.threat_level === threatFilter;
    return matchesSearch && matchesFilter;
  });

  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent ml-2 outline-none text-sm flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg outline-none"
            >
              <option value="all">All Threats</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Prediction</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Confidence</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Risk Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Threat Level</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-medium">{log.model_name}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    log.prediction === 1
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {log.prediction === 1 ? 'Attack' : 'Normal'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{(log.confidence * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-sm font-medium">{log.risk_score.toFixed(1)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    log.threat_level === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : log.threat_level === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {log.threat_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {paginatedLogs.length ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded-lg">{page} of {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export { AuditLogsPage as default } from './SocPages';
