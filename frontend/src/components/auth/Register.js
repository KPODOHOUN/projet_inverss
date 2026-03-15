import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Adresse email invalide');
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Tous les champs obligatoires doivent être remplis');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    if (result.success) {
      navigate('/dashboard');
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

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNum = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const score = [p.length >= 8, hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length;
    const levels = [
      null,
      { label: 'Très faible', pct: 20, color: '#ef4444' },
      { label: 'Faible', pct: 40, color: '#f97316' },
      { label: 'Moyen', pct: 60, color: '#eab308' },
      { label: 'Bon', pct: 80, color: '#22c55e' },
      { label: 'Excellent', pct: 100, color: '#D4AF37' },
    ];
    return levels[score] || levels[1];
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 py-12 relative overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
      </div>

      <div className={`w-full max-w-lg relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

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
          <div className="flex items-center gap-3 mb-5">
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
          <h1 className="text-4xl font-black text-white leading-none mb-2">Inscription</h1>
          <p className="text-gray-500 text-sm">Commencez à investir intelligemment aujourd'hui</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 flex items-center justify-center text-xs font-black transition-all ${step >= 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-700 text-black' : 'bg-gray-800 text-gray-500'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 1 ? 'text-yellow-500' : 'text-gray-600'}`}>
              Identité
            </span>
          </div>
          <div className="flex-1 h-px" style={{
            background: step > 1 ? 'linear-gradient(90deg, rgba(212,175,55,0.6), rgba(212,175,55,0.2))' : 'rgba(255,255,255,0.05)'
          }} />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= 2 ? 'text-yellow-500' : 'text-gray-600'}`}>
              Sécurité
            </span>
            <div className={`w-8 h-8 flex items-center justify-center text-xs font-black transition-all ${step >= 2 ? 'bg-gradient-to-br from-yellow-400 to-yellow-700 text-black' : 'bg-gray-800 text-gray-500'}`}>
              2
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="relative bg-[#0d0d0d] border border-yellow-900/20 p-8">
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }} />

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/50">
                <span className="text-red-400 mt-0.5 text-sm">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <>
                {/* Social Sign Up */}
                <div className="space-y-3 mb-6">
                  <p className="text-xs text-gray-600 text-center tracking-widest uppercase mb-4">Inscription rapide</p>

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
                    S'inscrire avec Google
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
                    S'inscrire avec Facebook
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-yellow-900/20" />
                  <span className="text-xs text-gray-600 font-medium uppercase tracking-widest">ou manuellement</span>
                  <div className="flex-1 h-px bg-yellow-900/20" />
                </div>

                {/* Step 1 Form */}
                <form onSubmit={handleNext} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                        Prénom <span className="text-yellow-500">*</span>
                      </label>
                      <input
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none text-sm"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                        Nom <span className="text-yellow-500">*</span>
                      </label>
                      <input
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none text-sm"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                      Email <span className="text-yellow-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none text-sm"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                      Téléphone <span className="text-gray-600 font-normal normal-case">(optionnel)</span>
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none text-sm"
                      placeholder="+229 XX XX XX XX"
                    />
                  </div>

                  <button
                    type="submit"
                    className="relative w-full py-3.5 overflow-hidden font-black text-black text-sm tracking-widest uppercase transition-all group"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B, #D4AF37)' }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Étape suivante
                      <span>→</span>
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #F0CC5A, #D4AF37, #F0CC5A)' }} />
                  </button>
                </form>
              </>
            ) : (
              /* Step 2: Security */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                    Mot de passe <span className="text-yellow-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none text-sm"
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
                  {/* Password Strength */}
                  {strength && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 h-1.5 bg-gray-800 overflow-hidden mr-3">
                          <div
                            className="h-full transition-all duration-500"
                            style={{ width: `${strength.pct}%`, background: strength.color }}
                          />
                        </div>
                        <span className="text-xs font-bold" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Min. 8 caractères, majuscule, chiffre recommandés</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                    Confirmer le mot de passe <span className="text-yellow-500">*</span>
                  </label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black/50 border text-white placeholder-gray-700 focus:outline-none text-sm transition-colors ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-800/60 focus:border-red-700'
                        : 'border-yellow-900/30 focus:border-yellow-500/60'
                    }`}
                    placeholder="••••••••"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-yellow-900/5 border border-yellow-900/20">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                      className={`w-5 h-5 border-2 flex items-center justify-center transition-all ${
                        acceptedTerms
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-700 border-yellow-500'
                          : 'bg-black/50 border-yellow-900/40 hover:border-yellow-700'
                      }`}
                    >
                      {acceptedTerms && (
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                    J'accepte les{' '}
                    <Link to="/terms" className="text-yellow-500 hover:text-yellow-400 font-semibold" onClick={e => e.stopPropagation()}>
                      conditions d'utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link to="/privacy" className="text-yellow-500 hover:text-yellow-400 font-semibold" onClick={e => e.stopPropagation()}>
                      politique de confidentialité
                    </Link>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="px-5 py-3.5 border border-yellow-900/30 text-gray-400 font-semibold hover:border-yellow-700 hover:text-yellow-500 transition-all text-sm"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className="relative flex-1 py-3.5 overflow-hidden font-black text-black text-sm tracking-widest uppercase transition-all disabled:opacity-50 group"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B, #D4AF37)' }}
                  >
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Création...
                        </span>
                      ) : 'CRÉER MON COMPTE'}
                    </span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #F0CC5A, #D4AF37, #F0CC5A)' }} />
                  </button>
                </div>
              </form>
            )}

            {/* Login Link */}
            <p className="mt-6 text-center text-xs text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors">
                Se connecter
              </Link>
            </p>

            <div className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: '🔒', label: 'Données cryptées' },
            { icon: '🛡️', label: 'Protection KYC' },
            { icon: '✓', label: '2FA disponible' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 border border-yellow-900/10 bg-yellow-900/5">
              <span className="text-base">{icon}</span>
              <span className="text-xs text-yellow-900/70 font-medium text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}