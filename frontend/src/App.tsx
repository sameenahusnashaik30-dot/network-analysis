import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { LiveNetwork } from './pages/LiveNetwork';
import { ZeroDay } from './pages/ZeroDay';
import { KnownAttacks } from './pages/KnownAttacks';
import { XAI } from './pages/XAI';
import { SDNController } from './pages/SDNController';
import { AdversarialTesting } from './pages/AdversarialTesting';
import { Incidents } from './pages/Incidents';
import { Mitigation } from './pages/Mitigation';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex bg-soc-bg min-h-screen text-soc-text font-sans selection:bg-soc-cyan selection:text-black">
        {/* Persistent SOC Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Top Bar */}
        <Header />

        {/* Content View Router */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-network" element={<LiveNetwork />} />
            <Route path="/zero-day" element={<ZeroDay />} />
            <Route path="/known-attacks" element={<KnownAttacks />} />
            <Route path="/xai" element={<XAI />} />
            <Route path="/sdn-controller" element={<SDNController />} />
            <Route path="/adversarial" element={<AdversarialTesting />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/mitigation" element={<Mitigation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
