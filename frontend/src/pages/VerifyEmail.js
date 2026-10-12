import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, verifyEmail, resendOTP, logout } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [devOtp, setDevOtp] = useState(() => localStorage.getItem('neliaxaDevOtp') || '');
  const inputRefs = useRef([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user) navigate('/login');
    if (user?.emailVerified) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Entrez le code à 6 chiffres');
    setLoading(true);
    setError('');
    try {
      const result = await verifyEmail(code);
      if (result.success) {
        setDevOtp('');
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(result.error || 'Code invalide');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Erreur de vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP();
      setDevOtp(localStorage.getItem('neliaxaDevOtp') || '');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Impossible de renvoyer le code');
    } finally {
      setResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.10) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/2 left-0 w-full h-px opacity-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Link to="/login" className="inline-flex items-center gap-2 mb-8 text-yellow-600 hover:text-yellow-400 font-semibold text-sm tracking-widest uppercase transition-colors group">
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-white leading-none mb-2">
            {success ? 'Email vérifié !' : 'Vérifiez votre email'}
          </h1>
          <p className="text-gray-500 text-sm">
            {success
              ? 'Redirection vers votre tableau de bord...'
              : `Un code à 6 chiffres a été envoyé à ${user?.email || 'votre email'}`
            }
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

            {!success && devOtp && (
              <div className="mb-6 p-4 bg-blue-950/40 border border-blue-800/40 rounded">
                <p className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">Mode local — email non délivré</p>
                <p className="text-sm text-blue-200">
                  Votre code : <span className="font-mono text-lg tracking-[0.3em] text-white">{devOtp}</span>
                </p>
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-6 animate-bounce">✓</div>
                <p className="text-gray-400 text-sm">Votre email a été vérifié avec succès !</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-3 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-black bg-black/50 border border-yellow-900/30 rounded text-white focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit" disabled={loading || otp.join('').length !== 6}
                  className="relative w-full py-3.5 overflow-hidden font-black text-black text-sm tracking-widest uppercase transition-all disabled:opacity-50 group mb-4"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B, #D4AF37)' }}
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        VÉRIFICATION...
                      </span>
                    ) : 'VÉRIFIER'}
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #F0CC5A, #D4AF37, #F0CC5A)' }} />
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-500">
                      Renvoyer dans <span className="text-yellow-500 font-bold">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-xs text-yellow-500 hover:text-yellow-400 font-bold transition-colors disabled:opacity-50"
                    >
                      {resending ? 'ENVOI...' : 'Renvoyer le code'}
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-yellow-900/10">
              <button onClick={logout} className="w-full text-center text-xs text-gray-600 hover:text-red-400 transition-colors">
                Utiliser un autre compte
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
