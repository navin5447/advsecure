import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './layouts/Navbar';
import Sidebar from './layouts/Sidebar';
import {
  AnalyticsPage,
  AttackSimulationPage,
  AuditLogsPage,
  DashboardPage,
  DatasetPage,
  IntrusionDetectionPage,
  ReportsPage,
  SettingsPage,
  ThreatIntelligencePage,
  TrafficMonitorPage,
} from './pages/SocPages';

import './styles/globals.css';

function Shell() {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:pl-[272px]">
        <Navbar />
        <main className="console-grid min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dataset" element={<DatasetPage />} />
              <Route path="/traffic-monitor" element={<TrafficMonitorPage />} />
              <Route path="/detection" element={<IntrusionDetectionPage />} />
              <Route path="/threat-intelligence" element={<ThreatIntelligencePage />} />
              <Route path="/attack-simulation" element={<AttackSimulationPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
