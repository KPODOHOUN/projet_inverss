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
      <div className="flex items-center justify-center py-20">
        <div className="w-11 h-11 rounded-full border-2 border-transparent border-t-[#f59e0b] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 animate-cardIn">
        <div>
          <p className="lux-label mb-2">Catalogue</p>
          <h1 className="lux-serif text-2xl sm:text-3xl font-bold text-[#e7ebf2] leading-none">Investir</h1>
          <p className="mt-2 text-sm text-[#e7ebf2]/50">Choisissez un pack adapté à vos objectifs.</p>
        </div>
        <div className="lux-card px-5 py-3.5">
          <p className="lux-label !text-[10px] mb-1">Solde disponible</p>
          <p className="lux-num text-xl font-medium lux-gold-text">${balance.toFixed(2)}</p>
        </div>
      </div>

      {user.kycStatus !== 'verified' && (
        <div className="lux-card-gold p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <h3 className="lux-serif text-2xl font-bold text-[#fbbf24] mb-1">Vérification KYC requise</h3>
            <p className="text-sm text-[#e7ebf2]/60">Complétez votre vérification d'identité pour pouvoir investir.</p>
          </div>
          <button type="button" onClick={() => onNavigate?.('kyc')} className="relative lux-btn-gold">
            Compléter mon KYC →
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-sm font-medium">
          ✓ {success}
        </div>
      )}

      <Confetti active={celebrate} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
              style={{ animationDelay: `${i * 60}ms` }}
              className="lux-card lux-card-hover animate-cardIn flex flex-col p-6 group"
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="min-w-0">
                  <p title={pack.name} className="lux-serif text-xl sm:text-2xl font-semibold text-[#e7ebf2] leading-tight line-clamp-2 group-hover:text-[#fbbf24] transition-colors">{pack.name}</p>
                  <p className="text-xs text-[#e7ebf2]/45 mt-1">À partir de <span className="lux-num text-[#e7ebf2]/70">${pack.minAmount}</span></p>
                </div>
                <span className="shrink-0 lux-pill bg-yellow-400/10 text-[#fbbf24] ring-1 ring-inset ring-yellow-400/25">
                  {pack.termDays} jours
                </span>
              </div>

              {rateText && (
                <div className="mb-5">
                  <p className="lux-label !text-[10px] mb-2">Taux journalier</p>
                  <p className="lux-num text-3xl font-light lux-gold-text leading-none">
                    {rateText}<span className="text-lg ml-1">%</span>
                  </p>
                </div>
              )}

              {totalText && (
                <div className="flex items-center justify-between py-3 border-t border-white/5 mb-5">
                  <span className="text-xs text-[#e7ebf2]/50">Rendement total</span>
                  <span className="lux-num text-sm font-medium text-emerald-300">{totalText}</span>
                </div>
              )}

              <button
                onClick={() => openPurchaseModal(key)}
                disabled={user.kycStatus !== 'verified'}
                className="mt-auto lux-btn-gold w-full !py-3"
              >
                Investir
              </button>
            </div>
          );
        })}
      </div>

      {showModal && selectedPack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative lux-card-gold max-w-md w-full p-7 animate-cardIn">
            <div className="relative flex justify-between items-start mb-6">
              <div>
                <p className="lux-label mb-1">Nouvel investissement</p>
                <h2 className="lux-serif text-3xl font-bold text-[#e7ebf2] leading-none">{packs[selectedPack].name}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#e7ebf2]/50 hover:text-[#e7ebf2] hover:bg-white/5 transition-colors text-xl leading-none" aria-label="Fermer">×</button>
            </div>

            {error && (
              <div className="relative mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm">{error}</div>
            )}

            <form onSubmit={handlePurchase} className="relative space-y-6">
              <div>
                <label className="block lux-label mb-2">Montant à investir ($)</label>
                <input
                  type="number"
                  autoFocus
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  min={packs[selectedPack].minAmount}
                  max={packs[selectedPack].maxAmount || undefined}
                  step="1"
                  required
                  className="lux-input lux-num !text-2xl !font-light !py-4"
                  placeholder={packs[selectedPack].minAmount.toString()}
                />
                <p className="text-xs text-[#e7ebf2]/45 mt-2">
                  Minimum ${packs[selectedPack].minAmount}
                  {packs[selectedPack].maxAmount && ` · Maximum $${packs[selectedPack].maxAmount}`}
                  {' · '}Disponible ${balance.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 lux-btn-ghost !py-3">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="flex-1 lux-btn-gold !py-3">
                  {loading ? 'Traitement…' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
