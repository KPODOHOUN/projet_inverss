import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Catmull-Rom -> cubic Bézier: turns the daily points into a smooth curve
// instead of a jagged connect-the-dots line, without inventing data between
// them (the curve still passes through every real point).
const smoothPath = (pts) => {
  if (pts.length < 3) return `M ${pts.map(p => `${p[0]},${p[1]}`).join(' L ')}`;
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
};

// A single-series line chart, hand-drawn in SVG — a smooth 2px gold line
// (reads fine on both themes so no light/dark branching needed), gridlines
// with price labels, a few date ticks, and a hover crosshair + tooltip
// since this chart *is* interactive by default.
function SimulatedChart({ series, source }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const width = 680, height = 260;
  const padL = 54, padR = 12, padT = 16, padB = 28;
  const plotW = width - padL - padR, plotH = height - padT - padB;

  if (!series || series.length < 2) {
    return <div className="h-[260px] flex items-center justify-center text-gray-600 text-sm">Pas assez de données</div>;
  }

  const values = series.map(p => p.value);
  const rawMin = Math.min(...values), rawMax = Math.max(...values);
  const margin = (rawMax - rawMin) * 0.1 || rawMax * 0.02 || 1;
  const min = rawMin - margin, max = rawMax + margin;
  const range = max - min || 1;

  const xAt = (i) => padL + (i / (series.length - 1)) * plotW;
  const yAt = (v) => padT + plotH - ((v - min) / range) * plotH;
  const pts = series.map((p, i) => [xAt(i), yAt(p.value)]);

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]},${padT + plotH} L ${pts[0][0]},${padT + plotH} Z`;

  const gridLines = [0, 0.5, 1].map(f => ({ y: padT + plotH * f, value: max - range * f }));
  const dateTickIdx = [0, Math.floor((series.length - 1) / 2), series.length - 1];

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.round(((relX - padL) / plotW) * (series.length - 1));
    setHover(Math.min(series.length - 1, Math.max(0, i)));
  };

  const last = series[series.length - 1];
  const first = series[0];
  const changePct = ((last.value - first.value) / first.value) * 100;
  const isUp = changePct >= 0;
  const shown = hover !== null ? series[hover] : last;
  const tooltipRight = hover !== null && hover > series.length * 0.65;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <span className="text-2xl font-black text-white">${last.value.toLocaleString('fr-FR')}</span>
        <span className={`text-sm font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
        </span>
        <span className="text-xs text-gray-600">sur {series.length} jours</span>
      </div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[260px]"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={padL} y1={g.y} x2={width - padR} y2={g.y} stroke="currentColor" className="text-gray-800" strokeWidth="1" />
              <text x={padL - 8} y={g.y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="currentColor" className="text-gray-500">
                ${g.value >= 1000 ? Math.round(g.value).toLocaleString('fr-FR') : g.value.toFixed(g.value < 10 ? 3 : 1)}
              </text>
            </g>
          ))}

          {dateTickIdx.map((i, k) => (
            <text key={k} x={xAt(i)} y={height - 8} textAnchor={k === 0 ? 'start' : k === dateTickIdx.length - 1 ? 'end' : 'middle'} fontSize="10" fill="currentColor" className="text-gray-500">
              {series[i].date.slice(5)}
            </text>
          ))}

          <path d={areaPath} fill="url(#chartFill)" stroke="none" />
          <path d={linePath} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill="#D4AF37" />

          {hover !== null && (
            <>
              <line x1={xAt(hover)} y1={padT} x2={xAt(hover)} y2={padT + plotH} stroke="currentColor" className="text-gray-600" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx={pts[hover][0]} cy={pts[hover][1]} r="4.5" fill="#0a0a0a" stroke="#D4AF37" strokeWidth="2" />
            </>
          )}
        </svg>

        {hover !== null && (
          <div
            className="absolute top-2 bg-black border border-yellow-900/40 rounded px-3 py-2 pointer-events-none shadow-lg"
            style={{
              left: `${(hover / (series.length - 1)) * 100}%`,
              transform: tooltipRight ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)'
            }}
          >
            <p className="text-[10px] text-gray-500 whitespace-nowrap">{shown.date}</p>
            <p className="text-sm font-bold text-yellow-400 whitespace-nowrap">${shown.value.toLocaleString('fr-FR')}</p>
          </div>
        )}
      </div>
      <p className="text-[10px] text-gray-600 mt-2 italic">
        {source === 'live'
          ? 'Prix de marché réel (source publique). L\'exécution de la position reste une simulation contrôlée par la plateforme.'
          : 'Simulation interne — ne reflète pas un marché externe réel.'}
      </p>
    </div>
  );
}

function PositionRow({ p }) {
  const isCode = p.mode === 'code';
  const running = p.status === 'open';
  const amountShown = running ? (isCode ? p.previewResult : null) : p.resultAmount;
  return (
    <div className="p-3 bg-black/40 border border-yellow-900/10 rounded">
      <div className="flex justify-between items-start mb-1 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${isCode ? 'bg-blue-900/40 text-blue-300' : 'bg-purple-900/40 text-purple-300'}`}>
            {isCode ? `Code ${p.code}` : p.type}
          </span>
          <span className="text-white font-bold text-sm">{p.asset}</span>
        </div>
        <span className={`text-xs font-bold whitespace-nowrap ${running ? 'text-yellow-500' : 'text-gray-500'}`}>
          {running ? 'En cours' : p.outcome === 'win' ? 'Gagnée' : p.outcome === 'loss' ? 'Perdue' : 'Neutre'}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>${p.amount.toFixed(2)} engagés</span>
        {amountShown !== null && amountShown !== undefined ? (
          <span className={`font-bold ${amountShown >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {amountShown >= 0 ? '+' : ''}${amountShown.toFixed(2)}{running ? ' (estimé)' : ''}
          </span>
        ) : running ? (
          <span className="text-gray-600 italic">Résultat à la clôture</span>
        ) : null}
      </div>
    </div>
  );
}

export default function Trading({ onNavigate, prefillCode, onPrefillConsumed }) {
  const { user, api } = useAuth();
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [chart, setChart] = useState(null);
  const [positions, setPositions] = useState([]);
  const [positionFilter, setPositionFilter] = useState('today');
  const [balance, setBalance] = useState(0);
  const [settings, setSettings] = useState({ payoutPercent: 85, durationsMinutes: [1, 5, 15, 60] });
  const [loading, setLoading] = useState(true);

  // Self-directed BUY/SELL state
  const [selfAmount, setSelfAmount] = useState('');
  const [selfDuration, setSelfDuration] = useState(5);
  const [selfError, setSelfError] = useState('');
  const [selfSuccess, setSelfSuccess] = useState('');
  const [selfSubmitting, setSelfSubmitting] = useState('');

  // Scenario code state (fully independent)
  const [code, setCode] = useState('');
  const [codeAmount, setCodeAmount] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [codeSubmitting, setCodeSubmitting] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await api.get('/trading/assets');
      if (res.data.success) {
        setAssets(res.data.data.assets);
        if (!selectedAsset && res.data.data.assets.length) setSelectedAsset(res.data.data.assets[0].key);
      }
    } catch (e) { /* keep empty list */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await api.get('/trading/positions');
      if (res.data.success) setPositions(res.data.data.positions);
    } catch (e) { /* keep last known */ }
  }, [api]);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await api.get('/wallet/balances');
      if (res.data.success) setBalance(res.data.data.summary.available);
    } catch (e) { /* keep last known */ }
  }, [api]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/trading/settings');
      if (res.data.success) {
        setSettings(res.data.data);
        setSelfDuration(res.data.data.durationsMinutes[0]);
      }
    } catch (e) { /* keep defaults */ }
  }, [api]);

  useEffect(() => {
    Promise.all([fetchAssets(), fetchPositions(), fetchBalance(), fetchSettings()]).finally(() => setLoading(false));
  }, [fetchAssets, fetchPositions, fetchBalance, fetchSettings]);

  useEffect(() => {
    if (!selectedAsset) return;
    api.get(`/trading/chart/${selectedAsset}`).then(res => {
      if (res.data.success) setChart(res.data.data);
    }).catch(() => setChart(null));
  }, [selectedAsset, api]);

  // A notification click hands us a code to redeem — drop it straight into
  // the (independent) code box rather than making the user retype it.
  useEffect(() => {
    if (prefillCode) {
      setCode(prefillCode);
      onPrefillConsumed?.();
    }
  }, [prefillCode, onPrefillConsumed]);

  // Live positions can settle within a minute — refresh the list periodically
  // so a running self-directed trade flips to its result without a manual reload.
  useEffect(() => {
    const id = setInterval(() => { fetchPositions(); fetchBalance(); }, 15000);
    return () => clearInterval(id);
  }, [fetchPositions, fetchBalance]);

  const currentAsset = assets.find(a => a.key === selectedAsset);

  const openSelfPosition = async (type) => {
    setSelfError(''); setSelfSuccess('');
    const numAmount = parseFloat(selfAmount);
    if (!numAmount || numAmount <= 0) return setSelfError('Indiquez un montant valide.');
    if (numAmount > balance) return setSelfError(`Solde insuffisant. Disponible : $${balance.toFixed(2)}.`);
    if (user.kycStatus !== 'verified') return setSelfError('Vérification KYC requise avant de trader.');
    setSelfSubmitting(type);
    try {
      const res = await api.post('/trading/open', {
        asset: selectedAsset, amount: numAmount, type, durationMinutes: selfDuration
      });
      if (res.data.success) {
        setBalance(res.data.data.balance);
        setSelfSuccess(`Position ${type} ouverte sur ${currentAsset?.name}.`);
        setSelfAmount('');
        fetchPositions();
        setTimeout(() => setSelfSuccess(''), 4000);
      }
    } catch (err) {
      setSelfError(err.response?.data?.message || 'Erreur lors de l\'ouverture de la position');
    } finally {
      setSelfSubmitting('');
    }
  };

  const redeemCode = async (e) => {
    e.preventDefault();
    setCodeError(''); setCodeSuccess('');
    const numAmount = parseFloat(codeAmount);
    if (!code.trim()) return setCodeError('Indiquez le code reçu de l\'administrateur.');
    if (!numAmount || numAmount <= 0) return setCodeError('Indiquez un montant valide.');
    if (numAmount > balance) return setCodeError(`Solde insuffisant. Disponible : $${balance.toFixed(2)}.`);
    if (user.kycStatus !== 'verified') return setCodeError('Vérification KYC requise avant de trader.');
    setCodeSubmitting(true);
    try {
      const res = await api.post('/trading/redeem', { code: code.trim(), amount: numAmount });
      if (res.data.success) {
        setBalance(res.data.data.balance);
        setCodeSuccess('Code utilisé avec succès. Position ouverte.');
        setCode(''); setCodeAmount('');
        fetchPositions();
        setTimeout(() => setCodeSuccess(''), 4000);
      }
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Erreur lors de l\'utilisation du code');
    } finally {
      setCodeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  const POSITION_PERIODS = [
    { value: 'all', label: 'Tout' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
  ];
  const now = Date.now();
  const periodMs = { today: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000, month: 30 * 24 * 60 * 60 * 1000 };
  const filteredPositions = positionFilter === 'all'
    ? positions
    : positions.filter(p => now - new Date(p.openedAt).getTime() <= periodMs[positionFilter]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Trading</h1>
      </div>

      {user.kycStatus !== 'verified' && (
        <div className="mb-8 p-6 bg-yellow-900/10 border border-yellow-800/40 rounded">
          <h3 className="font-bold text-yellow-400 mb-2">Vérification KYC requise</h3>
          <p className="text-yellow-200/70 mb-4">Vous devez compléter votre vérification d'identité avant de trader.</p>
          <button onClick={() => onNavigate?.('kyc')} className="inline-block px-6 py-2 bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-colors rounded">
            COMPLÉTER MON KYC →
          </button>
        </div>
      )}

      {/* Asset picker */}
      <div className="grid lg:grid-cols-3 gap-3 mb-6">
        {assets.map(a => (
          <button
            key={a.key}
            onClick={() => setSelectedAsset(a.key)}
            className={`p-4 border rounded-lg text-left transition-colors ${selectedAsset === a.key ? 'border-yellow-500 bg-yellow-900/10' : 'border-yellow-900/20 hover:border-yellow-700'}`}
          >
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-white text-sm">{a.name}</p>
              {a.source === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Données réelles" />}
            </div>
            <p className="text-xs text-gray-500">{a.symbol} · ${a.price.toLocaleString('fr-FR')}</p>
          </button>
        ))}
      </div>

      {/* ── Self-directed trading: BUY/SELL live on the chart ─────────────── */}
      {currentAsset && (
        <div className="mb-8 p-6 bg-[#0d0d0d] border border-yellow-900/20 rounded-lg">
          <div className="mb-4">
            <h2 className="font-black text-white">{currentAsset.name}</h2>
          </div>

          {chart ? <SimulatedChart series={chart.series} source={chart.source} /> : <div className="h-[220px]" />}

          {selfError && <div className="mt-4 p-3 bg-red-900/30 border border-red-600 text-red-400 text-sm rounded">{selfError}</div>}
          {selfSuccess && <div className="mt-4 p-3 bg-green-950/40 border border-green-800/40 text-green-300 text-sm rounded font-bold">✓ {selfSuccess}</div>}

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Montant ($)</label>
              <input
                type="number" step="0.01" min="0.01"
                value={selfAmount} onChange={e => setSelfAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none font-bold rounded"
              />
            </div>
            <div className="min-w-[110px]">
              <label className="block text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Durée</label>
              <select
                value={selfDuration} onChange={e => setSelfDuration(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-black border border-yellow-900/30 text-white focus:border-yellow-500 focus:outline-none font-bold rounded"
              >
                {settings.durationsMinutes.map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => openSelfPosition('SELL')}
              disabled={!!selfSubmitting || user.kycStatus !== 'verified'}
              className="flex-1 min-w-[110px] py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {selfSubmitting === 'SELL' ? '...' : '▼ SELL'}
            </button>
            <button
              onClick={() => openSelfPosition('BUY')}
              disabled={!!selfSubmitting || user.kycStatus !== 'verified'}
              className="flex-1 min-w-[110px] py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {selfSubmitting === 'BUY' ? '...' : '▲ BUY'}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2">
            Disponible : ${balance.toFixed(2)} — BUY gagne si le prix monte, SELL gagne si le prix baisse, à la clôture de la durée choisie.
          </p>
        </div>
      )}

      {/* ── Scenario codes: fully independent from the chart above ────────── */}
      <div className="mb-8 p-6 bg-[#0d0d0d] border border-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-black text-white">Code de scénario</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 bg-blue-900/30 border border-blue-800/40 px-2 py-0.5 rounded">
            Indépendant du graphe
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Vous avez reçu un code de l'administrateur ? Entrez-le avec un montant : le résultat appliqué sera exactement le pourcentage défini sur ce code, quel que soit le marché.
        </p>

        {codeError && <div className="mb-4 p-3 bg-red-900/30 border border-red-600 text-red-400 text-sm rounded">{codeError}</div>}
        {codeSuccess && <div className="mb-4 p-3 bg-green-950/40 border border-green-800/40 text-green-300 text-sm rounded font-bold">✓ {codeSuccess}</div>}

        <form onSubmit={redeemCode} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] text-blue-300 font-bold mb-1 uppercase tracking-wider">Code</label>
            <input
              type="text"
              value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: 5E5LPR"
              className="w-full px-3 py-2.5 bg-black border border-blue-900/30 text-white focus:border-blue-500 focus:outline-none font-bold rounded uppercase"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] text-blue-300 font-bold mb-1 uppercase tracking-wider">Montant ($)</label>
            <input
              type="number" step="0.01" min="0.01"
              value={codeAmount} onChange={e => setCodeAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 bg-black border border-blue-900/30 text-white focus:border-blue-500 focus:outline-none font-bold rounded"
            />
          </div>
          <button
            type="submit"
            disabled={codeSubmitting || user.kycStatus !== 'verified'}
            className="py-3 px-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {codeSubmitting ? 'TRAITEMENT...' : 'UTILISER LE CODE'}
          </button>
        </form>
        <p className="text-[10px] text-gray-600 mt-2">Disponible : ${balance.toFixed(2)}</p>
      </div>

      {/* ── History, shared by both mechanisms ─────────────────────────────── */}
      <div className="bg-[#0d0d0d] border border-yellow-900/20 p-6 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="text-lg font-black text-yellow-500">Mes positions</h3>
          <div className="flex flex-wrap gap-2">
            {POSITION_PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPositionFilter(value)}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${positionFilter === value ? 'bg-yellow-500 text-black' : 'bg-black/40 text-gray-400 border border-yellow-900/20 hover:border-yellow-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {filteredPositions.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-sm">
            {positions.length === 0 ? "Aucune position pour l'instant" : 'Aucune position sur cette période'}
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredPositions.map(p => <PositionRow key={p._id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
