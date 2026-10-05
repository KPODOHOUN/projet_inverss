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

export default function Referral() {
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
          <p className="mt-4 text-gray-400 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          PROGRAMME DE PARRAINAGE
        </h1>
        <p className="text-xl text-gray-400">
          Invitez vos amis et gagnez des commissions à vie
        </p>
      </div>

      {}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 text-black shadow-2xl shadow-yellow-500/30">
          <p className="text-sm font-semibold mb-2">TOTAL FILLEULS</p>
          <h3 className="text-2xl font-black mb-2">{referralData?.totalReferrals || 0}</h3>
          <p className="text-sm opacity-80">Utilisateurs parrainés</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-yellow-500">FILLEULS ACTIFS</p>
          <h3 className="text-2xl font-black mb-2">{referralData?.activeReferrals || 0}</h3>
          <p className="text-sm text-gray-400">Avec investissements actifs</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-900/30 rounded-lg p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-blue-500">COMMISSIONS</p>
          <h3 className="text-2xl font-black mb-2">${referralData?.totalCommissionsUSD?.toFixed(2) || 0}</h3>
          <p className="text-sm text-gray-400">Revenus passifs</p>
        </div>
      </div>

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-black text-yellow-500 mb-6">VOTRE LIEN DE PARRAINAGE</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 min-w-0 px-4 py-3 bg-black border-2 border-yellow-900/30 rounded text-white font-mono text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all whitespace-nowrap"
          >
            {copied ? '✓ COPIÉ' : 'COPIER'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => shareOnSocial('whatsapp')}
            className="px-4 py-3 bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
          >
            WhatsApp
          </button>
          <button
            onClick={() => shareOnSocial('telegram')}
            className="px-4 py-3 bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all"
          >
            Telegram
          </button>
          <button
            onClick={() => shareOnSocial('twitter')}
            className="px-4 py-3 bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all"
          >
            Twitter
          </button>
          <button
            onClick={() => shareOnSocial('facebook')}
            className="px-4 py-3 bg-blue-700 text-white font-bold hover:bg-blue-800 transition-all"
          >
            Facebook
          </button>
        </div>
      </div>

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6 mb-12">
        <h3 className="text-2xl font-black text-yellow-500 mb-6">COMMENT SONT CALCULÉES VOS COMMISSIONS</h3>
        <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold">Filleul direct</span>
            <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-black">{referralData?.commissionRate ?? 10}%</span>
          </div>
          <p className="text-sm text-gray-400">
            Dès qu'un investissement de votre filleul direct est validé, vous recevez {referralData?.commissionRate ?? 10}% du
            montant investi, crédité directement sur votre solde.
          </p>
        </div>
      </div>

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 rounded-lg p-6 mb-12">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h3 className="text-2xl font-black text-yellow-500">VOS FILLEULS</h3>
          {referralData?.referrals?.length > 0 && (
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

        {(() => {
          const filteredReferrals = (referralData?.referrals || []).filter(r => withinPeriod(r.joinedAt, periodFilter));
          if (filteredReferrals.length === 0) {
            return (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                {referralData?.referrals?.length > 0 ? (
                  <p className="text-gray-400">Aucun filleul sur cette période</p>
                ) : (
                  <>
                    <p className="text-gray-400 mb-6">Vous n'avez pas encore de filleuls</p>
                    <p className="text-white">Partagez votre lien pour commencer à gagner !</p>
                  </>
                )}
              </div>
            );
          }
          return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Commissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-900/20">
                {filteredReferrals.map((referral, index) => (
                  <tr key={index} className="hover:bg-yellow-900/10">
                    <td className="px-6 py-4 text-white">{referral.name}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(referral.joinedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold ${
                        referral.isActive 
                          ? 'bg-green-900/50 text-green-400' 
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {referral.isActive ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-yellow-500">
                      ${referral.commissionsEarned?.toFixed(2) || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          );
        })()}
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 text-black">
        <h3 className="text-2xl font-black mb-6">COMMENT ÇA MARCHE ?</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-3">1️⃣</div>
            <h4 className="font-bold mb-2">Partagez votre lien</h4>
            <p className="text-sm opacity-80">
              Envoyez votre lien unique à vos amis
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-3">2️⃣</div>
            <h4 className="font-bold mb-2">Ils s'inscrivent</h4>
            <p className="text-sm opacity-80">
              Vos amis créent leur compte IMC
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-3">3️⃣</div>
            <h4 className="font-bold mb-2">Ils investissent</h4>
            <p className="text-sm opacity-80">
              Vos filleuls achètent des packs
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-3">4️⃣</div>
            <h4 className="font-bold mb-2">Vous gagnez</h4>
            <p className="text-sm opacity-80">
              Commissions automatiques sur votre solde
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
