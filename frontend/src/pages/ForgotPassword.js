import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';
import AuthShell from '../components/auth/AuthShell';


export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${getApiUrl()}/auth/forgot-password`, { email });
      if (res.data?.success === false) {
        setError(res.data.message || 'Impossible d\'envoyer le code.');
        return;
      }
      if (res.data?.data?.devOtp) localStorage.setItem('neliaxaDevOtp', res.data.data.devOtp);
      else localStorage.removeItem('neliaxaDevOtp');
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Link to="/login" className="inline-flex items-center gap-2 mb-8 text-[#e7ebf2]/50 hover:text-[#fbbf24] text-sm transition-colors group">
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="lux-serif text-4xl sm:text-5xl font-semibold text-[#e7ebf2] leading-none mb-3">Mot de passe</h1>
          <p className="text-[#e7ebf2]/50 text-sm">Recevez un code à 6 chiffres par email</p>
        </div>

        <div className="relative">
          <div className="relative lux-card p-6 sm:p-8">

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-400/20 rounded-xl">
                <span className="text-red-400 mt-0.5 text-sm">⚠</span>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block lux-label mb-2">
                  Email
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black transition-all text-sm"
                  placeholder="votre@email.com"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="lux-btn-gold w-full !py-3.5 !text-sm"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ENVOI...
                    </span>
                  ) : 'ENVOYER LE CODE'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
