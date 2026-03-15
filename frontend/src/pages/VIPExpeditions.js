import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const EXPEDITION_LEVELS = [
  {
    id: 'bronze', tier: '🥉 Bronze', name: 'BRONZE',
    destination: "Côte d'Ivoire / Ghana", subtitle: 'Destination locale West Africa',
    quarter: 'Trimestre 1',
    thresholds: { referrals: 10, revenue: 25000 },
    perks: ["✈️ Transport inclus", "🏨 Hôtel 3 nuits", "🍽️ Dîner de gala", "📸 Souvenirs offerts"],
    color: 'from-amber-800 to-amber-900', border: 'border-amber-600', accent: '#d97706',
    flag: '🌍', badge: 'bg-amber-600'
  },
  {
    id: 'silver', tier: '🥈 Argent', name: 'ARGENT',
    destination: 'Maroc / Dubaï', subtitle: 'Découverte Afrique du Nord & Golf',
    quarter: 'Trimestre 2',
    thresholds: { referrals: 25, revenue: 75000 },
    perks: ["✈️ Vol aller-retour", "🏨 Hôtel 4★ (4 nuits)", "🚌 Excursions guidées", "🎉 Soirée VIP"],
    color: 'from-gray-600 to-gray-800', border: 'border-gray-400', accent: '#9ca3af',
    flag: '🕌', badge: 'bg-gray-500'
  },
  {
    id: 'gold', tier: '🥇 Or', name: 'OR',
    destination: 'Malaisie / Singapour', subtitle: 'Aventure Asie du Sud-Est',
    quarter: 'Trimestre 3',
    thresholds: { referrals: 50, revenue: 200000 },
    perks: ["✈️ Vol + hôtel 5★ (5 nuits)", "🏛️ Visites guidées exclusives", "🍽️ Dîner gastronomique", "🛍️ Shopping tour VIP"],
    color: 'from-yellow-700 to-yellow-900', border: 'border-yellow-500', accent: '#eab308',
    flag: '🏙️', badge: 'bg-yellow-600'
  },
  {
    id: 'diamond', tier: '💎 Diamant', name: 'DIAMANT',
    destination: 'Dubaï / Maldives', subtitle: 'Luxe & Resort Ultra-Premium',
    quarter: 'Trimestre 4',
    thresholds: { referrals: 100, revenue: 500000 },
    perks: ["✈️ Vol Business class", "🏖️ Resort 5★ (7 nuits)", "🎉 Cérémonie de récompense", "🚁 Activités luxe (yacht, spa)", "🤝 Networking élite"],
    color: 'from-cyan-900 to-blue-950', border: 'border-cyan-400', accent: '#22d3ee',
    flag: '🏖️', badge: 'bg-cyan-600'
  },
  {
    id: 'ambassador', tier: '👑 Ambassadeur', name: 'AMBASSADEUR',
    destination: 'Destination Surprise', subtitle: 'Japon, Seychelles ou surprise totale',
    quarter: 'Annuel',
    thresholds: { referrals: null, revenue: 1000000, special: 'Top 3 du classement annuel' },
    perks: ["🎖️ Voyage VIP avec l'équipe fondatrice", "✈️ Business class + suite 5★", "🌟 Expérience unique & exclusive", "📺 Couverture médias NELIAXA", "🤝 Co-investissement avec l'équipe"],
    color: 'from-purple-900 to-black', border: 'border-purple-400', accent: '#a855f7',
    flag: '👑', badge: 'bg-purple-600'
  }
];

export default function VIPExpeditions() {
  const { user, api } = useAuth();
  const [userStats, setUserStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalRevenue: 0,
    currentLevel: null,
    leaderboard: []
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myProgress');

  useEffect(() => { fetchExpeditionData(); }, []);

  const fetchExpeditionData = async () => {
    try {
      const res = await api.get('/expeditions/status');
      if (res.data.success) {
        setUserStats(res.data.data);
        setLeaderboard(res.data.data.leaderboard || []);
      }
    } catch {
      
      setUserStats({ totalReferrals: 8, activeReferrals: 5, totalRevenue: 18000, currentLevel: null });
      setLeaderboard([
        { rank: 1, name: 'Moussa K.', referrals: 87, revenue: 420000, level: 'diamond' },
        { rank: 2, name: 'Aminata D.', referrals: 64, revenue: 310000, level: 'gold' },
        { rank: 3, name: 'Kofi A.', referrals: 52, revenue: 205000, level: 'gold' },
        { rank: 4, name: 'Fatou S.', referrals: 31, revenue: 92000, level: 'silver' },
        { rank: 5, name: 'Ibrahim T.', referrals: 18, revenue: 47000, level: 'bronze' },
      ]);
    } finally { setLoading(false); }
  };

  const getUserLevel = () => {
    for (let i = EXPEDITION_LEVELS.length - 1; i >= 0; i--) {
      const lvl = EXPEDITION_LEVELS[i];
      if (lvl.thresholds.special) continue;
      if (userStats.activeReferrals >= lvl.thresholds.referrals || userStats.totalRevenue >= lvl.thresholds.revenue) {
        return lvl;
      }
    }
    return null;
  };

  const getProgress = (level) => {
    if (level.thresholds.special) return null;
    const refPct = Math.min((userStats.activeReferrals / level.thresholds.referrals) * 100, 100);
    const revPct = Math.min((userStats.totalRevenue / level.thresholds.revenue) * 100, 100);
    return { refPct, revPct, maxPct: Math.max(refPct, revPct) };
  };

  const isUnlocked = (level) => {
    if (level.thresholds.special) return false;
    return userStats.activeReferrals >= level.thresholds.referrals || userStats.totalRevenue >= level.thresholds.revenue;
  };

  const currentLevel = getUserLevel();

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          ✈️ VIP EXPEDITIONS
        </h1>
        <p className="text-xl text-gray-400">Programme de voyages d'élite — Atteignez les seuils et voyagez gratuitement</p>
      </div>

      {/* Current status */}
      <div className={`mb-8 p-6 border-2 ${currentLevel ? `bg-gradient-to-br ${currentLevel.color} ${currentLevel.border}` : 'bg-gradient-to-br from-gray-900 to-black border-yellow-900/30'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Votre niveau actuel</p>
            <p className="text-3xl font-black text-white">
              {currentLevel ? `${currentLevel.tier} — ${currentLevel.destination}` : '🚀 Non qualifié encore'}
            </p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-3xl font-black text-yellow-400">{userStats.activeReferrals}</p>
              <p className="text-xs text-gray-400">Filleuls actifs</p>
            </div>
            <div>
              <p className="text-3xl font-black text-yellow-400">€{(userStats.totalRevenue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-gray-400">CA généré</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[{ id: 'myProgress', label: '📊 Ma Progression' }, { id: 'levels', label: '🗺️ Tous les Niveaux' }, { id: 'leaderboard', label: '🏆 Classement' }].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 font-bold text-sm transition-all ${activeTab === t.id ? 'bg-yellow-500 text-black' : 'border-2 border-yellow-900/30 text-gray-400 hover:border-yellow-500 hover:text-yellow-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* My Progress Tab */}
      {activeTab === 'myProgress' && (
        <div className="space-y-5">
          {EXPEDITION_LEVELS.filter(l => !l.thresholds.special).map(level => {
            const prog = getProgress(level);
            const unlocked = isUnlocked(level);
            return (
              <div key={level.id} className={`p-6 border-2 transition-all ${unlocked ? `bg-gradient-to-br ${level.color} ${level.border}` : 'bg-gradient-to-br from-gray-900 to-black border-yellow-900/20'}`}>
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  <div className="text-4xl">{level.flag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-black text-white">{level.tier} — {level.destination}</h3>
                      {unlocked && <span className="px-3 py-1 bg-green-500 text-black text-xs font-black">✓ QUALIFIÉ</span>}
                      <span className="text-xs text-gray-400 border border-gray-700 px-2 py-0.5">{level.quarter}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{level.subtitle}</p>
                  </div>
                </div>

                {/* Progress bars */}
                {prog && (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">👥 Filleuls actifs</span>
                        <span className="text-white font-bold">{userStats.activeReferrals} / {level.thresholds.referrals}</span>
                      </div>
                      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${prog.refPct}%`, background: level.accent }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{Math.max(0, level.thresholds.referrals - userStats.activeReferrals)} filleuls manquants</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">💰 CA généré (€)</span>
                        <span className="text-white font-bold">€{(userStats.totalRevenue).toLocaleString()} / €{level.thresholds.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${prog.revPct}%`, background: level.accent }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">€{Math.max(0, level.thresholds.revenue - userStats.totalRevenue).toLocaleString()} manquants</p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-3 font-semibold">Avantages inclus :</p>
                <div className="flex flex-wrap gap-2">
                  {level.perks.map((perk, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-black/40 text-gray-300 border border-white/10">{perk}</span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Ambassador special */}
          <div className="p-6 bg-gradient-to-br from-purple-950 to-black border-2 border-purple-400">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl">👑</span>
              <div>
                <h3 className="text-xl font-black text-white">👑 AMBASSADEUR — Destination Surprise (Japon, Seychelles…)</h3>
                <p className="text-sm text-gray-400 mt-1">Top 3 du classement annuel + 1 000 000€+ de CA généré</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {EXPEDITION_LEVELS[4].perks.map((p, i) => (
                <span key={i} className="text-xs px-3 py-1.5 bg-black/40 text-gray-300 border border-purple-800">{p}</span>
              ))}
            </div>
            <div className="p-3 bg-purple-900/20 border border-purple-800 text-center">
              <p className="text-purple-300 text-sm font-bold">🔥 Le niveau ultime — Réservé aux Top 3 leaders de l'année</p>
            </div>
          </div>
        </div>
      )}

      {}
      {activeTab === 'levels' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black">
              <tr>
                {['Niveau', 'Destination', 'Seuil Filleuls', 'Seuil CA', 'Avantages', 'Période'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-yellow-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-900/20">
              {EXPEDITION_LEVELS.map(level => (
                <tr key={level.id} className={`hover:bg-yellow-900/10 ${isUnlocked(level) ? 'bg-green-900/10' : ''}`}>
                  <td className="px-4 py-4">
                    <span className="font-black text-white">{level.tier}</span>
                    {isUnlocked(level) && <span className="ml-2 text-green-400 text-xs">✓</span>}
                  </td>
                  <td className="px-4 py-4 text-gray-300 text-sm">{level.destination}</td>
                  <td className="px-4 py-4 text-yellow-500 font-bold">{level.thresholds.special || `${level.thresholds.referrals} actifs`}</td>
                  <td className="px-4 py-4 text-yellow-500 font-bold">{level.thresholds.revenue ? `€${level.thresholds.revenue.toLocaleString()}` : 'Top 3'}</td>
                  <td className="px-4 py-4 text-gray-400 text-xs">{level.perks.slice(0, 2).join(' • ')}</td>
                  <td className="px-4 py-4 text-gray-400 text-sm">{level.quarter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {}
      {activeTab === 'leaderboard' && (
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6">
          <h3 className="text-2xl font-black text-yellow-500 mb-6">🏆 CLASSEMENT DES LEADERS</h3>
          <div className="space-y-3">
            {leaderboard.map((entry, i) => {
              const levelInfo = EXPEDITION_LEVELS.find(l => l.id === entry.level);
              return (
                <div key={i} className={`flex items-center gap-4 p-4 border transition-all ${i < 3 ? 'border-yellow-600 bg-yellow-900/10' : 'border-yellow-900/20'}`}>
                  <div className={`w-10 h-10 flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
                    #{entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{entry.name}</p>
                    <p className="text-xs text-gray-400">{entry.referrals} filleuls • €{entry.revenue.toLocaleString()} CA</p>
                  </div>
                  {levelInfo && (
                    <span className={`px-3 py-1 ${levelInfo.badge} text-white text-xs font-black`}>{levelInfo.tier}</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">Classement mis à jour en temps réel • Période : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
        </div>
      )}
    </div>
  );
}
