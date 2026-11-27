import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
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
import { authService } from './services/auth';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans antialiased">
      {/* Persistent SOC Navigation Sidebar */}
      <Sidebar />

      {/* Dynamic Top Bar */}
      <Header />

      {/* Content View Router */}
      <main className="flex-1 w-full min-w-0">
        {children}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Authentication Route */}
        <Route
          path="/login"
          element={
            authService.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Protected Application Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Navigate to="/dashboard" replace />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/live-network"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <LiveNetwork />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/zero-day"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ZeroDay />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/known-attacks"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <KnownAttacks />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/xai"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <XAI />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sdn-controller"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SDNController />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/adversarial"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AdversarialTesting />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/incidents"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Incidents />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mitigation"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Mitigation />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Reports />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
