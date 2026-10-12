import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';


export default function ResetPassword() {
  const { token: linkToken } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const otpMode = !linkToken && !!email;

  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [devOtp, setDevOtp] = useState(() => localStorage.getItem('neliaxaDevOtp') || '');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!linkToken && !email) navigate('/forgot-password', { replace: true });
  }, [linkToken, email, navigate]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      const res = await axios.post(`${getApiUrl()}/auth/forgot-password`, { email });
      if (res.data?.data?.devOtp) {
        localStorage.setItem('neliaxaDevOtp', res.data.data.devOtp);
        setDevOtp(res.data.data.devOtp);
      } else {
        localStorage.removeItem('neliaxaDevOtp');
        setDevOtp('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de renvoyer le code.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('8 caractères minimum');
    if (password !== confirmPassword) return setError('Les mots de passe ne correspondent pas');
    if (otpMode && otp.length !== 6) return setError('Entrez le code à 6 chiffres');

    setLoading(true);
    try {
      const payload = otpMode
        ? { email, otp, password }
        : { token: linkToken, password };
      await axios.post(`${getApiUrl()}/auth/reset-password`, payload);
      localStorage.removeItem('neliaxaDevOtp');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Code ou lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (!password) return null;
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
    const score = checks.filter(Boolean).length;
    const levels = [null, { label: 'Très faible', pct: 20, color: '#ef4444' }, { label: 'Faible', pct: 40, color: '#f97316' }, { label: 'Moyen', pct: 60, color: '#eab308' }, { label: 'Bon', pct: 80, color: '#22c55e' }, { label: 'Excellent', pct: 100, color: '#D4AF37' }];
    return levels[score] || levels[1];
  };

  const strength = getStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="mb-8">
          <div className="mb-5">
            <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          </div>
          <h1 className="text-2xl font-black text-white leading-none mb-2">
            {success ? 'Mot de passe modifié' : 'Nouveau mot de passe'}
          </h1>
          <p className="text-gray-500 text-sm">
            {success
              ? 'Redirection vers la connexion...'
              : otpMode
                ? `Entrez le code reçu à ${email}`
                : 'Choisissez un mot de passe sécurisé'}
          </p>
        </div>

        <div className="relative">
          <div className="relative bg-[#0d0d0d] border border-yellow-900/20 rounded-lg p-6">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }} />

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/50 rounded">
                <span className="text-red-400 mt-0.5 text-sm">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {!success && otpMode && devOtp && (
              <div className="mb-6 p-4 bg-blue-950/40 border border-blue-800/40 rounded">
                <p className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">Mode local — email non délivré</p>
                <p className="text-sm text-blue-200">
                  Votre code : <span className="font-mono text-lg tracking-[0.3em] text-white">{devOtp}</span>
                </p>
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-6">✅</div>
                <p className="text-gray-400 text-sm">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {otpMode && (
                  <div>
                    <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                      Code reçu par email
                    </label>
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 rounded text-white focus:border-yellow-500/60 focus:outline-none text-center text-xl font-mono tracking-[0.5em]"
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="mt-2 text-xs text-yellow-600 hover:text-yellow-400 disabled:opacity-50"
                    >
                      {resending ? 'Envoi...' : 'Renvoyer le code'}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      className="w-full px-4 py-3 pr-12 bg-black/50 border border-yellow-900/30 rounded text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-500 transition-colors p-1">
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-800 overflow-hidden">
                          <div className="h-full transition-all duration-500" style={{ width: `${strength.pct}%`, background: strength.color }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                    Confirmer
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    className={`w-full px-4 py-3 bg-black/50 border rounded text-white placeholder-gray-700 focus:outline-none text-sm transition-colors ${confirmPassword && password !== confirmPassword ? 'border-red-800/60 focus:border-red-700' : 'border-yellow-900/30 focus:border-yellow-500/60'}`}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="relative w-full py-3.5 overflow-hidden font-black text-black text-sm tracking-widest uppercase transition-all disabled:opacity-50 group"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B, #D4AF37)' }}
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        CHARGEMENT...
                      </span>
                    ) : 'RÉINITIALISER'}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #F0CC5A, #D4AF37, #F0CC5A)' }} />
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-bold text-sm transition-colors">
                ← Retour à la connexion
              </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
