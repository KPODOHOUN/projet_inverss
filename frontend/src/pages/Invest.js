import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Confetti from '../components/Confetti';
import { toast } from '../utils/toast';

const INVESTMENT_PACK_KEYS = ['russell2000', 'cac40', 'eurostoxx50', 'ftse100', 'nikkei225', 'dowjones30', 'nasdaq100', 'sp500', 'bund', 'tbonds', 'us10y', 'turbo48h'];

// Deliberately minimal: pack + amount, nothing else. No ROI, duration or
// projected gain shown before committing — those numbers still exist on the
// investment record once created, they're just not part of the sales pitch.
export default function Invest({ onNavigate }) {
  const { user, api } = useAuth();
  const [packs, setPacks] = useState(null);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [selectedPack, setSelectedPack] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchPacks = useCallback(async () => {
    try {
      const response = await api.get('/investments/packs');
      if (response.data.success) {
        const byKey = {};
        for (const p of response.data.data.packs) byKey[p.key] = p;
        setPacks(byKey);
      }
    } catch (err) {
      console.error('Error fetching packs:', err);
    }
  }, [api]);

  const fetchBalance = useCallback(async () => {
    try {
      const response = await api.get('/wallet/balances');
      if (response.data.success) setBalance(response.data.data.summary.available);
    } catch (err) { /* keep last known balance */ }
  }, [api]);

  useEffect(() => {
    fetchPacks();
    fetchBalance();
  }, [fetchPacks, fetchBalance]);

  const openPurchaseModal = (packKey) => {
    if (user.kycStatus !== 'verified') {
      setError('Vous devez compléter votre KYC avant d\'investir.');
      return;
    }
    setSelectedPack(packKey);
    setAmount('');
    setError('');
    setShowModal(true);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const pack = packs[selectedPack];

    if (!numAmount || numAmount <= 0) return setError('Indiquez un montant valide.');
    if (numAmount < pack.minAmount) return setError(`Montant minimum : $${pack.minAmount}`);
    if (pack.maxAmount && numAmount > pack.maxAmount) return setError(`Montant maximum : $${pack.maxAmount}`);
    if (numAmount > balance) return setError(`Solde insuffisant. Votre solde disponible est de $${balance.toFixed(2)}.`);

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/investments/purchase', { pack: selectedPack, amount: numAmount });
      if (response.data.success) {
        setBalance(response.data.data.balance);
        setSuccess(`Investissement de $${numAmount} créé avec succès.`);
        toast(`Investissement de $${numAmount} confirmé !`);
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1200);
        setShowModal(false);
        setSelectedPack(null);
        setAmount('');
        setTimeout(() => onNavigate?.('overview'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'investissement');
    } finally {
      setLoading(false);
    }
  };

  if (!packs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-2 text-white">Investir</h1>
        <p className="text-gray-500">Solde disponible : <span className="text-yellow-400 font-bold">${balance.toFixed(2)}</span></p>
      </div>

      {user.kycStatus !== 'verified' && (
        <div className="mb-8 p-6 bg-yellow-900/10 border border-yellow-800/40 rounded">
          <div className="flex items-start gap-4">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Vérification KYC requise</h3>
              <p className="text-yellow-200/70 mb-4">Vous devez compléter votre vérification d'identité avant de pouvoir investir.</p>
              <button
                type="button"
                onClick={() => onNavigate?.('kyc')}
                className="inline-block px-6 py-2 bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors rounded"
              >
                COMPLÉTER MON KYC →
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-8 p-6 bg-green-950/40 border border-green-800/40 text-green-300 rounded">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <span className="font-bold">{success}</span>
          </div>
        </div>
      )}

      <Confetti active={celebrate} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INVESTMENT_PACK_KEYS.map((key, i) => {
          const pack = packs[key];
          if (!pack) return null;
          const fmt = (n) => String(n).replace('.', ',');
          const rateText = pack.dailyRate
            ? (pack.dailyRate.min === pack.dailyRate.max
                ? fmt(pack.dailyRate.min)
                : `${fmt(pack.dailyRate.min)} – ${fmt(pack.dailyRate.max)}`)
            : null;
          const totalText = pack.totalRoi
            ? (pack.totalRoi.min === pack.totalRoi.max
                ? `${fmt(pack.totalRoi.min)} %`
                : `${fmt(pack.totalRoi.min)} – ${fmt(pack.totalRoi.max)} %`)
            : null;
          return (
            <div
              key={key}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-cardIn flex flex-col bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-yellow-900/25 hover:border-yellow-600/60 transition-all hover:-translate-y-0.5 rounded-xl p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="font-bold text-white text-base leading-snug">{pack.name}</p>
                  <p className="text-xs text-gray-500 mt-1">À partir de ${pack.minAmount}</p>
                </div>
                <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded">
                  {pack.termDays} j
                </span>
              </div>

              {rateText && (
                <div className="mb-4">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Taux journalier</p>
                  <p className="text-3xl font-black text-yellow-400 leading-none">
                    {rateText}<span className="text-base font-bold text-yellow-600 ml-1">%</span>
                  </p>
                </div>
              )}

              {totalText && (
                <div className="flex items-center justify-between py-3 border-t border-yellow-900/20 mb-4">
                  <span className="text-sm text-gray-400">Rendement total</span>
                  <span className="text-sm font-bold text-green-400">{totalText}</span>
                </div>
              )}

              <button
                onClick={() => openPurchaseModal(key)}
                disabled={user.kycStatus !== 'verified'}
                className="mt-auto w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black text-sm tracking-wide rounded-lg hover:from-yellow-400 hover:to-yellow-500 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Investir
              </button>
            </div>
          );
        })}
      </div>

      {showModal && selectedPack && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#0a0a0a] border border-yellow-900/30 max-w-md w-full p-6 rounded-lg">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-black text-white">{packs[selectedPack].name}</h2>
              <button onClick={() => setShowModal(false)} className="text-xl font-bold text-gray-500 hover:text-red-500 transition-colors leading-none">×</button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-800/50 text-red-300 text-sm rounded">{error}</div>
            )}

            <form onSubmit={handlePurchase} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-yellow-600 tracking-widest uppercase mb-2">
                  Montant à investir ($)
                </label>
                <input
                  type="number"
                  autoFocus
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  min={packs[selectedPack].minAmount}
                  max={packs[selectedPack].maxAmount || undefined}
                  step="1"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-yellow-900/30 text-white text-2xl font-bold focus:border-yellow-500/60 focus:outline-none rounded"
                  placeholder={packs[selectedPack].minAmount.toString()}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Minimum : ${packs[selectedPack].minAmount}
                  {packs[selectedPack].maxAmount && ` • Maximum : $${packs[selectedPack].maxAmount}`}
                  {' • '}Disponible : ${balance.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border border-yellow-900/30 text-gray-400 font-bold hover:border-yellow-700 hover:text-yellow-500 transition-colors rounded"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 font-black text-black transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed rounded bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"
                >
                  {loading ? 'TRAITEMENT...' : 'CONFIRMER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
