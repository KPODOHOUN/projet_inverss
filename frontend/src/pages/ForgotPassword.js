import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiUrl';


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
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.10) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 left-1/4 w-px h-full opacity-10" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.6), transparent)' }} />
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Link to="/login" className="inline-flex items-center gap-2 mb-8 text-yellow-600 hover:text-yellow-400 font-semibold text-sm tracking-widest uppercase transition-colors group">
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Retour
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-white leading-none mb-2">Mot de passe</h1>
          <p className="text-gray-500 text-sm">Recevez un code à 6 chiffres par email</p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-yellow-600 mb-2 tracking-widest uppercase">
                  Email
                </label>
                <input
                  type="email" required value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 rounded text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:bg-black transition-all text-sm"
                  placeholder="votre@email.com"
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
                      ENVOI...
                    </span>
                  ) : 'ENVOYER LE CODE'}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #F0CC5A, #D4AF37, #F0CC5A)' }} />
              </button>
            </form>

            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
