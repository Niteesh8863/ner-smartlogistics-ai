import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AccessibilityMap } from './pages/AccessibilityMap';
import { DisruptionPredictions } from './pages/DisruptionPredictions';
import { RoutePlanner } from './pages/RoutePlanner';
import { VehicleTracking } from './pages/VehicleTracking';
import { Consignments } from './pages/Consignments';
import { IncidentReporting } from './pages/IncidentReporting';
import { IncidentVerification } from './pages/IncidentVerification';
import { AlertsCenter } from './pages/AlertsCenter';
import { AnalyticsReports } from './pages/AnalyticsReports';
import { DataSourcesHealth } from './pages/DataSourcesHealth';
import { UserManagement } from './pages/UserManagement';
import { AuditLogs } from './pages/AuditLogs';
import { SettingsPage } from './pages/Settings';

const AppLayout: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar
        selectedState={selectedState}
        onSelectState={setSelectedState}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard selectedState={selectedState} />} />
            <Route path="/map" element={<AccessibilityMap selectedState={selectedState} />} />
            <Route path="/predictions" element={<DisruptionPredictions selectedState={selectedState} />} />
            <Route path="/routes" element={<RoutePlanner />} />
            <Route path="/vehicles" element={<VehicleTracking />} />
            <Route path="/consignments" element={<Consignments />} />
            <Route path="/reporting" element={<IncidentReporting />} />
            <Route path="/verification" element={<IncidentVerification selectedState={selectedState} />} />
            <Route path="/alerts" element={<AlertsCenter selectedState={selectedState} />} />
            <Route path="/analytics" element={<AnalyticsReports selectedState={selectedState} />} />
            <Route path="/integrations" element={<DataSourcesHealth />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
