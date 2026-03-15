import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const ROBOT_PACKS = {
  neo: {
    id: 'neo', name: 'Néo-Miner V1', level: 1, emoji: '🤖',
    price: 10000, priceFCFA: '10 000 FCFA', priceUSD: '≈ 16.5 USD',
    nlxPerHour: 1, dailyCap: 10, manualTaps: 5,
    lifetimeDays: 90, badge: 'Pionnier',
    gradient: 'from-gray-700 to-gray-800', borderColor: 'border-gray-500',
    features: ['1 NLX/heure (10 NLX/jour)', '5 taps manuels/jour', '1 leçon/jour (+2 NLX)', 'Parrainage Niv.1 : 10%', 'Badge Pionnier 🏅', 'Renouvellement : 5 000 FCFA'],
    referral: { 'Niv.1': 10 },
    description: 'Parfait pour débuter le mining NLX.'
  },
  crypto: {
    id: 'crypto', name: 'Crypto-Digger X2', level: 2, emoji: '⚡',
    price: 50000, priceFCFA: '50 000 FCFA', priceUSD: '≈ 83 USD',
    nlxPerHour: 3, dailyCap: 30, manualTaps: 15,
    lifetimeDays: 180, badge: 'Expert',
    gradient: 'from-blue-950 to-gray-900', borderColor: 'border-blue-500',
    features: ['3 NLX/heure (30 NLX/jour)', '15 taps manuels/jour', '3 leçons/jour', 'Auto-tap 5 taps/6h', 'Parrainage Niv.1: 10% + Niv.2: 5%', 'Réduction 20% frais <500€', 'Accès groupe Telegram VIP', 'Badge Expert 🥈'],
    referral: { 'Niv.1': 10, 'Niv.2': 5 },
    description: 'Pour les mineurs actifs qui veulent accélérer.'
  },
  visionnaire: {
    id: 'visionnaire', name: 'Quantum-Master Pro', level: 3, emoji: '💎',
    price: 200000, priceFCFA: '200 000 FCFA', priceUSD: '≈ 333 USD',
    nlxPerHour: 8, dailyCap: 80, manualTaps: -1,
    lifetimeDays: 365, badge: 'Visionnaire',
    gradient: 'from-yellow-950 to-black', borderColor: 'border-yellow-500',
    features: ['8 NLX/heure (80+ NLX/jour)', 'Taps illimités', 'Leçons illimitées', 'Multi-Mining (2 tokens)', '+20% si 5+ filleuls actifs', 'Parrainage 3 niveaux (15%/7%/3%)', 'Droit de vote sur nouveaux projets', 'Consultation 30min offerte', 'Accès anticipé aux fonctionnalités', 'Badge Visionnaire 👑'],
    referral: { 'Niv.1': 15, 'Niv.2': 7, 'Niv.3': 3 },
    description: 'Le robot ultime pour les leaders du réseau.'
  }
};

export default function Mining() {
  const { user, api } = useAuth();
  const [miningData, setMiningData] = useState(null);
  const [activeRobot, setActiveRobot] = useState(null);
  const [tapsToday, setTapsToday] = useState(0);
  const [nlxBalance, setNlxBalance] = useState(0);
  const [nlxEarnedToday, setNlxEarnedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showShop, setShowShop] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [tapEffect, setTapEffect] = useState(false);
  const [floatingReward, setFloatingReward] = useState(null);
  const tapBtn = useRef(null);

  useEffect(() => { fetchMiningData(); }, []);

  const fetchMiningData = async () => {
    try {
      const res = await api.get('/mining/status');
      if (res.data.success) {
        const d = res.data.data;
        setMiningData(d);
        setTapsToday(d.tapsToday || 0);
        setNlxBalance(d.nlxBalance || 0);
        setNlxEarnedToday(d.nlxEarnedToday || 0);
        if (d.activeRobot?.pack) setActiveRobot(ROBOT_PACKS[d.activeRobot.pack] || null);
      }
    } catch (e) {  }
    finally { setLoading(false); }
  };

  const handleTap = async (e) => {
    if (!activeRobot) { setShowShop(true); return; }
    const maxTaps = activeRobot.manualTaps;
    if (maxTaps !== -1 && tapsToday >= maxTaps) return;

    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 150);

    const earned = +(activeRobot.nlxPerHour / 60).toFixed(4);
    setTapsToday(t => t + 1);
    setNlxBalance(b => +(b + earned).toFixed(4));
    setNlxEarnedToday(e => +(e + earned).toFixed(4));

    const id = Date.now();
    setFloatingReward({ id, text: `+${earned} NLX` });
    setTimeout(() => setFloatingReward(r => r?.id === id ? null : r), 1000);

    try { await api.post('/mining/tap'); } catch {}
  };

  const purchaseRobot = async (robotId) => {
    setPurchasing(robotId);
    try {
      const res = await api.post('/mining/purchase-robot', { robotId });
      if (res.data.success) {
        setActiveRobot(ROBOT_PACKS[robotId]);
        setShowShop(false);
        await fetchMiningData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'achat');
    } finally { setPurchasing(false); }
  };

  const tapMax = activeRobot?.manualTaps;
  const tapPct = tapMax && tapMax !== -1 ? Math.min((tapsToday / tapMax) * 100, 100) : 0;
  const daysLeft = miningData?.activeRobot?.daysRemaining || activeRobot?.lifetimeDays || 0;
  const atTapLimit = tapMax !== -1 && tapsToday >= tapMax;

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {}
      {floatingReward && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <span className="text-yellow-400 font-black text-xl animate-bounce">{floatingReward.text}</span>
        </div>
      )}

      {}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-yellow-500/10 blur-2xl rounded-full"></div>
          <img src="/images/nlx-coins.png" alt="NLX" className="relative z-10 w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
        </div>
        <div>
          <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">MINING NLX</h1>
          <p className="text-xl text-gray-400">Tapez et laissez votre robot générer des tokens NLX 24h/24</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-5 text-black shadow-xl shadow-yellow-500/30">
          <p className="text-xs font-bold mb-1">SOLDE NLX</p>
          <p className="text-3xl font-black">{nlxBalance.toFixed(2)}</p>
          <p className="text-xs opacity-70">Token NELIAXA</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-5">
          <p className="text-xs text-yellow-500 font-bold mb-1">GAGNÉ AUJOURD'HUI</p>
          <p className="text-3xl font-black text-white">{nlxEarnedToday.toFixed(4)}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-5">
          <p className="text-xs text-yellow-500 font-bold mb-1">TAPS AUJOURD'HUI</p>
          <p className="text-3xl font-black text-white">{tapsToday}<span className="text-base text-gray-500"> / {tapMax === -1 ? '∞' : tapMax || '—'}</span></p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-5">
          <p className="text-xs text-yellow-500 font-bold mb-1">ROBOT ACTIF</p>
          <p className="text-lg font-black text-white">{activeRobot ? activeRobot.name : 'Aucun'}</p>
          {activeRobot && <p className="text-xs text-gray-400 mt-1">{daysLeft}j restants</p>}
        </div>
      </div>

      {}
      {activeRobot && (
        <div className={`mb-8 p-5 bg-gradient-to-br ${activeRobot.gradient} border-2 ${activeRobot.borderColor}`}>
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <span className="text-4xl">{activeRobot.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-black text-white">{activeRobot.name}</h3>
                <span className="px-3 py-0.5 bg-green-500 text-black text-xs font-black">ACTIF</span>
                <span className="px-3 py-0.5 bg-yellow-900/40 text-yellow-400 text-xs font-bold border border-yellow-700">{activeRobot.nlxPerHour} NLX/h</span>
              </div>
              <p className="text-gray-400 text-sm mt-0.5">{activeRobot.description}</p>
            </div>
          </div>
          {tapMax !== -1 && (
            <div>
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Taps quotidiens</span><span className="text-white font-bold">{tapsToday}/{tapMax}</span></div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all rounded-full" style={{ width: `${tapPct}%` }}></div>
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">Durée restante :</span>
            <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(0, (daysLeft / activeRobot.lifetimeDays) * 100)}%` }}></div>
            </div>
            <span className="text-xs text-white font-bold">{daysLeft} / {activeRobot.lifetimeDays} jours</span>
          </div>
        </div>
      )}

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-10 mb-8 text-center">
        <h2 className="text-2xl font-black text-yellow-500 mb-8">⛏️ ZONE DE MINING</h2>
        {activeRobot ? (
          <>
            <button
              ref={tapBtn}
              onClick={handleTap}
              disabled={atTapLimit}
              className={`relative mx-auto flex items-center justify-center w-56 h-56 rounded-full select-none transition-all duration-100
                bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-2xl shadow-yellow-500/60
                ${tapEffect ? 'scale-90' : 'scale-100 hover:scale-105 active:scale-95'}
                disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <div className="text-center pointer-events-none">
                <div className="text-5xl mb-2">{activeRobot.emoji}</div>
                <div className="text-black font-black text-lg">TAP TO MINE</div>
                <div className="text-black/70 text-sm mt-1">+{(activeRobot.nlxPerHour / 60).toFixed(4)} NLX</div>
              </div>
            </button>
            {atTapLimit
              ? <p className="mt-5 text-gray-400">Limite quotidienne atteinte. Revenez demain !</p>
              : <p className="mt-5 text-sm text-gray-500">Robot actif en arrière-plan • {activeRobot.nlxPerHour} NLX/heure automatiquement</p>
            }
          </>
        ) : (
          <div>
            <div className="text-7xl mb-6 opacity-20">🤖</div>
            <p className="text-xl text-gray-400 mb-6">Achetez un robot pour commencer à miner !</p>
            <button onClick={() => setShowShop(true)} className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black hover:from-yellow-600 hover:to-yellow-700 transition-all">
              🛒 ACHETER UN ROBOT →
            </button>
          </div>
        )}
      </div>

      {}
      {activeRobot && (
        <div className="flex justify-center mb-10">
          <button onClick={() => setShowShop(true)} className="px-8 py-3 border-2 border-yellow-500 text-yellow-500 font-black hover:bg-yellow-500 hover:text-black transition-all">
            🛒 AMÉLIORER MON ROBOT
          </button>
        </div>
      )}

      {}
      {activeRobot && (
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6 mb-8">
          <h3 className="text-xl font-black text-yellow-500 mb-4">💰 COMMISSIONS DE PARRAINAGE — {activeRobot.name}</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(activeRobot.referral).map(([lvl, pct]) => (
              <div key={lvl} className="p-4 bg-black/50 border border-yellow-900/20 text-center">
                <p className="text-gray-400 text-sm">{lvl}</p>
                <p className="text-3xl font-black text-yellow-500">{pct}%</p>
                <p className="text-xs text-gray-500 mt-1">sur le mining de vos filleuls</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {showShop && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-yellow-900/30 sticky top-0 bg-gray-900 z-10">
              <h3 className="text-2xl font-black text-yellow-500">🤖 BOUTIQUE DES ROBOTS DE MINING</h3>
              <button onClick={() => setShowShop(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>

            <div className="p-6 grid md:grid-cols-3 gap-6">
              {Object.values(ROBOT_PACKS).map(robot => (
                <div key={robot.id} className={`relative bg-gradient-to-br ${robot.gradient} border-2 ${robot.borderColor} p-6 flex flex-col`}>
                  {activeRobot?.id === robot.id && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-black text-xs font-black whitespace-nowrap">✓ VOTRE ROBOT</div>
                  )}
                  {robot.id === 'visionnaire' && activeRobot?.id !== robot.id && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-yellow-500 text-black text-xs font-black">⭐ PREMIUM</div>
                  )}

                  <div className="text-center mb-5">
                    <div className="text-5xl mb-3">{robot.emoji}</div>
                    <h3 className="text-xl font-black text-white">{robot.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{robot.description}</p>
                  </div>

                  <div className="text-center mb-4 p-3 bg-black/30">
                    <p className="text-2xl font-black text-yellow-500">{robot.priceFCFA}</p>
                    <p className="text-sm text-gray-400">{robot.priceUSD}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-5 text-center text-xs">
                    <div className="p-2 bg-black/30"><p className="text-gray-500">NLX/heure</p><p className="font-black text-yellow-500 text-base">{robot.nlxPerHour}</p></div>
                    <div className="p-2 bg-black/30"><p className="text-gray-500">Max/jour</p><p className="font-black text-yellow-500 text-base">{robot.dailyCap}</p></div>
                    <div className="p-2 bg-black/30"><p className="text-gray-500">Durée</p><p className="font-black text-white text-base">{robot.lifetimeDays}j</p></div>
                    <div className="p-2 bg-black/30"><p className="text-gray-500">Taps/jour</p><p className="font-black text-white text-base">{robot.manualTaps === -1 ? '∞' : robot.manualTaps}</p></div>
                  </div>

                  <ul className="space-y-1.5 mb-6 flex-1">
                    {robot.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-yellow-500 flex-shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => purchaseRobot(robot.id)}
                    disabled={purchasing === robot.id || activeRobot?.id === robot.id}
                    className={`w-full py-3 font-black text-sm transition-all ${
                      activeRobot?.id === robot.id
                        ? 'bg-green-700 text-white cursor-default'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50'
                    }`}
                  >
                    {activeRobot?.id === robot.id ? '✓ ROBOT ACTIF' : purchasing === robot.id ? 'ACHAT...' : `ACHETER — ${robot.priceFCFA}`}
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-yellow-900/30 text-center text-xs text-gray-500">
              * 1 USD ≈ 600 FCFA • NLX = token utilitaire NELIAXA • Les robots minent automatiquement 24h/24
            </div>
          </div>
        </div>
      )}
    </div>
  );
}