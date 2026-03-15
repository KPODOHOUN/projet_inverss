import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const getTodayKey = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  return `neliaxa_watched_${userId}_${today}`;
};

export default function WatchToEarn() {
  const { user, api } = useAuth();
  const [ads, setAds] = useState([]);
  const [watchedToday, setWatchedToday] = useState(0);
  const [nlxEarned, setNlxEarned] = useState(0);
  const [currentAd, setCurrentAd] = useState(null);
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null); 
  const timerRef = useRef(null);
  
  const [isActive, setIsActive] = useState(true);
  const inactivityRef = useRef(null);

  useEffect(() => {
    fetchAdsData();
    
    if (user?._id || user?.id) {
      const key = getTodayKey(user._id || user.id);
      const stored = parseInt(localStorage.getItem(key) || '0', 10);
      setWatchedToday(stored);
    }
  }, []);

  useEffect(() => {
    if (watching && countdown > 0 && isActive) {
      timerRef.current = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && watching) {
      handleAdCompleted();
    }
    return () => clearTimeout(timerRef.current);
  }, [watching, countdown, isActive]);

  useEffect(() => {
    if (!watching) return;

    const resetInactivity = () => {
      setIsActive(true);
      clearTimeout(inactivityRef.current);
      inactivityRef.current = setTimeout(() => setIsActive(false), 10000);
    };

    const handleVisibility = () => {
      if (document.hidden) setIsActive(false);
      else setIsActive(true);
    };

    window.addEventListener('mousemove', resetInactivity);
    window.addEventListener('keydown', resetInactivity);
    document.addEventListener('visibilitychange', handleVisibility);
    resetInactivity();

    return () => {
      window.removeEventListener('mousemove', resetInactivity);
      window.removeEventListener('keydown', resetInactivity);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(inactivityRef.current);
    };
  }, [watching]);

  const fetchAdsData = async () => {
    try {
      const response = await api.get('/ads/available');
      if (response.data.success) {
        setAds(response.data.data.ads);
        setNlxEarned(response.data.data.totalNlxEarned || 0);
        
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const startWatchingAd = (ad) => {
    setCurrentAd(ad);
    setWatching(true);
    setCountdown(ad.duration);
    setIsActive(true);
    setReward(null);
  };

  const handleAdCompleted = async () => {
    try {
      const response = await api.post('/ads/complete', { adId: currentAd.id });
      if (response.data.success) {
        const earned = response.data.data.nlxEarned;
        
        const newCount = watchedToday + 1;
        setWatchedToday(newCount);
        if (user?._id || user?.id) {
          const key = getTodayKey(user._id || user.id);
          localStorage.setItem(key, String(newCount));
        }
        setNlxEarned(prev => prev + earned);
        setReward(earned);
      }
    } catch (error) {
      console.error('Error completing ad:', error);
    } finally {
      setWatching(false);
      setCurrentAd(null);
      fetchAdsData();
    }
  };

  const cancelWatching = () => {
    clearTimeout(timerRef.current);
    setWatching(false);
    setCurrentAd(null);
    setCountdown(0);
  };

  const getAccessLevel = () => {
    if (!user?.activeInvestments || user.activeInvestments.length === 0) {
      return { level: 'none', name: 'Aucun Pack', limit: 0, reward: 0 };
    }
    const highestPack = user.activeInvestments[0]?.pack;
    const levels = {
      starter:  { level: 'bronze',   name: 'Bronze',   limit: 1,  reward: 0.5 },
      booster:  { level: 'silver',   name: 'Argent',   limit: 3,  reward: 1.5 },
      pro:      { level: 'gold',     name: 'Or',       limit: 5,  reward: 2.5 },
      elite:    { level: 'platinum', name: 'Platine',  limit: 10, reward: 4   },
      diamond:  { level: 'diamond',  name: 'Diamond',  limit: 20, reward: 7.5 },
    };
    return levels[highestPack] || levels.starter;
  };

  const accessLevel = getAccessLevel();
  const remaining = Math.max(0, accessLevel.limit - watchedToday);
  const progressPct = accessLevel.limit > 0 ? Math.round((watchedToday / accessLevel.limit) * 100) : 0;

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

  if (accessLevel.level === 'none') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 p-12 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-black text-yellow-500 mb-4">ACCÈS RÉSERVÉ AUX INVESTISSEURS</h2>
          <p className="text-xl text-gray-400 mb-8">
            Vous devez avoir un pack d'investissement actif pour accéder aux publicités rémunérées.
          </p>
          <a
            href="/dashboard/invest"
            className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all"
          >
            VOIR LES PACKS D'INVESTISSEMENT →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          WATCH-TO-EARN
        </h1>
        <p className="text-xl text-gray-400">Regardez des publicités et gagnez des tokens NLX</p>
      </div>

      {}
      {reward !== null && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-yellow-500 text-black px-8 py-4 font-black text-xl shadow-2xl shadow-yellow-500/50">
            🎉 +{reward} NLX GAGNÉ !
          </div>
        </div>
      )}

      {}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 text-black shadow-2xl shadow-yellow-500/30">
          <p className="text-sm font-semibold mb-2">NLX GAGNÉS AUJOURD'HUI</p>
          <h3 className="text-4xl font-black mb-2">{nlxEarned.toFixed(2)}</h3>
          <p className="text-sm opacity-80">Tokens</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-yellow-500">PUBLICITÉS VUES</p>
          <h3 className="text-4xl font-black mb-2">
            {watchedToday} <span className="text-xl text-gray-500">/ {accessLevel.limit}</span>
          </h3>
          <div className="h-1.5 bg-gray-800 mt-3">
            <div
              className={`h-full transition-all ${progressPct >= 100 ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-900/30 p-6 text-white">
          <p className="text-sm font-semibold mb-2 text-blue-500">NIVEAU D'ACCÈS</p>
          <h3 className="text-2xl font-black mb-2">{accessLevel.name}</h3>
          <p className="text-sm text-gray-400">{accessLevel.reward} NLX/pub</p>
        </div>

        <div className={`bg-gradient-to-br from-gray-900 to-black border-2 ${remaining === 0 ? 'border-red-900/30' : 'border-green-900/30'} p-6 text-white`}>
          <p className={`text-sm font-semibold mb-2 ${remaining === 0 ? 'text-red-500' : 'text-green-500'}`}>RESTANTES</p>
          <h3 className="text-4xl font-black mb-2">{remaining}</h3>
          <p className="text-sm text-gray-400">Publicités disponibles</p>
        </div>
      </div>

      {}
      {watching && currentAd && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 max-w-4xl w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-yellow-500 mb-2">{currentAd.title}</h2>
              <p className="text-gray-400">{currentAd.description}</p>
            </div>

            {}
            <div className="bg-black aspect-video flex items-center justify-center mb-6 relative">
              <div className="text-center">
                <div className="text-6xl mb-4">📺</div>
                <div className={`text-6xl font-black mb-2 ${isActive ? 'text-yellow-500' : 'text-red-500'}`}>
                  {countdown}s
                </div>
                <p className="text-gray-400">
                  {isActive ? 'Regardez la publicité jusqu\'à la fin' : '⚠️ Inactivité détectée — bougez pour reprendre'}
                </p>
              </div>

              {}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${((currentAd.duration - countdown) / currentAd.duration) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500 p-4 flex items-center justify-between">
              <div>
                <p className="text-yellow-500 font-bold">🎁 Récompense : {currentAd.reward} NLX</p>
                <p className="text-sm text-gray-400 mt-1">Ne fermez pas cette fenêtre</p>
              </div>
              <button
                onClick={cancelWatching}
                className="px-4 py-2 border border-red-500 text-red-400 text-sm font-bold hover:bg-red-900/20 transition-all"
              >
                ANNULER
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="mb-12">
        <h2 className="text-3xl font-black text-yellow-500 mb-6">PUBLICITÉS DISPONIBLES</h2>

        {remaining === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-12 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-black text-white mb-4">Limite Quotidienne Atteinte</h3>
            <p className="text-gray-400 mb-6">Revenez demain pour gagner plus de NLX !</p>
            <p className="text-sm text-yellow-500">
              Ou passez à un pack supérieur pour augmenter votre limite quotidienne
            </p>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-black text-white mb-4">Aucune publicité disponible</h3>
            <p className="text-gray-400">Revenez plus tard, de nouvelles publicités seront ajoutées.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6 hover:border-yellow-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-bold ${ad.type === 'internal' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-blue-900/30 text-blue-400'}`}>
                    {ad.type === 'internal' ? 'NELIAXA' : 'PARTENAIRE'}
                  </span>
                  <span className="text-2xl">📺</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{ad.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{ad.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">⏱ {ad.duration}s</span>
                  <span className="text-yellow-500 font-black">+{ad.reward} NLX</span>
                </div>
                <button
                  onClick={() => startWatchingAd(ad)}
                  disabled={remaining === 0 || watching}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  REGARDER →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-8">
        <h3 className="text-2xl font-black text-yellow-500 mb-6">NIVEAUX D'ACCÈS & RÉCOMPENSES</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Niveau</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Pack Requis</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Publicités/Jour</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Récompense/Vue</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-yellow-500 uppercase">Max/Jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-900/20">
              {[
                { name: 'Bronze',  pack: 'Starter (50€+)',    limit: 1,  reward: '0.5 NLX',         max: '0.5 NLX',  current: accessLevel.level === 'bronze' },
                { name: 'Argent',  pack: 'Booster (500€+)',   limit: 3,  reward: '1-2 NLX',          max: '6 NLX',    current: accessLevel.level === 'silver' },
                { name: 'Or',      pack: 'Pro (2000€+)',      limit: 5,  reward: '2-3 NLX',          max: '15 NLX',   current: accessLevel.level === 'gold' },
                { name: 'Platine', pack: 'Elite (10,000€+)',  limit: 10, reward: '3-5 NLX',          max: '50 NLX',   current: accessLevel.level === 'platinum' },
                { name: 'Diamond', pack: 'Diamond (50,000€+)',limit: 20, reward: '5-10 NLX + comm.', max: '150+ NLX', current: accessLevel.level === 'diamond' },
              ].map(row => (
                <tr key={row.name} className={`${row.current ? 'bg-yellow-900/20' : 'hover:bg-yellow-900/10'}`}>
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                    {row.name}
                    {row.current && <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-black">ACTUEL</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{row.pack}</td>
                  <td className="px-6 py-4 text-white">{row.limit} vue/jour</td>
                  <td className="px-6 py-4 text-yellow-500 font-bold">{row.reward}</td>
                  <td className="px-6 py-4 text-green-500 font-bold">{row.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}