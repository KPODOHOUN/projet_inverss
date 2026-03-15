import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Referral() {
  const { user, api } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await api.get('/referral/stats');
      if (response.data.success) {
        setReferralData(response.data.data);
        setReferralLink(`https://neliaxa.com/invite/${response.data.data.referralCode}`);
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
    const text = `Rejoignez NELIAXA, la plateforme d'investissement intelligente ! 🚀 Rendements de 4-10% ROI`;
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
        <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          PROGRAMME DE PARRAINAGE
        </h1>
        <p className="text-xl text-gray-400">
          Invitez vos amis et gagnez des commissions à vie
        </p>
      </div>

      {}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 text-black shadow-2xl shadow-yellow-500/30">
          <p className="text-sm font-semibold mb-2">TOTAL FILLEULS</p>
          <h3 className="text-4xl font-black mb-2">{referralData?.totalReferrals || 0}</h3>
          <p className="text-sm opacity-80">Utilisateurs parrainés</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-yellow-500">FILLEULS ACTIFS</p>
          <h3 className="text-4xl font-black mb-2">{referralData?.activeReferrals || 0}</h3>
          <p className="text-sm text-gray-400">Avec investissements actifs</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-green-500">COMMISSIONS NLX</p>
          <h3 className="text-4xl font-black mb-2">{referralData?.totalCommissionsNLX?.toFixed(2) || 0}</h3>
          <p className="text-sm text-gray-400">Tokens gagnés</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-blue-500">COMMISSIONS EUR</p>
          <h3 className="text-4xl font-black mb-2">€{referralData?.totalCommissionsEUR?.toFixed(2) || 0}</h3>
          <p className="text-sm text-gray-400">Revenus passifs</p>
        </div>
      </div>

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 p-8 mb-12">
        <h2 className="text-2xl font-black text-yellow-500 mb-6">VOTRE LIEN DE PARRAINAGE</h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-black border-2 border-yellow-900/30 text-white font-mono"
          />
          <button
            onClick={copyToClipboard}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all"
          >
            {copied ? '✓ COPIÉ' : 'COPIER'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => shareOnSocial('whatsapp')}
            className="px-4 py-3 bg-green-600 text-white font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            <span>📱</span> WhatsApp
          </button>
          <button
            onClick={() => shareOnSocial('telegram')}
            className="px-4 py-3 bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <span>✈️</span> Telegram
          </button>
          <button
            onClick={() => shareOnSocial('twitter')}
            className="px-4 py-3 bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all flex items-center justify-center gap-2"
          >
            <span>🐦</span> Twitter
          </button>
          <button
            onClick={() => shareOnSocial('facebook')}
            className="px-4 py-3 bg-blue-700 text-white font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
          >
            <span>👍</span> Facebook
          </button>
        </div>
      </div>

      {}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-8">
          <h3 className="text-2xl font-black text-yellow-500 mb-6">COMMISSIONS PAR ACTION</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-black/50">
              <span className="text-white">Inscription via votre lien</span>
              <span className="text-yellow-500 font-black">100 NLX</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black/50">
              <span className="text-white">Achat Pack Starter</span>
              <span className="text-yellow-500 font-black">5% en NLX</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black/50">
              <span className="text-white">Achat Pack Booster+</span>
              <span className="text-yellow-500 font-black">7% en NLX</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black/50">
              <span className="text-white">Visionnage pubs (filleul)</span>
              <span className="text-yellow-500 font-black">10% des NLX</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-8">
          <h3 className="text-2xl font-black text-yellow-500 mb-6">BONUS RÉSEAU MULTI-NIVEAUX</h3>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">Niveau 1 (Directs)</span>
                <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-black">5-15%</span>
              </div>
              <p className="text-sm text-gray-400">Sur tous les achats de vos filleuls directs</p>
            </div>

            <div className="p-4 bg-yellow-900/10 border border-yellow-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">Niveau 2 (Indirects)</span>
                <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-black">3%</span>
              </div>
              <p className="text-sm text-gray-400">Sur les achats des filleuls de vos filleuls</p>
            </div>

            <div className="p-4 bg-yellow-900/5 border border-yellow-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">Niveau 3</span>
                <span className="px-3 py-1 bg-yellow-700 text-white text-sm font-black">1%</span>
              </div>
              <p className="text-sm text-gray-400">Niveau 3 de votre réseau</p>
            </div>

            <div className="p-4 bg-green-900/20 border border-green-500 mt-4">
              <p className="text-green-400 font-bold text-center">
                🎁 Bonus si réseau > 10 investisseurs actifs
              </p>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-8 mb-12">
        <h3 className="text-2xl font-black text-yellow-500 mb-6">VOS FILLEULS</h3>
        
        {referralData?.referrals && referralData.referrals.length > 0 ? (
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
                {referralData.referrals.map((referral, index) => (
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
                      {referral.commissionsEarned} NLX
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-400 mb-6">Vous n'avez pas encore de filleuls</p>
            <p className="text-white">Partagez votre lien pour commencer à gagner !</p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-8 text-black">
        <h3 className="text-2xl font-black mb-6">COMMENT ÇA MARCHE ?</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">1️⃣</div>
            <h4 className="font-bold mb-2">Partagez votre lien</h4>
            <p className="text-sm opacity-80">
              Envoyez votre lien unique à vos amis
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">2️⃣</div>
            <h4 className="font-bold mb-2">Ils s'inscrivent</h4>
            <p className="text-sm opacity-80">
              Vos amis créent leur compte NELIAXA
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">3️⃣</div>
            <h4 className="font-bold mb-2">Ils investissent</h4>
            <p className="text-sm opacity-80">
              Vos filleuls achètent des packs
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">4️⃣</div>
            <h4 className="font-bold mb-2">Vous gagnez</h4>
            <p className="text-sm opacity-80">
              Commissions automatiques en NLX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
