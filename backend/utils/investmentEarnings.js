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

module.exports = { computeAccruedEarnings };
