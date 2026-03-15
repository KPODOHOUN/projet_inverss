import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '', twoFactorCode: '' });
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const role = result.data?.data?.user?.role;
      if (role === 'admin' || role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else if (result.requires2FA) {
      setRequires2FA(true);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      window.location.href = `${apiUrl}/auth/${provider}`;
    } catch (err) {
      setError(`Erreur lors de la connexion avec ${provider}`);
      setSocialLoading('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />
        {}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.10) 0%, transparent 70%)' }} />
        {}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        {}
        <div className="absolute top-0 left-1/4 w-px h-full opacity-10"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.6), transparent)' }} />
        <div className="absolute top-0 right-1/3 w-px h-full opacity-5"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.4), transparent)' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {}
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-8 text-yellow-600 hover:text-yellow-400 font-semibold text-sm tracking-widest uppercase transition-colors group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Accueil
        </Link>

        {}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <img
                src="/images/logo-neliaxa.png"
                alt="NELIAXA"
                className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.4em] text-yellow-600 font-bold uppercase">NELIAXA</p>
              <p className="text-xs text-gray-600 tracking-widest uppercase">Investment Platform</p>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white leading-none mb-2">
            {requires2FA ? 'Vérification' : 'Connexion'}
          </h1>
          <p className="text-gray-500 text-sm">
            {requires2FA
              ? 'Entrez le code de votre application 2FA'
              : 'Accédez à votre espace investisseur'}
          </p>
        </div>

        {}
        <div className="relative">
          {}
          <div className="absolute inset-0 -m-px rounded-none opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.3), transparent 50%, rgba(212,175,55,0.1))', pointerEvents: 'none' }} />

          <div className="relative bg-[#0d0d0d] border border-yellow-900/20 p-8">
            {}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }} />

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/50">
                <span className="text-red-400 mt-0.5 text-sm">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {!requires2FA ? (
              <>
                {}
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={!!socialLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all text-sm disabled:opacity-50"
                  >
                    {socialLoading === 'google' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continuer avec Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={!!socialLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-[#1877F2]/10 border border-[#1877F2]/30 text-white font-semibold hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 transition-all text-sm disabled:opacity-50"
                  >
                    {socialLoading === 'facebook' ? (
                      <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    Continuer avec Facebook
                  </button>
                </div>

                {}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-yellow-900/20" />
                  <span className="text-xs text-gray-600 font-medium uppercase tracking-widest">ou</span>
                  <div className="flex-1 h-px bg-yellow-900/20" />
                </div>

                {}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black transition-all text-sm"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="block text-xs font-bold text-yellow-600 tracking-widest uppercase">
                        Mot de passe
                      </label>
                      <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-yellow-500 transition-colors">
                        Oublié ?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black transition-all text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-500 transition-colors p-1"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3.5 overflow-hidden font-black text-black text-sm tracking-widest uppercase transition-all disabled:opacity-50 group"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B, #D4AF37)' }}
                  >
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Connexion...
                        </span>
                      ) : 'SE CONNECTER'}
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #F0CC5A, #D4AF37, #F0CC5A)' }} />
                  </button>
                </form>
              </>
            ) : (
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 bg-yellow-900/10 border border-yellow-900/30 text-center">
                  <div className="text-4xl mb-2">🔐</div>
                  <p className="text-sm text-gray-400">
                    Entrez le code à 6 chiffres de votre application d'authentification
                  </p>
                </div>
                <div>
                  <label htmlFor="twoFactorCode" className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                    Code 2FA
                  </label>
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    required
                    value={formData.twoFactorCode}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-black/50 border border-yellow-900/30 text-white focus:border-yellow-500/60 focus:outline-none text-center text-3xl font-mono tracking-[0.5em]"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="off"
                    inputMode="numeric"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="flex-1 py-3 border border-yellow-900/30 text-gray-400 font-semibold hover:border-yellow-600 hover:text-yellow-500 transition-all text-sm"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || formData.twoFactorCode.length !== 6}
                    className="flex-2 flex-grow py-3 font-black text-black text-sm tracking-widest uppercase disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B)' }}
                  >
                    {loading ? 'VÉRIFICATION...' : 'VÉRIFIER'}
                  </button>
                </div>
              </form>
            )}

            {/* Register Link */}
            <p className="mt-6 text-center text-xs text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors">
                Créer un compte
              </Link>
            </p>

            {/* Bottom border accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-yellow-900">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            SSL Sécurisé
          </div>
          <div className="w-px h-3 bg-yellow-900/30" />
          <div className="flex items-center gap-1.5 text-xs text-yellow-900">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Données cryptées
          </div>
          <div className="w-px h-3 bg-yellow-900/30" />
          <div className="flex items-center gap-1.5 text-xs text-yellow-900">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            2FA disponible
          </div>
        </div>
      </div>
    </div>
  );
}