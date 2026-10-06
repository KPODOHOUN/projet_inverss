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

const createInvoice = async ({ amount, orderId, ipnCallbackUrl, successUrl, cancelUrl, description }) => {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error('NOWPayments non configuré');

  const res = await fetch(`${API_BASE}/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: 'usd',
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

const verifyIpnSignature = (body, signature) => {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signature) return false;
  const payload = JSON.stringify(sortKeysDeep(body));
  const expected = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = { createInvoice, verifyIpnSignature };
