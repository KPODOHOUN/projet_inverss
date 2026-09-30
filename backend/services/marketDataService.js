// Real market data for the assets that have a free, no-key public source —
// CoinGecko for crypto, Frankfurter (ECB rates) for forex. Assets without a
// reliable free source (gold, indices) stay on the simulated generator;
// callers must label the result by `source` so the UI never claims
// simulated data is real, or vice versa.
const CACHE_TTL_PRICE = 5 * 60 * 1000;
// Self-directed trades open/settle against this shorter-lived price so a
// 1-minute contract isn't comparing the exact same cached number at both
// ends (which would make every trade a "tie" and refund the stake).
const CACHE_TTL_TRADE_PRICE = 20 * 1000;
const CACHE_TTL_HISTORY = 60 * 60 * 1000;
const cache = new Map();

const cached = async (key, ttl, fetcher) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = await fetcher();
  cache.set(key, { value, at: Date.now() });
  return value;
};

const getLiveCryptoPrice = async (coingeckoId, ttl = CACHE_TTL_PRICE) => {
  return cached(`price:cg:${coingeckoId}:${ttl}`, ttl, async () => {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
    if (!res.ok) throw new Error(`CoinGecko price fetch failed: ${res.status}`);
    const data = await res.json();
    const price = data?.[coingeckoId]?.usd;
    if (!Number.isFinite(price)) throw new Error('CoinGecko returned no price');
    return price;
  });
};

const getLiveCryptoHistory = async (coingeckoId, days) => {
  return cached(`history:cg:${coingeckoId}:${days}`, CACHE_TTL_HISTORY, async () => {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`);
    if (!res.ok) throw new Error(`CoinGecko history fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data?.prices)) throw new Error('CoinGecko returned no price history');
    return data.prices.map(([ts, value]) => ({
      date: new Date(ts).toISOString().slice(0, 10),
      value: Number(value.toFixed(2))
    }));
  });
};

const getLiveForexRate = async (from, to, ttl = CACHE_TTL_PRICE) => {
  return cached(`price:fx:${from}:${to}:${ttl}`, ttl, async () => {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    if (!res.ok) throw new Error(`Frankfurter rate fetch failed: ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.[to];
    if (!Number.isFinite(rate)) throw new Error('Frankfurter returned no rate');
    return rate;
  });
};

const getLiveForexHistory = async (from, to, days) => {
  return cached(`history:fx:${from}:${to}:${days}`, CACHE_TTL_HISTORY, async () => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 86400000);
    const fmt = (d) => d.toISOString().slice(0, 10);
    const res = await fetch(`https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=${from}&to=${to}`);
    if (!res.ok) throw new Error(`Frankfurter history fetch failed: ${res.status}`);
    const data = await res.json();
    if (!data?.rates) throw new Error('Frankfurter returned no rate history');
    return Object.entries(data.rates)
      .map(([date, rates]) => ({ date, value: Number(rates[to]?.toFixed(4)) }))
      .filter(p => Number.isFinite(p.value))
      .sort((a, b) => a.date.localeCompare(b.date));
  });
};

// Resolves an asset's current price and (if requested) chart series, using
// its live provider when configured — falling back to the simulated
// generator on any failure (network, rate limit, unknown id) so the feature
// never breaks just because a free external API had a bad moment.
const resolvePrice = async (asset) => {
  if (asset.priceSource === 'live') {
    try {
      if (asset.externalProvider === 'coingecko') {
        return { price: await getLiveCryptoPrice(asset.externalId), source: 'live' };
      }
      if (asset.externalProvider === 'frankfurter') {
        const [from, to] = asset.externalId.split(':');
        return { price: await getLiveForexRate(from, to), source: 'live' };
      }
    } catch (err) {
      console.error(`Live price fetch failed for ${asset.key}, falling back to simulation:`, err.message);
    }
  }
  return { source: 'simulated' };
};

// Same as resolvePrice, but always returns a concrete price (falling back
// to the simulated generator itself rather than leaving that to the
// caller) and uses the short trade-grade cache TTL — for opening/settling a
// self-directed position, where a stale cached number would silently
// invalidate the whole contract.
const resolveTradePrice = async (asset) => {
  const { currentSimulatedPrice } = require('../utils/simulatedChart');
  if (asset.priceSource === 'live') {
    try {
      if (asset.externalProvider === 'coingecko') {
        return { price: await getLiveCryptoPrice(asset.externalId, CACHE_TTL_TRADE_PRICE), source: 'live' };
      }
      if (asset.externalProvider === 'frankfurter') {
        const [from, to] = asset.externalId.split(':');
        return { price: await getLiveForexRate(from, to, CACHE_TTL_TRADE_PRICE), source: 'live' };
      }
    } catch (err) {
      console.error(`Live trade price fetch failed for ${asset.key}, falling back to simulation:`, err.message);
    }
  }
  return { price: currentSimulatedPrice(asset.key, asset.basePrice), source: 'simulated' };
};

const resolveHistory = async (asset, days) => {
  if (asset.priceSource === 'live') {
    try {
      if (asset.externalProvider === 'coingecko') {
        return { series: await getLiveCryptoHistory(asset.externalId, days), source: 'live' };
      }
      if (asset.externalProvider === 'frankfurter') {
        const [from, to] = asset.externalId.split(':');
        return { series: await getLiveForexHistory(from, to, days), source: 'live' };
      }
    } catch (err) {
      console.error(`Live history fetch failed for ${asset.key}, falling back to simulation:`, err.message);
    }
  }
  return { source: 'simulated' };
};

module.exports = { resolvePrice, resolveHistory, resolveTradePrice };
