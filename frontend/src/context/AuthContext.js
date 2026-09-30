import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';

const AuthContext = createContext(null);

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiUrl();
    const token = localStorage.getItem('neliaxaToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const AUTH_PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicAuth = AUTH_PUBLIC_ROUTES.some((route) => url.includes(route));
    if (error.response?.status === 401 && !isPublicAuth) {
      localStorage.removeItem('neliaxaToken');
      localStorage.removeItem('neliaxaUser');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const networkErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ERR_NETWORK' || !err.response) {
    return 'Serveur inaccessible. À la racine du projet, lancez « npm run dev » (backend port 5000 + frontend).';
  }
  return 'Erreur de connexion';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('neliaxaToken');
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
        localStorage.setItem('neliaxaUser', JSON.stringify(response.data.data.user));
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Used by the OAuth callback page: the backend already authenticated the
  // user with Google/Facebook and handed us a normal JWT via the redirect
  // URL — store it and fetch the profile exactly like a regular login.
  const loginWithToken = async (token) => {
    try {
      localStorage.setItem('neliaxaToken', token);
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const loggedInUser = response.data.data.user;
        setUser(loggedInUser);
        localStorage.setItem('neliaxaUser', JSON.stringify(loggedInUser));
        return { success: true, user: loggedInUser };
      }
      return { success: false, error: 'Connexion impossible' };
    } catch (err) {
      localStorage.removeItem('neliaxaToken');
      return { success: false, error: err.response?.data?.message || 'Connexion impossible' };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        const { token, user, devOtp } = response.data.data;
        localStorage.setItem('neliaxaToken', token);
        localStorage.setItem('neliaxaUser', JSON.stringify(user));
        if (devOtp) localStorage.setItem('neliaxaDevOtp', devOtp);
        setUser(user);
        return { success: true, requiresEmailVerification: !user.emailVerified, data: response.data };
      }
    } catch (err) {
      const errorMessage = networkErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (otp) => {
    try {
      setError(null);
      const response = await api.post('/auth/verify-otp', { otp });
      if (response.data.success) {
        const updatedUser = response.data.data.user || { ...user, emailVerified: true };
        setUser(updatedUser);
        localStorage.setItem('neliaxaUser', JSON.stringify(updatedUser));
        localStorage.removeItem('neliaxaDevOtp');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.data?.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Code invalide ou expiré';
      return { success: false, error: msg };
    }
  };

  const resendOTP = async () => {
    try {
      setError(null);
      const response = await api.post('/auth/send-otp');
      if (response.data?.data?.devOtp) localStorage.setItem('neliaxaDevOtp', response.data.data.devOtp);
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur';
      return { success: false, error: msg };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        const { token, user, emailVerificationRequired } = response.data.data;
        localStorage.setItem('neliaxaToken', token);
        localStorage.setItem('neliaxaUser', JSON.stringify(user));
        setUser(user);
        return { success: true, requiresEmailVerification: emailVerificationRequired, data: response.data };
      }
      const msg = response.data.message || 'Connexion impossible';
      setError(msg);
      return { success: false, error: msg };
    } catch (err) {
      const errorMessage = networkErrorMessage(err);
      const requires2FA = err.response?.data?.requires2FA || false;
      setError(errorMessage);
      return { success: false, error: errorMessage, requires2FA };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('neliaxaToken');
      localStorage.removeItem('neliaxaUser');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put('/user/profile', profileData);
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('neliaxaUser', JSON.stringify(updatedUser));
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur de mise à jour';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwords) => {
    try {
      setError(null);
      const response = await api.put('/user/change-password', passwords);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur de mot de passe';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const setup2FA = async () => {
    try {
      setError(null);
      const response = await api.post('/auth/2fa/setup');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur 2FA';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verify2FA = async (token) => {
    try {
      setError(null);
      const response = await api.post('/auth/2fa/verify', { token });
      if (response.data.success) {
        const updatedUser = { ...user, twoFactorEnabled: true };
        setUser(updatedUser);
        localStorage.setItem('neliaxaUser', JSON.stringify(updatedUser));
      }
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur 2FA';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const disable2FA = async (password) => {
    try {
      setError(null);
      const response = await api.post('/auth/2fa/disable', { password });
      if (response.data.success) {
        const updatedUser = { ...user, twoFactorEnabled: false };
        setUser(updatedUser);
        localStorage.setItem('neliaxaUser', JSON.stringify(updatedUser));
      }
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur 2FA';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur';
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const response = await api.post('/auth/reset-password', { token, password: newPassword });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user, loading, error,
    register, verifyEmail, resendOTP,
    login, loginWithToken, logout, updateProfile, changePassword,
    setup2FA, verify2FA, disable2FA,
    forgotPassword, resetPassword,
    isAuthenticated: !!user,
    requiresEmailVerification: user ? !user.emailVerified : false,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
