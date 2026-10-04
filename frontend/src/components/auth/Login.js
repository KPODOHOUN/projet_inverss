import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/apiUrl';
import useForceDarkMode from '../../hooks/useForceDarkMode';

const OAUTH_ERROR_MESSAGES = {
  google_not_configured: "La connexion Google n'est pas encore configurée sur ce site.",
  google_failed: 'La connexion avec Google a échoué. Réessayez.',
  oauth_missing_token: 'Connexion interrompue. Réessayez.',
};

export default function Login() {
  useForceDarkMode();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({ email: '', password: '', twoFactorCode: '' });
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/health`, { cache: 'no-store' });
        if (!cancelled) setServerStatus(res.ok ? 'online' : 'offline');
      } catch {
        if (!cancelled) setServerStatus('offline');
      }
    };
    check();
    const timer = setInterval(check, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) setError(OAUTH_ERROR_MESSAGES[oauthError] || 'Connexion impossible.');
  }, [searchParams]);

  const handleSocialLogin = (provider) => {
    setSocialLoading(provider);
    window.location.href = `${getApiUrl()}/auth/${provider}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData);
    if (result.success) {
      if (result.requiresEmailVerification) {
        navigate('/verify-email');
      } else {
        const role = result.data?.data?.user?.role;
        if (role === 'admin' || role === 'superadmin') navigate('/admin');
        else if (role === 'ambassador') navigate('/ambassador');
        else navigate('/dashboard');
      }
    } else if (result.requires2FA) {
      setRequires2FA(true);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-6 text-sm text-yellow-500 hover:text-yellow-400">
          ← Accueil
        </Link>

        <div className="mb-6">
          <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-12 w-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-1">
            {requires2FA ? 'Vérification 2FA' : 'Connexion'}
          </h1>
          <p className="text-gray-400 text-sm">
            {requires2FA
              ? 'Code de votre application d\'authentification'
              : 'Accédez à votre espace investisseur'}
          </p>
        </div>

        <div className="imc-auth-card p-5">

            {serverStatus === 'offline' && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-orange-950/50 border border-orange-800/40 rounded">
                <span className="text-orange-400 mt-0.5 text-sm flex-shrink-0">⚠</span>
                <div className="text-orange-200 text-sm">
                  <p className="font-semibold">Serveur backend hors ligne</p>
                  <p className="mt-1 text-orange-300/80">
                    Lancez <code className="text-orange-100 bg-black/30 px-1 rounded">npm run dev</code> à la racine du projet.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-950/60 border border-red-800/40 rounded animate-fadeIn">
                <span className="text-red-400 mt-0.5 text-sm flex-shrink-0">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {!requires2FA ? (
              <>
                <div className="space-y-3 mb-6">
                  <p className="text-xs text-gray-600 text-center tracking-widest uppercase mb-4">Connexion rapide</p>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={!!socialLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-white/[0.03] border border-white/[0.08] text-white font-semibold hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 text-sm rounded disabled:opacity-50"
                  >
                    {socialLoading === 'google' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continuer avec Google
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-900/30 to-transparent" />
                  <span className="text-xs text-gray-600 font-medium uppercase tracking-widest">ou</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-900/30 to-transparent" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="group/input">
                    <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase transition-colors duration-300 group-focus-within/input:text-yellow-400">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 text-sm rounded"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="group/input">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-yellow-600 tracking-widest uppercase transition-colors duration-300 group-focus-within/input:text-yellow-400">Mot de passe</label>
                      <Link to="/forgot-password" className="text-xs text-gray-600 hover:text-yellow-500 transition-colors duration-300">Oublié ?</Link>
                    </div>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 text-sm rounded"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-500 transition-all duration-300 p-1"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="imc-btn-primary w-full !py-3.5 disabled:opacity-50">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Connexion...
                      </span>
                    ) : 'Se connecter'}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-4 bg-yellow-900/[0.08] border border-yellow-900/25 rounded text-center">
                  <p className="text-sm text-gray-400">
                    Code à 6 chiffres de votre application d&apos;authentification
                  </p>
                </div>
                <input
                  name="twoFactorCode"
                  type="text"
                  required
                  value={formData.twoFactorCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white text-center text-xl font-mono tracking-[0.4em] focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 rounded"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                  inputMode="numeric"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="px-5 py-3.5 border border-yellow-900/30 text-gray-400 font-semibold hover:border-yellow-700 hover:text-yellow-500 transition-all duration-300 text-sm rounded"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || formData.twoFactorCode.length !== 6}
                    className="imc-btn-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Vérification...' : 'Vérifier'}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-5 text-center text-xs text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300">Créer un compte</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
