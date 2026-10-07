const crypto = require('crypto');

const API_BASE = 'https://api.nowpayments.io/v1';

const sortKeysDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = sortKeysDeep(value[key]);
      return acc;
    }, {});
  }
  return value;
};

// Only USDT, on whichever chain the user picks — the platform never
// touches any other crypto. These are NOWPayments' own currency tickers
// for USDT per network (confirmed against their API).
const USDT_PAY_CURRENCY = {
  TRC20: 'usdttrc20',
  ERC20: 'usdterc20',
  BEP20: 'usdtbsc',
  POLYGON: 'usdtmatic',
};

const createInvoice = async ({ amount, orderId, ipnCallbackUrl, successUrl, cancelUrl, description, network }) => {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error('NOWPayments non configuré');

  const payCurrency = USDT_PAY_CURRENCY[network];
  if (!payCurrency) throw new Error('Réseau USDT invalide');

  const res = await fetch(`${API_BASE}/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: payCurrency,
      order_id: orderId,
      order_description: description,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok || !data.invoice_url) {
    throw new Error(data.message || `NOWPayments a refusé la facture (${res.status})`);
  }
  return { id: String(data.id), invoiceUrl: data.invoice_url };
};

// Payouts run through NOWPayments' separate Mass Payments API, which
// authenticates with the dashboard email+password (not the x-api-key) to get
// a short-lived JWT — confirmed against NOWPayments' own SDK source
// (github.com/NowPaymentsIO/nowpayments-mass-payments-api-js), not guessed.
const authenticate = async () => {
  const email = process.env.NOWPAYMENTS_EMAIL;
  const password = process.env.NOWPAYMENTS_PASSWORD;
  if (!email || !password) throw new Error('Identifiants NOWPayments non configurés');

  const res = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || `Authentification NOWPayments échouée (${res.status})`);
  }
  return data.token;
};

// Creates a single-withdrawal payout batch. NOWPayments may still require a
// per-payout 2FA code (see verifyPayout) before the funds actually move —
// this call alone only queues it.
const createPayout = async ({ address, network, amount }) => {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error('NOWPayments non configuré');
  const currency = USDT_PAY_CURRENCY[network];
  if (!currency) throw new Error('Réseau USDT invalide');

  const token = await authenticate();
  const res = await fetch(`${API_BASE}/payout`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ withdrawals: [{ address, currency, amount }] }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json();
  const withdrawal = data?.withdrawals?.[0];
  if (!res.ok || !withdrawal) {
    throw new Error(data.message || `NOWPayments a refusé le paiement (${res.status})`);
  }
  return { payoutId: String(data.id), withdrawalId: String(withdrawal.id), status: withdrawal.status };
};

const verifyPayout = async ({ withdrawalId, code }) => {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const token = await authenticate();
  const res = await fetch(`${API_BASE}/payout/${withdrawalId}/verify`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ verification_code: code }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    let message = `Code de vérification refusé (${res.status})`;
    try { const data = await res.json(); message = data.message || message; } catch { /* non-JSON error body */ }
    throw new Error(message);
  }
  return true;
};

const getPayoutStatus = async ({ payoutId }) => {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const token = await authenticate();
  const res = await fetch(`${API_BASE}/payout/${payoutId}`, {
    headers: { 'x-api-key': apiKey, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Impossible de récupérer le statut (${res.status})`);
  return data;
};

const verifyIpnSignature = (body, signature) => {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signature) return false;
  const payload = JSON.stringify(sortKeysDeep(body));
  const expected = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { createInvoice, verifyIpnSignature, USDT_PAY_CURRENCY, createPayout, verifyPayout, getPayoutStatus };
