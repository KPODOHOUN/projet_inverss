import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
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

// An Ambassador's commission stats, separate from the standard dashboard —
// they otherwise use the platform (invest, trade, withdraw...) exactly like
// any standard account, this is just their dedicated referral view.
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
      <div className="lux-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  const filteredReferrals = (data?.referrals || []).filter(r => withinPeriod(r.joinedAt, periodFilter));

  const th = 'px-5 py-3 text-left text-xs font-medium text-[#6f7c90]';
  return (
    <div className="lux-page min-h-screen">
      <header className="lux-header sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo className="h-8 w-auto shrink-0" />
            <div className="pl-3 border-l border-white/10 leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-[#e7ebf2]">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-[#9aa6b8]">Ambassadeur</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button onClick={() => navigate('/dashboard')} className="lux-btn-ghost !px-3 !py-2">← Mon compte</button>
            <button onClick={handleLogout} className="lux-btn-ghost !px-3 !py-2 hidden sm:inline-flex">Déconnexion</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
        <div className="animate-cardIn">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#e7ebf2]">Espace ambassadeur</h1>
          <p className="text-sm text-[#9aa6b8] mt-1">Suivez vos filleuls et vos commissions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            ['Total filleuls', data?.totalReferred || 0, 'Utilisateurs parrainés', 'bg-blue-500/15 text-blue-300', 'text-[#e7ebf2]'],
            ['Commissions totales', `${data?.totalCommissions?.toFixed(2) || '0.00'} USDT`, 'Depuis le début', 'bg-emerald-500/15 text-emerald-300', 'text-emerald-400'],
            ['Solde disponible', `${data?.availableBalance?.toFixed(2) || '0.00'} USDT`, 'Prêt à retirer', 'bg-amber-500/15 text-amber-300', 'text-[#e7ebf2]'],
          ].map(([label, value, sub, chip, cls], i) => (
            <div key={label} style={{ animationDelay: `${i * 70}ms` }} className="lux-card animate-cardIn p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-[#9aa6b8]">{label}</p>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${chip}`}>●</span>
              </div>
              <p className={`lux-num text-2xl font-bold ${cls}`}>{value}</p>
              <p className="text-xs text-[#6f7c90] mt-1.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="lux-card-gold p-5 sm:p-7">
          <h2 className="text-lg font-bold text-[#e7ebf2] mb-1">Votre lien de parrainage</h2>
          <p className="text-sm text-[#9aa6b8] mb-5">Partagez-le : chaque personne inscrite avec ce lien devient votre filleul.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={referralLink} readOnly className="lux-input flex-1 font-mono !text-xs" />
            <button onClick={copyToClipboard} className="lux-btn-gold !px-7 whitespace-nowrap">
              {copied ? '✓ Copié' : 'Copier le lien'}
            </button>
          </div>
        </div>

        <div className="lux-card p-5 sm:p-6 flex flex-wrap items-center gap-5">
          <span className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-500/15 text-amber-300 lux-num text-xl font-bold shrink-0">10%</span>
          <div className="flex-1 min-w-[220px]">
            <h3 className="font-bold text-[#e7ebf2] mb-1">Comment sont calculées vos commissions</h3>
            <p className="text-sm text-[#9aa6b8] leading-relaxed">
              Quand un investissement d'un de vos filleuls arrive à échéance (ou est clôturé), vous recevez 10 % des gains réellement générés par ce filleul — pas du montant investi. La commission est créditée automatiquement sur votre solde.
            </p>
          </div>
        </div>

        <div className="lux-card overflow-hidden">
          <div className="flex items-center justify-between flex-wrap gap-3 p-5 sm:p-6 pb-4">
            <h3 className="text-lg font-bold text-[#e7ebf2]">Vos filleuls</h3>
            {data?.referrals?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {PERIOD_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setPeriodFilter(value)} className={`lux-chip ${periodFilter === value ? 'is-active' : ''}`}>{label}</button>
                ))}
              </div>
            )}
          </div>
          {filteredReferrals.length === 0 ? (
            <p className="text-center text-sm text-[#9aa6b8] px-6 pb-10 pt-4">
              {data?.referrals?.length > 0 ? 'Aucun filleul sur cette période' : "Vous n'avez pas encore de filleuls — partagez votre lien pour commencer."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full lux-table">
                <thead><tr><th className={th}>Utilisateur</th><th className={th}>Date</th><th className={th}>Commissions générées</th></tr></thead>
                <tbody>
                  {filteredReferrals.map((referral, index) => (
                    <tr key={index}>
                      <td className="text-sm text-[#e7ebf2]">{referral.name}</td>
                      <td className="text-sm text-[#9aa6b8]">{new Date(referral.joinedAt).toLocaleDateString('fr-FR')}</td>
                      <td className="lux-num text-sm font-semibold text-emerald-400">{referral.commissionsEarned?.toFixed(2) || '0.00'} USDT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {data?.commissionHistory?.length > 0 && (
          <div className="lux-card overflow-hidden">
            <h3 className="text-lg font-bold text-[#e7ebf2] p-5 sm:p-6 pb-4">Historique des commissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full lux-table">
                <thead><tr><th className={th}>Date</th><th className={th}>Gains du filleul</th><th className={th}>Taux</th><th className={th}>Commission</th></tr></thead>
                <tbody>
                  {data.commissionHistory.map((c) => (
                    <tr key={c._id}>
                      <td className="text-sm text-[#9aa6b8]">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="lux-num text-sm text-[#e7ebf2]">{c.sourceEarnings.toFixed(2)} USDT</td>
                      <td className="text-sm text-[#9aa6b8]">{c.rate}%</td>
                      <td className="lux-num text-sm font-semibold text-emerald-400">+{c.commissionAmount.toFixed(2)} USDT</td>
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
