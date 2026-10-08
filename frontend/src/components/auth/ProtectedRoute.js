import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, ambassadorOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (ambassadorOnly && user.role !== 'ambassador' && user.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
