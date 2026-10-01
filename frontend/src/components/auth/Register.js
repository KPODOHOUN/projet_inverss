import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/apiUrl';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [step, setStep] = useState(1);
  const referralCode = searchParams.get('ref') || '';

  const handleSocialLogin = (provider) => {
    setSocialLoading(provider);
    window.location.href = `${getApiUrl()}/auth/${provider}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
    if (formData.password.length < 8 || !/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, avec une lettre et un chiffre');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (!acceptedTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
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
    const result = await register(referralCode ? { ...userData, referralCode } : userData);
    if (result.success) {
      if (result.requiresEmailVerification) navigate('/verify-email');
      else navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    const checks = [p.length >= 8, /[A-Z]/.test(p), /[a-z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)];
    const score = checks.filter(Boolean).length;
    const levels = [null, { label: 'Très faible', pct: 20, color: '#ef4444' }, { label: 'Faible', pct: 40, color: '#f97316' }, { label: 'Moyen', pct: 60, color: '#eab308' }, { label: 'Bon', pct: 80, color: '#22c55e' }, { label: 'Excellent', pct: 100, color: '#D4AF37' }];
    return levels[score] || levels[1];
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-block mb-6 text-sm text-yellow-500 hover:text-yellow-400">
          ← Accueil
        </Link>

        <div className="mb-6">
          <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-12 w-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-1">Inscription</h1>
          <p className="text-gray-400 text-sm">Créez votre compte investisseur</p>
          {referralCode && (
            <p className="mt-2 text-xs text-yellow-400">Code parrain : {referralCode}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className={step >= 1 ? 'text-yellow-400' : 'text-gray-500'}>1. Identité</span>
          <span className="text-gray-600">→</span>
          <span className={step >= 2 ? 'text-yellow-400' : 'text-gray-500'}>2. Sécurité</span>
        </div>

        <div className="imc-auth-card p-5">

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-950/60 border border-red-800/40 rounded animate-fadeIn">
                <span className="text-red-400 mt-0.5 text-sm flex-shrink-0">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <>
                <div className="space-y-3 mb-6">
                  <p className="text-xs text-gray-600 text-center tracking-widest uppercase mb-4">Inscription rapide</p>
                  <button type="button" onClick={() => handleSocialLogin('google')} disabled={!!socialLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-white/[0.03] border border-white/[0.08] text-white font-semibold hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 text-sm rounded disabled:opacity-50">
                    {socialLoading === 'google' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    )} S'inscrire avec Google
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-900/30 to-transparent" />
                  <span className="text-xs text-gray-600 font-medium uppercase tracking-widest">ou manuellement</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-900/30 to-transparent" />
                </div>

                <form onSubmit={handleNext} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group/input">
                      <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase transition-colors duration-300 group-focus-within/input:text-yellow-400">Prénom <span className="text-yellow-500">*</span></label>
                      <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 text-sm rounded" placeholder="Jean" />
                    </div>
                    <div className="group/input">
                      <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase transition-colors duration-300 group-focus-within/input:text-yellow-400">Nom <span className="text-yellow-500">*</span></label>
                      <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 text-sm rounded" placeholder="Dupont" />
                    </div>
                  </div>
                  <div className="group/input">
                    <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase transition-colors duration-300 group-focus-within/input:text-yellow-400">Email <span className="text-yellow-500">*</span></label>
                    <input name="email" type="email" required value={formData.email} onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 text-sm rounded" placeholder="jean.dupont@email.com" />
                  </div>
                  <div className="group/input">
                    <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase transition-colors duration-300">Téléphone <span className="text-gray-600 font-normal normal-case">(optionnel)</span></label>
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 text-sm rounded" placeholder="+31 6 XX XX XX XX" />
                  </div>
                  <button type="submit" className="relative w-full py-3.5 overflow-hidden font-black text-black text-sm tracking-widest uppercase transition-all duration-300 group/btn rounded">
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-[length:200%_100%] animate-gradient" />
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-[length:200%_100%] animate-gradient" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Étape suivante <span>→</span>
                    </span>
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group/input">
                  <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase transition-colors duration-300 group-focus-within/input:text-yellow-400">Mot de passe <span className="text-yellow-500">*</span></label>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 bg-black/50 border border-yellow-900/30 text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black/70 focus:ring-1 focus:ring-yellow-500/20 transition-all duration-300 text-sm rounded" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-500 transition-all duration-300 p-1">
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 h-1.5 bg-gray-800 overflow-hidden rounded mr-3">
                          <div className="h-full transition-all duration-500 rounded" style={{ width: `${strength.pct}%`, background: strength.color }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">Min. 8 caractères, majuscule, chiffre recommandés</p>
                    </div>
                  )}
                </div>

                <div className="group/input">
                  <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase transition-colors duration-300">Confirmer <span className="text-yellow-500">*</span></label>
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange}
                    className={`w-full px-4 py-3 bg-black/50 border text-white placeholder-gray-700 focus:outline-none transition-all duration-300 text-sm rounded ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-800/60 focus:border-red-700 focus:ring-1 focus:ring-red-500/20'
                        : 'border-yellow-900/30 focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/20'
                    }`} placeholder="••••••••" />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400 animate-fadeIn">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-900/[0.04] border border-yellow-900/20 rounded">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input id="terms" type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="sr-only" />
                    <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)}
                      className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-300 rounded ${
                        acceptedTerms ? 'bg-gradient-to-br from-yellow-400 to-yellow-700 border-yellow-500' : 'bg-black/50 border-yellow-900/40 hover:border-yellow-700'
                      }`}>
                      {acceptedTerms && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  </div>
                  <label className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                    J'accepte les{' '}
                    <span className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors">conditions d'utilisation</span>
                    {' '}et la{' '}
                    <span className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors">politique de confidentialité</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep(1); setError(''); }}
                    className="px-5 py-3.5 border border-yellow-900/30 text-gray-400 font-semibold hover:border-yellow-700 hover:text-yellow-500 transition-all duration-300 text-sm rounded">
                    ← Retour
                  </button>
                  <button type="submit" disabled={loading || !acceptedTerms}
                    className="relative flex-1 py-3.5 overflow-hidden font-black text-black text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50 group/btn rounded">
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-[length:200%_100%] animate-gradient" />
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-[length:200%_100%] animate-gradient" />
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Création...
                        </span>
                      ) : 'CRÉER MON COMPTE'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            <p className="mt-5 text-center text-xs text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-yellow-400 hover:text-yellow-300">Se connecter</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
