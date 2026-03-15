import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function getNextFriday() {
  const now = new Date();
  const day = now.getDay(); 
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilFriday);
  next.setHours(15, 0, 0, 0);
  return next;
}

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
      if (diff <= 0) { setTimeLeft('Paiement en cours...'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d}j ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [targetDate]);
  return <span className="font-mono font-black text-yellow-400">{timeLeft}</span>;
}

export default function WeeklyPayment() {
  const { user, api } = useAuth();
  const [wallets, setWallets] = useState({
    investment: 0,   
    pending: 0,      
    available: 0     
  });
  const [weeklyBreakdown, setWeeklyBreakdown] = useState({
    monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
    networkBonus: 0, multiplier: 0
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('orange_money');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [reinvesting, setReinvesting] = useState(false);
  const [reinvestSuccess, setReinvestSuccess] = useState('');

  const nextPayday = getNextFriday();

  useEffect(() => { fetchWalletData(); }, []);

  const fetchWalletData = async () => {
    try {
      const res = await api.get('/wallet/balances');
      if (res.data.success) {
        const d = res.data.data;
        setWallets(d.wallets || wallets);
        setWeeklyBreakdown(d.weeklyBreakdown || weeklyBreakdown);
        setPaymentHistory(d.paymentHistory || []);
      }
    } catch (e) {
      
      setWallets({ investment: 500, pending: 28.50, available: 45.75 });
      setWeeklyBreakdown({ monday: 4.50, tuesday: 3.75, wednesday: 5.25, thursday: 2.25, networkBonus: 5.75, multiplier: 7.00 });
      setPaymentHistory([
        { date: '2024-12-15', amount: 30.00, breakdown: { taps: 12, videos: 8, network: 10 }, status: 'paid' },
        { date: '2024-12-08', amount: 22.50, breakdown: { taps: 8, videos: 7, network: 7.5 }, status: 'paid' },
        { date: '2024-12-01', amount: 18.75, breakdown: { taps: 6, videos: 5, network: 7.75 }, status: 'paid' },
      ]);
    } finally { setLoading(false); }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 1) { setWithdrawError('Montant minimum : 1 USDT'); return; }
    if (amount > wallets.available) { setWithdrawError('Solde insuffisant'); return; }
    setWithdrawing(true);
    try {
      await api.post('/wallet/withdraw', { amount, method: withdrawMethod });
      setWallets(w => ({ ...w, available: w.available - amount }));
      setWithdrawSuccess(`Retrait de ${amount} USDT initié avec succès !`);
      setWithdrawAmount('');
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Erreur lors du retrait');
    } finally { setWithdrawing(false); }
  };

  const handleReinvest = async () => {
    if (wallets.available < 50) { return; }
    setReinvesting(true);
    try {
      await api.post('/wallet/reinvest', { amount: wallets.available });
      setReinvestSuccess(`${wallets.available.toFixed(2)} USDT réinvesti !`);
      setWallets(w => ({ ...w, available: 0 }));
      setTimeout(() => setReinvestSuccess(''), 3000);
    } catch (err) {  }
    finally { setReinvesting(false); }
  };

  const totalWeeklyEstimate = Object.values(weeklyBreakdown).reduce((a, b) => a + b, 0);

  const dayNames = { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi' };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
          💰 MES GAINS & PORTEFEUILLE
        </h1>
        <p className="text-gray-400">Système de paiement hebdomadaire — Vendredi à 15h00</p>
      </div>

      {}
      <div className="mb-8 p-6 bg-gradient-to-r from-yellow-900/30 to-black border-2 border-yellow-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-yellow-500 font-bold text-sm mb-1">💳 PROCHAINE PAIE — VENDREDI À 15H00</p>
            <Countdown targetDate={nextPayday} />
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Estimation en cours</p>
            <p className="text-3xl font-black text-white">${totalWeeklyEstimate.toFixed(2)} <span className="text-yellow-500 text-lg">USDT</span></p>
          </div>
        </div>
      </div>

      {}
      <div className="grid md:grid-cols-3 gap-5 mb-10">
        {}
        <div className="bg-gradient-to-br from-blue-950 to-black border-2 border-blue-700 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Compte 1</p>
              <p className="text-white font-black">Investissement</p>
            </div>
          </div>
          <p className="text-3xl font-black text-white mb-1">${wallets.investment.toFixed(2)}</p>
          <p className="text-xs text-gray-500 leading-relaxed">Capital investi + ROI bloqué jusqu'à échéance. Non retirable avant la fin du cycle.</p>
          <div className="mt-3 px-3 py-1.5 bg-blue-900/30 border border-blue-800 inline-block">
            <span className="text-xs text-blue-400">🔐 Bloqué jusqu'à échéance</span>
          </div>
        </div>

        {}
        <div className="bg-gradient-to-br from-yellow-950 to-black border-2 border-yellow-700 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Compte 2</p>
              <p className="text-white font-black">Gains en Cours</p>
            </div>
          </div>
          <p className="text-3xl font-black text-yellow-400 mb-1">${wallets.pending.toFixed(2)}</p>
          <p className="text-xs text-gray-500 leading-relaxed">Taps, vidéos et quiz de la semaine. Virement automatique chaque vendredi à 15h.</p>
          <div className="mt-3 px-3 py-1.5 bg-yellow-900/30 border border-yellow-800 inline-block">
            <span className="text-xs text-yellow-500">⏳ Virement vendredi</span>
          </div>
        </div>

        {}
        <div className="bg-gradient-to-br from-green-950 to-black border-2 border-green-600 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💵</span>
            <div>
              <p className="text-xs text-green-400 font-bold uppercase tracking-wider">Compte 3</p>
              <p className="text-white font-black">Solde Disponible</p>
            </div>
          </div>
          <p className="text-3xl font-black text-green-400 mb-1">${wallets.available.toFixed(2)}</p>
          <p className="text-xs text-gray-500 leading-relaxed">Retirable ou réinvestissable immédiatement. Reçoit le virement de chaque vendredi.</p>
          <div className="mt-3 px-3 py-1.5 bg-green-900/30 border border-green-800 inline-block">
            <span className="text-xs text-green-400">✓ Disponible maintenant</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6">
          <h3 className="text-xl font-black text-yellow-500 mb-5">📅 DÉTAIL DE LA SEMAINE</h3>
          <div className="space-y-3">
            {Object.entries(dayNames).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-yellow-900/20">
                <span className="text-gray-400 text-sm">📅 {label}</span>
                <span className="font-bold text-white">${(weeklyBreakdown[key] || 0).toFixed(2)} USDT</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 border-b border-yellow-900/20">
              <span className="text-gray-400 text-sm">🎯 Bonus réseau</span>
              <span className="font-bold text-green-400">+${(weeklyBreakdown.networkBonus || 0).toFixed(2)} USDT</span>
            </div>
            {weeklyBreakdown.multiplier > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-yellow-900/20">
                <span className="text-gray-400 text-sm">✨ Multiplicateur</span>
                <span className="font-bold text-purple-400">+${(weeklyBreakdown.multiplier || 0).toFixed(2)} USDT</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 mt-1">
              <span className="font-black text-white">TOTAL ESTIMÉ</span>
              <span className="font-black text-yellow-500 text-xl">${totalWeeklyEstimate.toFixed(2)} USDT</span>
            </div>
          </div>
        </div>

        {}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6">
          <h3 className="text-xl font-black text-yellow-500 mb-5">💸 RETIRER MES FONDS</h3>

          {withdrawSuccess && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-600 text-green-400 text-sm font-semibold">{withdrawSuccess}</div>
          )}
          {withdrawError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600 text-red-400 text-sm">{withdrawError}</div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs text-yellow-500 font-bold mb-1 uppercase tracking-wider">Montant (USDT)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={wallets.available}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(wallets.available.toFixed(2))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-yellow-500 font-bold hover:text-yellow-400"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Disponible : ${wallets.available.toFixed(2)} • Min : 1 USDT</p>
            </div>

            <div>
              <label className="block text-xs text-yellow-500 font-bold mb-1 uppercase tracking-wider">Méthode</label>
              <select
                value={withdrawMethod}
                onChange={e => setWithdrawMethod(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="orange_money">📱 Orange Money (-0.50 USDT frais)</option>
                <option value="moov_money">📱 Moov Money (-0.50 USDT frais)</option>
                <option value="bank_transfer">🏦 Virement Bancaire (-1.00 USDT frais)</option>
                <option value="crypto">₿ Crypto (USDT TRC20 - gratuit)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={withdrawing || wallets.available < 1}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              {withdrawing ? 'TRAITEMENT...' : 'RETIRER →'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-yellow-900/20">
            <button
              onClick={handleReinvest}
              disabled={reinvesting || wallets.available < 50}
              className="w-full py-3 border-2 border-yellow-500 text-yellow-500 font-black hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {reinvesting ? 'RÉINVESTISSEMENT...' : `♻️ RÉINVESTIR (${wallets.available.toFixed(2)} USDT)`}
            </button>
            {wallets.available < 50 && <p className="text-xs text-gray-600 mt-1 text-center">50 USDT min pour réinvestir</p>}
            {reinvestSuccess && <p className="text-green-400 text-sm text-center mt-2 font-bold">{reinvestSuccess}</p>}
          </div>
        </div>
      </div>

      {}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-900/30 p-6">
        <h3 className="text-xl font-black text-yellow-500 mb-5">📜 HISTORIQUE DES PAIEMENTS</h3>
        {paymentHistory.length > 0 ? (
          <div className="space-y-3">
            {paymentHistory.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-yellow-900/20 hover:border-yellow-900/40 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      Taps: ${p.breakdown?.taps || 0} • Vidéos: ${p.breakdown?.videos || 0} • Réseau: ${p.breakdown?.network || 0}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-green-400 text-lg">${p.amount.toFixed(2)}</p>
                  <p className="text-xs text-green-600 font-bold">✓ PAYÉ</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-3">📭</p>
            <p>Aucun paiement encore effectué</p>
            <p className="text-sm mt-1">Votre premier paiement arrivera vendredi !</p>
          </div>
        )}

        {}
        <div className="mt-6 p-4 bg-yellow-900/10 border border-yellow-900/30">
          <h4 className="text-yellow-500 font-bold text-sm mb-3">📋 RÈGLES DU SYSTÈME DE PAIEMENT</h4>
          <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-400">
            {[
              ['📅 Période de calcul', 'Lundi 00:00 → Jeudi 23:59'],
              ['💳 Jour de paiement', 'Vendredi à 15h00 précises'],
              ['💰 Seuil minimum', '1 USDT (sinon report auto)'],
              ['📱 Frais de retrait', '0.50 USDT (Mobile Money)'],
              ['♻️ Report automatique', 'Si < 1 USDT → accumulé'],
              ['🔒 Transparence', 'Solde "en cours" visible'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 py-1 border-b border-yellow-900/10">
                <span className="font-semibold text-gray-300">{k}</span>
                <span className="text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
