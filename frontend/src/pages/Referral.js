import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

export default function Referral({ onNavigate }) {
  const { user, api } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await api.get('/referral/stats');
      if (response.data.success) {
        setReferralData(response.data.data);
        setReferralLink(`${window.location.origin}/register?ref=${response.data.data.referralCode}`);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform) => {
    const text = `Rejoignez IMC, la plateforme d'investissement intelligente ! 🚀 Rendements de 4-10% ROI`;
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n' + referralLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-[#e7ebf2]/60 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  const rate = referralData?.commissionRate ?? 10;
  const shareBtns = [
    ['whatsapp', 'WhatsApp', '#25D366'],
    ['telegram', 'Telegram', '#2AABEE'],
    ['twitter', 'X / Twitter', '#e7e9ea'],
    ['facebook', 'Facebook', '#1877F2'],
  ];

  return (
    <div className="space-y-8">
      <div className="animate-cardIn">
        <p className="lux-label mb-2">Programme de parrainage</p>
        <h1 className="lux-serif text-4xl sm:text-5xl font-semibold text-[#e7ebf2] leading-none">
          Invitez, <span className="lux-gold-text italic">gagnez</span>
        </h1>
        <p className="mt-2 text-sm text-[#e7ebf2]/50">Gagnez {rate}% sur chaque investissement de vos filleuls.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {[
          ['Total filleuls', referralData?.totalReferrals || 0, 'Utilisateurs parrainés', 'text-[#e7ebf2]'],
          ['Filleuls actifs', referralData?.activeReferrals || 0, 'Avec un investissement actif', 'text-[#e7ebf2]'],
          ['Commissions', `$${referralData?.totalCommissionsUSD?.toFixed(2) || '0.00'}`, 'Revenus passifs cumulés', 'lux-gold-text'],
        ].map(([label, value, hint, cls], i) => (
          <div key={label} style={{ animationDelay: `${i * 70}ms` }} className={`lux-card lux-card-hover animate-cardIn p-6 ${i === 2 ? '!border-yellow-500/30' : ''}`}>
            <p className="lux-label mb-3">{label}</p>
            <p className={`lux-num text-3xl font-light ${cls}`}>{value}</p>
            <p className="text-xs text-[#e7ebf2]/40 mt-2">{hint}</p>
          </div>
        ))}
      </div>

      <div className="lux-card-gold p-6 sm:p-8">
        <div className="relative">
          <p className="lux-label !text-[#fbbf24]/70 mb-1">À partager</p>
          <h2 className="lux-serif text-3xl font-semibold text-[#e7ebf2] mb-6">Votre lien de parrainage</h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input type="text" value={referralLink} readOnly className="lux-input flex-1 min-w-0 font-mono !text-xs" />
            <button onClick={copyToClipboard} className="lux-btn-gold !px-7 whitespace-nowrap">
              {copied ? '✓ Copié' : 'Copier le lien'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {shareBtns.map(([key, label, color]) => (
              <button key={key} onClick={() => shareOnSocial(key)} className="lux-btn-ghost !py-3 !justify-start gap-2.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lux-card p-6 sm:p-7 flex flex-wrap items-center gap-6">
        <div className="shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center bg-yellow-500/5 border border-yellow-500/25">
          <span className="lux-num text-3xl font-light lux-gold-text">{rate}%</span>
        </div>
        <div className="flex-1 min-w-[220px]">
          <h3 className="lux-serif text-2xl font-semibold text-[#e7ebf2] mb-1">Comment sont calculées vos commissions</h3>
          <p className="text-sm text-[#e7ebf2]/55 leading-relaxed">
            Dès qu'un investissement de votre filleul direct est validé, vous recevez {rate}% du montant investi, crédité directement sur votre solde.
          </p>
        </div>
      </div>

      <div className="lux-card p-6 sm:p-7">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="lux-label mb-1">Votre réseau</p>
            <h3 className="lux-serif text-2xl font-semibold text-[#e7ebf2]">Vos filleuls</h3>
          </div>
          {referralData?.referrals?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {PERIOD_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => setPeriodFilter(value)} className={`lux-chip ${periodFilter === value ? 'is-active' : ''}`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {(() => {
          const filteredReferrals = (referralData?.referrals || []).filter(r => withinPeriod(r.joinedAt, periodFilter));
          if (filteredReferrals.length === 0) {
            return (
              <div className="text-center py-12 rounded-xl border border-dashed border-white/10">
                {referralData?.referrals?.length > 0 ? (
                  <p className="text-sm text-[#e7ebf2]/50">Aucun filleul sur cette période</p>
                ) : (
                  <>
                    <p className="text-sm text-[#e7ebf2]/60 mb-1">Vous n'avez pas encore de filleuls</p>
                    <p className="text-xs text-[#e7ebf2]/35">Partagez votre lien pour commencer à gagner.</p>
                  </>
                )}
              </div>
            );
          }
          return (
          <div className="overflow-x-auto -mx-6 sm:-mx-7">
            <table className="w-full lux-table">
              <thead>
                <tr><th>Utilisateur</th><th>Date</th><th>Statut</th><th>Commissions</th></tr>
              </thead>
              <tbody>
                {filteredReferrals.map((referral, index) => (
                  <tr key={index}>
                    <td className="text-sm text-[#e7ebf2]">{referral.name}</td>
                    <td className="text-sm text-[#e7ebf2]/55">{new Date(referral.joinedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={`lux-pill ${referral.isActive ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20' : 'bg-white/5 text-[#e7ebf2]/50 ring-1 ring-inset ring-white/10'}`}>
                        {referral.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="lux-num text-sm font-medium text-[#fbbf24]">${referral.commissionsEarned?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          );
        })()}
      </div>

      <button type="button" onClick={() => onNavigate?.('faq')} className="w-full text-left p-5 lux-card lux-card-hover flex items-center justify-between gap-4 group">
        <span>
          <span className="block font-medium text-[#e7ebf2] text-sm">Comment fonctionne le parrainage ?</span>
          <span className="block text-xs text-[#e7ebf2]/45 mt-1">Réponses détaillées dans le Centre d'aide</span>
        </span>
        <span className="text-[#e7ebf2]/30 group-hover:text-[#f59e0b] transition-colors">→</span>
      </button>
    </div>
  );
}
