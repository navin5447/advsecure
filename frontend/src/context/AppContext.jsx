import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  theme: 'advsecure-theme',
  model: 'advsecure-model',
  epsilon: 'advsecure-epsilon',
};

export const AppProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [logsData, setLogsData] = useState(null);
  const [modelsData, setModelsData] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [trafficRows, setTrafficRows] = useState([]);
  const [lastPrediction, setLastPrediction] = useState(null);
  const [lastAttack, setLastAttack] = useState(null);
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem(STORAGE_KEYS.model) ?? 'xgboost');
  const [defaultEpsilon, setDefaultEpsilon] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.epsilon) ?? 0.1));
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) ?? 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default on large screens for better desktop UX
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.model, selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.epsilon, String(defaultEpsilon));
  }, [defaultEpsilon]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(() => ({
    dashboardData,
    setDashboardData,
    analyticsData,
    setAnalyticsData,
    logsData,
    setLogsData,
    modelsData,
    setModelsData,
    predictionHistory,
    setPredictionHistory,
    trafficRows,
    setTrafficRows,
    lastPrediction,
    setLastPrediction,
    lastAttack,
    setLastAttack,
    selectedModel,
    setSelectedModel,
    defaultEpsilon,
    setDefaultEpsilon,
    theme,
    setTheme,
    sidebarOpen,
    setSidebarOpen,
  }), [
    dashboardData,
    analyticsData,
    logsData,
    modelsData,
    predictionHistory,
    trafficRows,
    lastPrediction,
    lastAttack,
    selectedModel,
    defaultEpsilon,
    theme,
    sidebarOpen,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
