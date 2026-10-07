import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import OAuthCallback from './pages/OAuthCallback';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import KycPolicy from './pages/KycPolicy';
import RiskDisclosure from './pages/RiskDisclosure';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AmbassadorDashboard from './pages/AmbassadorDashboard';
import InstallPWA from './components/InstallPWA';
import AIAssistant from './components/AIAssistant';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <Router>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/kyc-policy" element={<KycPolicy />} />
          <Route path="/risk-disclosure" element={<RiskDisclosure />} />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambassador"
            element={
              <ProtectedRoute ambassadorOnly>
                <AmbassadorDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <InstallPWA />
        <AIAssistant />
        <ToastContainer />
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
