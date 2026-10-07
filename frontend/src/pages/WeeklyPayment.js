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
      const res = await api.post('/wallet/deposit/invoice', { amount });
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
  const STATUS_COLOR = { pending: 'text-yellow-500', approved: 'text-blue-400', processing: 'text-purple-400', completed: 'text-green-400', rejected: 'text-red-400', cancelled: 'text-gray-500', failed: 'text-red-400' };

  if (loading) return (
    <div className="flex items-center justify-center py-14">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Mes Gains</h1>
        <p className="text-gray-500 text-sm">Votre argent, en un coup d'œil.</p>
      </div>

      {loadError && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-700 text-red-300 text-sm rounded">
          Impossible de charger vos données. Réessayez plus tard.
        </div>
      )}

      {}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        {[
          ['Déposé', summary.deposited, 'text-white'],
          ['Investi', summary.invested, 'text-white'],
          ['Valeur actuelle', summary.currentValue, 'text-yellow-400'],
          ['Gagné', summary.earned, 'text-green-400'],
          ['Disponible', summary.available, 'text-blue-400'],
        ].map(([label, value, color], i) => (
          <div key={label} style={{ animationDelay: `${i * 60}ms` }} className="animate-cardIn bg-[#0d0d0d] border border-yellow-900/20 p-4 rounded-lg">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-lg font-black ${color}`}>$ <AnimatedNumber value={value} /></p>
          </div>
        ))}
      </div>

      <Confetti active={celebrate} />

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {}
        <div className="bg-[#0d0d0d] border border-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-black text-yellow-500 mb-4">Déposer</h3>

          {user?.kycStatus !== 'verified' ? (
            <div className="p-4 bg-yellow-900/10 border border-yellow-800/40 text-yellow-300 text-sm rounded">
              Vérification KYC requise avant tout dépôt.{' '}
              <button onClick={() => onNavigate?.('kyc')} className="underline font-bold">Compléter mon KYC →</button>
            </div>
          ) : (
            <>
              {depositError && <div className="mb-4 p-3 bg-red-900/30 border border-red-600 text-red-400 text-sm rounded">{depositError}</div>}

              <form onSubmit={handleDeposit} className="space-y-3">
                <div>
                  <label className="block text-xs text-yellow-500 font-bold mb-1 uppercase tracking-wider">Montant (USD)</label>
                  <input
                    type="number" step="0.01" min="1"
                    value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none text-lg font-bold rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vous choisirez la crypto (USDT, BTC, ETH…) et le réseau sur la page de paiement sécurisée.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={depositing}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-yellow-700 transition-all rounded"
                >
                  {depositing ? 'REDIRECTION...' : 'PAYER PAR CRYPTO →'}
                </button>
              </form>
            </>
          )}
        </div>

        {}
        <div className="bg-[#0d0d0d] border border-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-black text-yellow-500 mb-4">Retirer</h3>

          {referralGate && referralGate.count < referralGate.required && (
            <div className="mb-4 p-3 bg-blue-950/30 border border-blue-800/40 text-blue-300 text-sm rounded">
              <p className="font-bold mb-1">🔒 Premier retrait verrouillé</p>
              <p>Parrainez encore {referralGate.required - referralGate.count} personne(s) ({referralGate.count}/{referralGate.required}).</p>
            </div>
          )}
          {withdrawSuccess && <div className="mb-4 p-3 bg-green-900/30 border border-green-600 text-green-400 text-sm rounded">{withdrawSuccess}</div>}
          {withdrawError && <div className="mb-4 p-3 bg-red-900/30 border border-red-600 text-red-400 text-sm rounded">{withdrawError}</div>}

          <form onSubmit={handleWithdraw} className="space-y-3">
            <div>
              <label className="block text-xs text-yellow-500 font-bold mb-1 uppercase tracking-wider">Montant (USDT)</label>
              <div className="relative">
                <input
                  type="number" step="0.01" min="1" max={summary.available}
                  value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none text-lg font-bold rounded"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(summary.available.toFixed(2))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-yellow-500 font-bold hover:text-yellow-400"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Disponible : ${summary.available.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-xs text-yellow-500 font-bold mb-1 uppercase tracking-wider">Réseau</label>
              <select
                value={withdrawNetwork} onChange={e => setWithdrawNetwork(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none rounded"
              >
                <option value="TRC20">USDT — TRC20 (Tron)</option>
                <option value="ERC20">USDT — ERC20 (Ethereum)</option>
                <option value="BEP20">USDT — BEP20 (BNB Chain)</option>
                <option value="POLYGON">USDT — Polygon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-yellow-500 font-bold mb-1 uppercase tracking-wider">Votre adresse USDT</label>
              <input
                type="text"
                value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)}
                placeholder="Collez votre adresse de portefeuille"
                className="w-full px-4 py-3 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none text-sm rounded"
              />
              <p className="text-xs text-red-400 mt-1">⚠️ Un envoi sur le mauvais réseau est irrécupérable.</p>
            </div>

            {needs2FA && (
              <div>
                <label className="block text-xs text-yellow-500 font-bold mb-1 uppercase tracking-wider">Code de vérification (2FA)</label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none text-center text-xl font-mono tracking-[0.4em] rounded"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={withdrawing || summary.available < 1 || !withdrawAddress.trim() || (referralGate && referralGate.count < referralGate.required)}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-yellow-700 transition-all rounded"
            >
              {withdrawing ? 'TRAITEMENT...' : 'RETIRER →'}
            </button>
          </form>
        </div>
      </div>

      {}
      <div className="bg-[#0d0d0d] border border-yellow-900/20 p-6 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="text-lg font-black text-yellow-500">Historique récent</h3>
          {transactions.length > 0 && (
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
          const filteredTx = transactions.filter(t => withinPeriod(t.createdAt, periodFilter));
          if (filteredTx.length === 0) {
            return (
              <p className="text-center py-8 text-gray-500">
                {transactions.length > 0 ? 'Aucune opération sur cette période' : 'Aucune opération encore effectuée'}
              </p>
            );
          }
          return (
          <div className="space-y-2">
            {filteredTx.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-black/40 border border-yellow-900/10 rounded">
                <div>
                  <p className="text-white font-semibold text-sm">{TYPE_LABEL[t.type] || t.type}</p>
                  <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${t.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                  </p>
                  <p className={`text-xs font-bold ${STATUS_COLOR[t.status] || 'text-gray-500'}`}>{STATUS_LABEL[t.status] || t.status}</p>
                </div>
              </div>
            ))}
          </div>
          );
        })()}
        {transactions.length > 10 && (
          <button onClick={() => onNavigate?.('transactions')} className="mt-4 w-full text-center text-sm text-yellow-500 hover:text-yellow-400 font-bold">
            Voir tout l'historique →
          </button>
        )}
      </div>
    </div>
  );
}
