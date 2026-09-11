import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const unwrap = (response) => response.data;

export const predictTraffic = (data, model = 'xgboost') =>
  api.post('/predict', { data, model }).then(unwrap);

export const predictTrafficCsv = (file, model = 'xgboost') => {
  const formData = new FormData();
  formData.append('file', file);

  return api
    .post(`/predict/csv?model=${encodeURIComponent(model)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(unwrap);
};

export const simulateAttack = (data, epsilon, attackType = 'dnn', labels = null) =>
  api.post('/attack', { data, epsilon, attack_type: attackType, labels }).then(unwrap);

export const getDashboard = () => api.get('/dashboard').then(unwrap);
export const getAnalytics = () => api.get('/analytics').then(unwrap);
export const getLogs = (limit = 100) => api.get(`/logs?limit=${limit}`).then(unwrap);
export const getModels = () => api.get('/models').then(unwrap);
export const getTrafficSample = (label = 'Attack') => api.get(`/sample/traffic?label=${encodeURIComponent(label)}`).then(unwrap);
export const getTrafficBatch = (limit = 25) => api.get(`/sample/traffic-batch?limit=${limit}`).then(unwrap);
export const healthCheck = () => api.get('/health').then(unwrap);

export const readCsvRows = async (file) => {
  const text = await file.text();
  const lines = text.trim().split(/\r?\n/);

  return lines.slice(0, 250).map((line, index) => ({
    id: index + 1,
    values: line.split(',').map((value) => value.trim()),
    raw: line,
  }));
};
