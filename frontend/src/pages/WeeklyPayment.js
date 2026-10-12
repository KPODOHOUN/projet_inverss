import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AnimatedNumber from '../components/AnimatedNumber';
import Confetti from '../components/Confetti';
import { toast } from '../utils/toast';

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

// "Mes Gains" — five numbers a user can read in a few seconds: what they
// put in, what they invested, what it's worth today, what it earned, and
// what they can take out. No fabricated weekly payday, no fake payment
// history — every figure here comes straight from real transactions.
export default function WeeklyPayment({ onNavigate }) {
  const { api, user } = useAuth();
  const [summary, setSummary] = useState({ deposited: 0, invested: 0, currentValue: 0, earned: 0, available: 0 });
  const [transactions, setTransactions] = useState([]);
  const [periodFilter, setPeriodFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [depositAmount, setDepositAmount] = useState('');
  const [depositNetwork, setDepositNetwork] = useState('TRC20');
  const [depositing, setDepositing] = useState(false);
  const [depositError, setDepositError] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('TRC20');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [referralGate, setReferralGate] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoadError(false);
    try {
      const [balRes, txRes, refRes] = await Promise.all([
        api.get('/wallet/balances'),
        api.get('/transactions/history'),
        api.get('/referral/stats'),
      ]);
      if (balRes.data.success) setSummary(balRes.data.data.summary);
      if (txRes.data.success) {
        const txs = txRes.data.data.transactions || [];
        setTransactions(txs);
        const hasWithdrawnBefore = txs.some(t => t.type === 'withdrawal');
        if (!hasWithdrawnBefore) {
          setReferralGate({ count: refRes.data?.data?.totalReferrals || 0, required: refRes.data?.data?.withdrawalReferralRequirement ?? 3 });
        }
      }
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositError('');
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 1) return setDepositError('Montant minimum : 1 USD.');

    setDepositing(true);
    try {
      const res = await api.post('/wallet/deposit/invoice', { amount, network: depositNetwork });
      toast('Redirection vers le paiement sécurisé…', 'info');
      window.location.href = res.data.data.invoiceUrl;
    } catch (err) {
      setDepositError(err.response?.data?.message || 'Erreur lors de la création du paiement');
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 1) return setWithdrawError('Montant minimum : 1 USDT');
    if (amount > summary.available) return setWithdrawError('Solde insuffisant');
    if (!withdrawAddress.trim()) return setWithdrawError('Indiquez votre adresse de portefeuille USDT');
    if (needs2FA && !twoFactorCode.trim()) return setWithdrawError('Entrez votre code de vérification à deux facteurs');

    setWithdrawing(true);
    try {
      const res = await api.post('/wallet/withdraw', {
        amount, usdtAddress: withdrawAddress.trim(), network: withdrawNetwork,
        ...(twoFactorCode ? { twoFactorCode: twoFactorCode.trim() } : {})
      });
      const { fee, netPayout, balance } = res.data.data;
      setSummary(s => ({ ...s, available: balance }));
      setWithdrawSuccess(
        fee > 0
          ? `Retrait de ${amount} USDT initié — ${netPayout} USDT net après ${fee} USDT de frais.`
          : `Retrait de ${amount} USDT initié avec succès !`
      );
      toast('Demande de retrait envoyée !');
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1200);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setTwoFactorCode('');
      setNeeds2FA(false);
      fetchAll();
    } catch (err) {
      if (err.response?.data?.requires2FA) {
        setNeeds2FA(true);
        setWithdrawError(err.response.data.message);
      } else {
        setWithdrawError(err.response?.data?.message || 'Erreur lors du retrait');
      }
    } finally {
      setWithdrawing(false);
    }
  };

  const TYPE_LABEL = { deposit: 'Dépôt', investment: 'Investissement', withdrawal: 'Retrait', earning: 'Gain', reinvestment: 'Réinvestissement', commission: 'Commission', refund: 'Remboursement' };
  const STATUS_LABEL = { pending: 'En attente', approved: 'Approuvé', processing: 'En traitement', completed: 'Terminé', rejected: 'Refusé', cancelled: 'Annulé', failed: 'Échoué' };
  const STATUS_COLOR = { pending: 'text-[#fbbf24]', approved: 'text-sky-300', processing: 'text-violet-300', completed: 'text-emerald-300', rejected: 'text-rose-300', cancelled: 'text-[#e7ebf2]/40', failed: 'text-rose-300' };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-11 h-11 rounded-full border-2 border-transparent border-t-[#f59e0b] animate-spin" />
    </div>
  );

  const labelCls = 'block lux-label mb-2';
  const blocked = referralGate && referralGate.count < referralGate.required;

  return (
    <div className="space-y-8">
      <div className="animate-cardIn">
        <p className="lux-label mb-2">Portefeuille USDT</p>
        <h1 className="lux-serif text-2xl sm:text-3xl font-bold text-[#e7ebf2] leading-none">Mes gains</h1>
        <p className="mt-2 text-sm text-[#e7ebf2]/50">Votre argent, en un coup d'œil.</p>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm">
          Impossible de charger vos données. Réessayez plus tard.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {[
          ['Déposé', summary.deposited, 'text-[#e7ebf2]'],
          ['Investi', summary.invested, 'text-[#e7ebf2]'],
          ['Valeur actuelle', summary.currentValue, 'lux-gold-text'],
          ['Gagné', summary.earned, 'text-emerald-300'],
          ['Disponible', summary.available, 'text-[#e7ebf2]'],
        ].map(([label, value, color], i) => (
          <div key={label} style={{ animationDelay: `${i * 60}ms` }} className={`lux-card animate-cardIn p-4 sm:p-5 ${label === 'Disponible' ? 'col-span-2 md:col-span-1 !border-yellow-500/30' : ''}`}>
            <p className="lux-label !text-[10px] mb-2">{label}</p>
            <p className={`lux-num text-lg sm:text-xl font-medium ${color}`}>$ <AnimatedNumber value={value} /></p>
          </div>
        ))}
      </div>

      <Confetti active={celebrate} />

      <div className="grid md:grid-cols-2 gap-5">
        <div className="lux-card p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="lux-icon-chip">↓</span>
            <div>
              <h3 className="lux-serif text-2xl font-bold text-[#e7ebf2] leading-none">Déposer</h3>
              <p className="text-xs text-[#e7ebf2]/45 mt-1">Paiement sécurisé par NOWPayments</p>
            </div>
          </div>

          {user?.kycStatus !== 'verified' ? (
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-[#fbbf24] text-sm">
              Vérification KYC requise avant tout dépôt.{' '}
              <button onClick={() => onNavigate?.('kyc')} className="underline font-semibold">Compléter mon KYC →</button>
            </div>
          ) : (
            <>
              {depositError && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm">{depositError}</div>}
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className={labelCls}>Montant (USD)</label>
                  <input
                    type="number" step="0.01" min="1"
                    value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="lux-input lux-num !text-xl !font-medium"
                  />
                </div>
                <div>
                  <label className={labelCls}>Réseau USDT</label>
                  <select value={depositNetwork} onChange={e => setDepositNetwork(e.target.value)} className="lux-input">
                    <option value="TRC20">USDT — TRC20 (Tron)</option>
                    <option value="ERC20">USDT — ERC20 (Ethereum)</option>
                    <option value="BEP20">USDT — BEP20 (BNB Chain)</option>
                    <option value="POLYGON">USDT — Polygon</option>
                  </select>
                  <p className="text-xs text-[#e7ebf2]/40 mt-2">Seul l'USDT est accepté sur la plateforme.</p>
                </div>
                <button type="submit" disabled={depositing} className="lux-btn-gold w-full !py-3.5 !text-sm">
                  {depositing ? 'Redirection…' : 'Payer en USDT →'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="lux-card p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="lux-icon-chip">↑</span>
            <div>
              <h3 className="lux-serif text-2xl font-bold text-[#e7ebf2] leading-none">Retirer</h3>
              <p className="text-xs text-[#e7ebf2]/45 mt-1">Vers votre portefeuille USDT</p>
            </div>
          </div>

          {blocked && (
            <div className="mb-4 p-4 rounded-xl bg-sky-400/5 border border-sky-400/20 text-sky-200 text-sm">
              <p className="font-semibold mb-1">Premier retrait verrouillé</p>
              <p className="text-sky-200/70">Parrainez encore {referralGate.required - referralGate.count} personne(s) ({referralGate.count}/{referralGate.required}).</p>
              <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-300" style={{ width: `${Math.min(100, (referralGate.count / referralGate.required) * 100)}%` }} />
              </div>
            </div>
          )}
          {withdrawSuccess && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-sm">{withdrawSuccess}</div>}
          {withdrawError && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm">{withdrawError}</div>}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className={labelCls}>Montant (USDT)</label>
              <div className="relative">
                <input
                  type="number" step="0.01" min="1" max={summary.available}
                  value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="lux-input lux-num !text-xl !font-medium !pr-16"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(summary.available.toFixed(2))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#fbbf24] bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-[#e7ebf2]/40 mt-2">Disponible : <span className="lux-num text-[#e7ebf2]/70">${summary.available.toFixed(2)}</span></p>
            </div>

            <div>
              <label className={labelCls}>Réseau</label>
              <select value={withdrawNetwork} onChange={e => setWithdrawNetwork(e.target.value)} className="lux-input">
                <option value="TRC20">USDT — TRC20 (Tron)</option>
                <option value="ERC20">USDT — ERC20 (Ethereum)</option>
                <option value="BEP20">USDT — BEP20 (BNB Chain)</option>
                <option value="POLYGON">USDT — Polygon</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Votre adresse USDT</label>
              <input
                type="text"
                value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)}
                placeholder="Collez votre adresse de portefeuille"
                className="lux-input font-mono !text-xs"
              />
              <p className="text-xs text-rose-300/80 mt-2">Un envoi sur le mauvais réseau est irrécupérable.</p>
            </div>

            {needs2FA && (
              <div>
                <label className={labelCls}>Code de vérification (2FA)</label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="lux-input text-center !text-xl font-mono tracking-[0.4em]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={withdrawing || summary.available < 1 || !withdrawAddress.trim() || blocked}
              className="lux-btn-gold w-full !py-3.5 !text-sm"
            >
              {withdrawing ? 'Traitement…' : 'Retirer →'}
            </button>
          </form>
        </div>
      </div>

      <div className="lux-card p-6 sm:p-7">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="lux-label mb-1">Mouvements</p>
            <h3 className="lux-serif text-2xl font-bold text-[#e7ebf2] leading-none">Historique récent</h3>
          </div>
          {transactions.length > 0 && (
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
          const filteredTx = transactions.filter(t => withinPeriod(t.createdAt, periodFilter));
          if (filteredTx.length === 0) {
            return (
              <p className="text-center py-10 text-sm text-[#e7ebf2]/45">
                {transactions.length > 0 ? 'Aucune opération sur cette période' : 'Aucune opération encore effectuée'}
              </p>
            );
          }
          return (
          <div className="divide-y divide-white/5">
            {filteredTx.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm ${t.amount < 0 ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
                    {t.amount < 0 ? '↑' : '↓'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[#e7ebf2] font-medium text-sm">{TYPE_LABEL[t.type] || t.type}</p>
                    <p className="text-xs text-[#e7ebf2]/40">{new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`lux-num font-medium text-sm ${t.amount < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {t.amount < 0 ? '−' : '+'}${Math.abs(t.amount).toFixed(2)}
                  </p>
                  <p className={`text-[11px] font-medium ${STATUS_COLOR[t.status] || 'text-[#e7ebf2]/45'}`}>{STATUS_LABEL[t.status] || t.status}</p>
                </div>
              </div>
            ))}
          </div>
          );
        })()}
        {transactions.length > 10 && (
          <button onClick={() => onNavigate?.('transactions')} className="lux-btn-ghost w-full mt-5">
            Voir tout l'historique →
          </button>
        )}
      </div>
    </div>
  );
}
