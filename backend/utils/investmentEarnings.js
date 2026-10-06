// Daily rate depends on the amount invested. Amounts outside these bands
// are refused rather than given a guessed rate.
const DAILY_RATE_TIERS = [
  { min: 25, max: 500, dailyPercent: 0.25 },
  { min: 1000, max: 2000, dailyPercent: 0.5 },
  { min: 3000, max: 10000, dailyPercent: 1 },
];

const dailyRateFor = (amount) => {
  const tier = DAILY_RATE_TIERS.find(t => amount >= t.min && amount <= t.max);
  return tier ? tier.dailyPercent : null;
};

// Total ROI over a term, so it can be stored on the investment exactly like
// the old per-pack ROI was — the rest of the earnings maths is unchanged.
const totalRoiFor = (amount, days) => {
  const rate = dailyRateFor(amount);
  return rate === null ? null : Number((rate * days).toFixed(4));
};

// Earnings accrue linearly from startDate to endDate; the maturity cron job
// (services/investmentMaturity.js) finalizes the real balance credit once an
// investment matures — this is just for live progress display in the
// meantime, computed on read rather than written on every request.
const computeAccruedEarnings = (investment) => {
  if (investment.status !== 'active' || !investment.endDate) return investment.earnings;
  const total = investment.startDate ? investment.endDate - investment.startDate : 0;
  if (total <= 0) return investment.earnings;
  const elapsed = Math.min(Math.max(Date.now() - investment.startDate, 0), total);
  const fraction = elapsed / total;
  return Number((investment.amount * (investment.roi / 100) * fraction).toFixed(2));
};

module.exports = { computeAccruedEarnings, dailyRateFor, totalRoiFor, DAILY_RATE_TIERS };
