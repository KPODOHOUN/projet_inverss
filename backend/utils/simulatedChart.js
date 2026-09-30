// Deterministic pseudo-random walk for the "illustrative" per-asset chart —
// seeded by asset key + calendar day so the same asset shows the same
// history on every request today (not a fresh random line per page load),
// without needing to store a real price feed anywhere. This is explicitly
// a simulation aid, never presented as real market data — callers must
// label it as such.
const mulberry32 = (seed) => {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
};

// `days` points ending today, each within ±volatility of the previous one,
// gently mean-reverting toward basePrice so it doesn't wander off to zero
// or infinity over a long window.
const generateSimulatedSeries = (assetKey, basePrice, days = 30, volatility = 0.02) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const seed = hashString(`${assetKey}:${today.toISOString().slice(0, 10)}`);
  const rand = mulberry32(seed);

  const points = [];
  let price = basePrice;
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000);
    const meanReversion = (basePrice - price) * 0.05;
    const noise = (rand() - 0.5) * 2 * volatility * basePrice;
    price = Math.max(basePrice * 0.3, price + meanReversion + noise);
    points.push({ date: date.toISOString().slice(0, 10), value: Number(price.toFixed(2)) });
  }
  return points;
};

// The "current" simulated price is just the series' last point — kept
// separate so callers needing only the latest value don't regenerate 30
// points for nothing.
const currentSimulatedPrice = (assetKey, basePrice) => {
  const series = generateSimulatedSeries(assetKey, basePrice, 1);
  return series[series.length - 1].value;
};

module.exports = { generateSimulatedSeries, currentSimulatedPrice };
