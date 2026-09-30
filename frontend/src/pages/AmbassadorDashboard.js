import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Tout' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];
const PERIOD_MS = { today: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000, month: 30 * 24 * 60 * 60 * 1000 };
const withinPeriod = (dateStr, period) => {
  if (period === 'all') return true;
  return Date.now() - new Date(dateStr).getTime() <= PERIOD_MS[period];
};

// Standalone page — the Ambassador role's ONLY view of the platform, per the
// program's rules ("son rôle principal est uniquement de parrainer"). No
// sidebar/tabs like Dashboard.js — a single focused screen.
export default function AmbassadorDashboard() {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    api.get('/ambassador/stats').then((res) => {
      if (res.data.success) {
        setData(res.data.data);
        setReferralLink(`${window.location.origin}/register?ref=${res.data.data.referralCode}`);
      }
    }).catch((err) => console.error('Ambassador stats fetch error:', err))
      .finally(() => setLoading(false));
  }, [api]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  const filteredReferrals = (data?.referrals || []).filter(r => withinPeriod(r.joinedAt, periodFilter));

  return (
    <div className="min-h-screen bg-black">
      <header className="imc-glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-8 w-auto object-contain" />
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-white leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Ambassadeur</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-yellow-600/50 rounded text-yellow-400 hover:bg-yellow-600 hover:text-white text-xs sm:text-sm bg-transparent cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            ESPACE AMBASSADEUR
          </h1>
          <p className="text-xl text-gray-400">Suivez vos filleuls et vos commissions</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 text-black shadow-2xl shadow-yellow-500/30">
            <p className="text-sm font-semibold mb-2">TOTAL FILLEULS</p>
            <h3 className="text-2xl font-black mb-2">{data?.totalReferred || 0}</h3>
            <p className="text-sm opacity-80">Utilisateurs parrainés</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6 text-white">
            <p className="text-sm font-semibold mb-2 text-yellow-500">COMMISSIONS TOTALES</p>
            <h3 className="text-2xl font-black mb-2">${data?.totalCommissions?.toFixed(2) || '0.00'}</h3>
            <p className="text-sm text-gray-400">Depuis le début</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-900/30 rounded-lg p-6 text-white">
            <p className="text-sm font-semibold mb-2 text-blue-500">SOLDE DISPONIBLE</p>
            <h3 className="text-2xl font-black mb-2">${data?.availableBalance?.toFixed(2) || '0.00'}</h3>
            <p className="text-sm text-gray-400">Prêt à retirer</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-black text-yellow-500 mb-6">VOTRE LIEN DE PARRAINAGE</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text" value={referralLink} readOnly
              className="flex-1 px-4 py-3 bg-black border-2 border-yellow-900/30 rounded text-white font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all rounded"
            >
              {copied ? '✓ COPIÉ' : 'COPIER'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6 mb-12">
          <h3 className="text-2xl font-black text-yellow-500 mb-6">COMMENT SONT CALCULÉES VOS COMMISSIONS</h3>
          <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded">
            <p className="text-sm text-gray-400">
              Quand un investissement d'un de vos filleuls arrive à échéance (ou est clôturé), vous recevez <strong className="text-yellow-500">10%</strong> des
              gains réellement générés par ce filleul — pas du montant qu'il a investi. La commission est créditée automatiquement sur votre solde.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <h3 className="text-2xl font-black text-yellow-500">VOS FILLEULS</h3>
            {data?.referrals?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {PERIOD_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setPeriodFilter(value)}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${periodFilter === value ? 'bg-yellow-500 text-black' : 'bg-black/40 text-gray-400 border border-yellow-900/20 hover:border-yellow-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              {data?.referrals?.length > 0 ? (
                <p className="text-gray-400">Aucun filleul sur cette période</p>
              ) : (
                <p className="text-gray-400">Vous n'avez pas encore de filleuls — partagez votre lien pour commencer.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Commissions générées</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-900/20">
                  {filteredReferrals.map((referral, index) => (
                    <tr key={index} className="hover:bg-yellow-900/10">
                      <td className="px-6 py-4 text-white">{referral.name}</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(referral.joinedAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 font-bold text-yellow-500">${referral.commissionsEarned?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data?.commissionHistory?.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6">
            <h3 className="text-2xl font-black text-yellow-500 mb-6">HISTORIQUE DES COMMISSIONS</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Gains du filleul</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Taux</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-900/20">
                  {data.commissionHistory.map((c) => (
                    <tr key={c._id} className="hover:bg-yellow-900/10">
                      <td className="px-6 py-4 text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-white">${c.sourceEarnings.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-400">{c.rate}%</td>
                      <td className="px-6 py-4 font-bold text-yellow-500">${c.commissionAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
