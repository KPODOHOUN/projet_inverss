import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// A candlestick chart, hand-drawn in SVG like the line chart it replaces.
// The backend only hands us one close value per day, so each candle's
// open is the previous point's close and the wick is derived from the
// real local move (not fabricated volatility) — candles still trace
// actual price action, just rendered the way a trading terminal expects.
function CandlestickChart({ series, source }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const width = 680, height = 260;
  const padL = 54, padR = 12, padT = 16, padB = 28;
  const plotW = width - padL - padR, plotH = height - padT - padB;

  if (!series || series.length < 2) {
    return <div className="h-[260px] flex items-center justify-center text-[#f4efe2]/35 text-sm">Pas assez de données</div>;
  }

  const candles = series.map((p, i) => {
    const open = i === 0 ? p.value : series[i - 1].value;
    const close = p.value;
    const wick = Math.abs(close - open) * 0.6 || close * 0.002;
    return { date: p.date, open, close, high: Math.max(open, close) + wick, low: Math.min(open, close) - wick };
  });

  const allVals = candles.flatMap(c => [c.high, c.low]);
  const rawMin = Math.min(...allVals), rawMax = Math.max(...allVals);
  const margin = (rawMax - rawMin) * 0.08 || rawMax * 0.02 || 1;
  const min = rawMin - margin, max = rawMax + margin;
  const range = max - min || 1;

  const n = candles.length;
  const slot = plotW / n;
  const bodyW = Math.max(2, slot * 0.6);
  const xAt = (i) => padL + slot * i + slot / 2;
  const yAt = (v) => padT + plotH - ((v - min) / range) * plotH;

  const gridLines = [0, 0.5, 1].map(f => ({ y: padT + plotH * f, value: max - range * f }));
  const dateTickIdx = [0, Math.floor((n - 1) / 2), n - 1];

  const handleMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.round((relX - padL - slot / 2) / slot);
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const last = candles[n - 1];
  const first = candles[0];
  const changePct = ((last.close - first.close) / first.close) * 100;
  const isUp = changePct >= 0;
  const shown = hover !== null ? candles[hover] : last;
  const tooltipRight = hover !== null && hover > n * 0.65;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <span className="lux-num text-3xl sm:text-4xl font-light text-[#f4efe2]">${last.close.toLocaleString('fr-FR')}</span>
        <span className={`lux-pill ${isUp ? 'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20' : 'bg-rose-400/10 text-rose-300 ring-1 ring-inset ring-rose-400/20'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
        </span>
        <span className="text-xs text-[#f4efe2]/35">sur {n} jours</span>
      </div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[260px]"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={padL} y1={g.y} x2={width - padR} y2={g.y} stroke="currentColor" className="text-gray-800" strokeWidth="1" />
              <text x={padL - 8} y={g.y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="currentColor" className="text-[#f4efe2]/50">
                ${g.value >= 1000 ? Math.round(g.value).toLocaleString('fr-FR') : g.value.toFixed(g.value < 10 ? 3 : 1)}
              </text>
            </g>
          ))}

          {dateTickIdx.map((i, k) => (
            <text key={k} x={xAt(i)} y={height - 8} textAnchor={k === 0 ? 'start' : k === dateTickIdx.length - 1 ? 'end' : 'middle'} fontSize="10" fill="currentColor" className="text-[#f4efe2]/50">
              {candles[i].date.slice(5)}
            </text>
          ))}

          {candles.map((c, i) => {
            const up = c.close >= c.open;
            const color = up ? '#22c55e' : '#ef4444';
            const x = xAt(i);
            const bodyTop = yAt(Math.max(c.open, c.close));
            const bodyBottom = yAt(Math.min(c.open, c.close));
            const bodyH = Math.max(1.5, bodyBottom - bodyTop);
            return (
              <g
                key={i}
                className="animate-fadeIn"
                style={{ animationDelay: `${Math.min(i * 10, 500)}ms`, opacity: hover !== null && hover !== i ? 0.35 : 1 }}
              >
                <line x1={x} y1={yAt(c.high)} x2={x} y2={yAt(c.low)} stroke={color} strokeWidth="1.5" />
                <rect x={x - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} rx="1" />
              </g>
            );
          })}

          {hover !== null && (
            <line x1={xAt(hover)} y1={padT} x2={xAt(hover)} y2={padT + plotH} stroke="currentColor" className="text-[#f4efe2]/35" strokeWidth="1" strokeDasharray="3,3" />
          )}
        </svg>

        {hover !== null && (
          <div
            className="absolute top-2 bg-black border border-white/10 rounded px-3 py-2 pointer-events-none shadow-lg"
            style={{
              left: `${(hover / (n - 1)) * 100}%`,
              transform: tooltipRight ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)'
            }}
          >
            <p className="text-[10px] text-[#f4efe2]/50 whitespace-nowrap">{shown.date}</p>
            <p className="text-sm font-bold text-yellow-400 whitespace-nowrap">${shown.close.toLocaleString('fr-FR')}</p>
          </div>
        )}
      </div>
      {source !== 'live' && (
        <p className="text-[10px] text-[#f4efe2]/35 mt-2 italic">
          Simulation interne — ne reflète pas un marché externe réel.
        </p>
      )}
    </div>
  );
}

const formatCountdown = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

function PositionRow({ p }) {
  const isCode = p.mode === 'code';
  const running = p.status === 'open';
  const amountShown = running ? (isCode ? p.previewResult : null) : p.resultAmount;
  const [remaining, setRemaining] = useState(() => new Date(p.closesAt) - Date.now());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining(new Date(p.closesAt) - Date.now()), 1000);
    return () => clearInterval(id);
  }, [running, p.closesAt]);

  return (
    <div className="p-3 bg-black/40 border border-white/10 rounded">
      <div className="flex justify-between items-start mb-1 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${isCode ? 'bg-blue-900/40 text-blue-300' : 'bg-purple-900/40 text-purple-300'}`}>
            {isCode ? `Code ${p.code}` : p.type}
          </span>
          <span className="text-white font-bold text-sm">{p.asset}</span>
        </div>
        <span className={`text-xs font-bold whitespace-nowrap ${running ? 'text-yellow-500' : 'text-[#f4efe2]/50'}`}>
          {running ? 'En cours' : p.outcome === 'win' ? 'Gagnée' : p.outcome === 'loss' ? 'Perdue' : 'Neutre'}
        </span>
      </div>
      <div className="flex justify-between text-xs text-[#f4efe2]/50">
        <span>${p.amount.toFixed(2)} engagés</span>
        {amountShown !== null && amountShown !== undefined ? (
          <span className={`font-bold ${amountShown >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {amountShown >= 0 ? '+' : ''}${amountShown.toFixed(2)}{running ? ' (estimé)' : ''}
          </span>
        ) : running ? (
          <span className="text-[#f4efe2]/35 italic">Résultat à la clôture</span>
        ) : null}
      </div>
      {running && remaining > 0 && (
        <p className="text-[10px] text-yellow-600 mt-1 font-mono">Clôture dans {formatCountdown(remaining)}</p>
      )}
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
    <div className="space-y-6">
      <div className="animate-cardIn mb-2">
        <p className="lux-label mb-2">Marchés</p>
        <h1 className="lux-serif text-4xl sm:text-5xl font-semibold text-[#f4efe2] leading-none">Trading</h1>
        <p className="mt-2 text-sm text-[#f4efe2]/50">Prenez position sur les grands actifs mondiaux.</p>
      </div>

      {user.kycStatus !== 'verified' && (
        <div className="lux-card-gold p-6">
          <h3 className="relative lux-serif text-2xl font-semibold text-[#f3d58a] mb-1">Vérification KYC requise</h3>
          <p className="relative text-sm text-[#f4efe2]/60 mb-4">Vous devez compléter votre vérification d'identité avant de trader.</p>
          <button onClick={() => onNavigate?.('kyc')} className="relative lux-btn-gold !px-6">
            Compléter mon KYC →
          </button>
        </div>
      )}

      {/* Asset picker */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {assets.map(a => (
          <button
            key={a.key}
            onClick={() => setSelectedAsset(a.key)}
            className={`lux-card p-4 text-left transition-all ${selectedAsset === a.key ? '!border-yellow-500/50' : 'lux-card-hover'}`}
          >
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-[#f4efe2] text-sm">{a.name}</p>
              {a.source === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Données réelles" />}
            </div>
            <p className="text-xs text-[#f4efe2]/45 mt-0.5 lux-num">{a.symbol} · ${a.price.toLocaleString('fr-FR')}</p>
          </button>
        ))}
      </div>

      {/* ── Self-directed trading: BUY/SELL live on the chart ─────────────── */}
      {currentAsset && (
        <div className="p-6 sm:p-7 lux-card">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <h2 className="lux-serif text-2xl font-semibold text-[#f4efe2]">{currentAsset.name}</h2>
            <span className="lux-pill bg-yellow-400/10 text-[#f3d58a] ring-1 ring-inset ring-yellow-400/25">
              {settings.payoutPercent}%
            </span>
          </div>

          {chart ? <CandlestickChart series={chart.series} source={chart.source} /> : <div className="h-[220px]" />}

          {selfError && <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm">{selfError}</div>}
          {selfSuccess && <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-sm">✓ {selfSuccess}</div>}

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block lux-label !text-[10px] mb-1.5">Montant ($)</label>
              <input
                type="number" step="0.01" min="0.01"
                value={selfAmount} onChange={e => setSelfAmount(e.target.value)}
                placeholder="0.00"
                className="lux-input"
              />
            </div>
            <div className="min-w-[110px]">
              <label className="block lux-label !text-[10px] mb-1.5">Durée</label>
              <select
                value={selfDuration} onChange={e => setSelfDuration(Number(e.target.value))}
                className="lux-input"
              >
                {settings.durationsMinutes.map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => openSelfPosition('SELL')}
              disabled={!!selfSubmitting || user.kycStatus !== 'verified'}
              className="flex-1 min-w-[110px] py-3 rounded-[0.65rem] font-semibold text-sm text-white bg-rose-600 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {selfSubmitting === 'SELL' ? '…' : '▼ En bas'}
            </button>
            <button
              onClick={() => openSelfPosition('BUY')}
              disabled={!!selfSubmitting || user.kycStatus !== 'verified'}
              className="flex-1 min-w-[110px] py-3 rounded-[0.65rem] font-semibold text-sm text-white bg-emerald-600 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {selfSubmitting === 'BUY' ? '…' : '▲ En haut'}
            </button>
          </div>
        </div>
      )}

      {/* ── Scenario codes: fully independent from the chart above ────────── */}
      <div className="lux-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="lux-serif text-2xl font-semibold text-[#f4efe2]">Code de scénario</h2>
        </div>
        <p className="text-xs text-[#f4efe2]/50 mb-4">
          Vous avez reçu un code de l'administrateur ? Entrez-le avec un montant : le résultat appliqué sera exactement le pourcentage défini sur ce code, quel que soit le marché.
        </p>

        {codeError && <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm">{codeError}</div>}
        {codeSuccess && <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-sm">✓ {codeSuccess}</div>}

        <form onSubmit={redeemCode} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block lux-label !text-[10px] mb-1.5">Code</label>
            <input
              type="text"
              value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: 5E5LPR"
              className="lux-input uppercase"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block lux-label !text-[10px] mb-1.5">Montant ($)</label>
            <input
              type="number" step="0.01" min="0.01"
              value={codeAmount} onChange={e => setCodeAmount(e.target.value)}
              placeholder="0.00"
              className="lux-input"
            />
          </div>
          <button
            type="submit"
            disabled={codeSubmitting || user.kycStatus !== 'verified'}
            className="lux-btn-gold !py-3 !px-8"
          >
            {codeSubmitting ? 'Traitement…' : 'Utiliser le code'}
          </button>
        </form>
        <p className="text-[10px] text-[#f4efe2]/35 mt-2">Disponible : ${balance.toFixed(2)}</p>
      </div>

      {/* ── History, shared by both mechanisms ─────────────────────────────── */}
      <div className="lux-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="lux-serif text-2xl font-semibold text-[#f4efe2]">Mes positions</h3>
          <div className="flex flex-wrap gap-2">
            {POSITION_PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPositionFilter(value)}
                className={`lux-chip ${positionFilter === value ? 'is-active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {filteredPositions.length === 0 ? (
          <p className="text-center py-8 text-[#f4efe2]/50 text-sm">
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
