const User = require('../models/User');
const TradingAsset = require('../models/TradingAsset');
const TradingCode = require('../models/TradingCode');
const TradingPosition = require('../models/TradingPosition');
const TradingConfig = require('../models/TradingConfig');
const Transaction = require('../models/Transaction');
const { success, error } = require('../utils/response');
const { generateSimulatedSeries, currentSimulatedPrice } = require('../utils/simulatedChart');
const marketData = require('../services/marketDataService');

exports.getAssets = async (req, res) => {
  try {
    const assets = await TradingAsset.find({ active: true });
    const withPrice = await Promise.all(assets.map(async (a) => {
      const resolved = await marketData.resolvePrice(a);
      return {
        key: a.key, name: a.name, category: a.category, symbol: a.symbol,
        price: resolved.price ?? currentSimulatedPrice(a.key, a.basePrice),
        source: resolved.source
      };
    }));
    success(res, { assets: withPrice });
  } catch (err) { error(res, err.message); }
};

exports.getChart = async (req, res) => {
  try {
    const asset = await TradingAsset.findOne({ key: req.params.asset, active: true });
    if (!asset) return error(res, 'Asset not found', 404);
    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));

    const resolved = await marketData.resolveHistory(asset, days);
    const series = resolved.series || generateSimulatedSeries(asset.key, asset.basePrice, days);

    success(res, { asset: asset.key, series, source: resolved.source });
  } catch (err) { error(res, err.message); }
};

exports.getSettings = async (req, res) => {
  try {
    let config = await TradingConfig.findOne();
    if (!config) config = await TradingConfig.create({});
    success(res, { payoutPercent: config.payoutPercent, durationsMinutes: config.durationsMinutes });
  } catch (err) { error(res, err.message); }
};

// ── Path 1: scenario codes ────────────────────────────────────────────────
// For users who don't want to read a chart. Entirely independent of the
// self-directed BUY/SELL flow below — no asset selection, no direction
// choice, just a code an admin handed out and an amount. The payout is
// exactly the code's defined percentage, always, regardless of anything
// the user picks (there is nothing left for them to pick).
exports.redeemCode = async (req, res) => {
  try {
    const { code: rawCode, amount } = req.body;
    const numAmount = Number(amount);
    if (!rawCode?.trim()) return error(res, 'Code requis');
    if (!Number.isFinite(numAmount) || numAmount <= 0) return error(res, 'Montant invalide');
    if (req.user.kycStatus !== 'verified') return error(res, 'Vérification KYC requise avant de trader', 403);

    const now = new Date();
    const normalizedCode = rawCode.trim().toUpperCase();

    // Peek first so we can give a precise error message (invalid vs. expired
    // vs. exhausted vs. not-yours) — none of these reads gate anything by
    // themselves, the atomic reservation just below is what actually does.
    const preview = await TradingCode.findOne({ code: normalizedCode });
    if (!preview) return error(res, 'Code invalide');
    if (preview.status !== 'active') return error(res, 'Ce code n\'est plus actif');
    if (now < preview.startDate || now > preview.endDate) return error(res, 'Ce code n\'est pas dans sa période de validité');
    if (preview.assignedUserId && String(preview.assignedUserId) !== String(req.user._id)) {
      return error(res, 'Ce code ne vous est pas destiné');
    }

    // Atomic check-and-reserve: usedCount < maxUses is evaluated and
    // incremented in the same write, so concurrent redemptions of a
    // maxUses=1 code can't all read "0 used" before any of them commits —
    // exactly the race a separate read-then-push on `redemptions` allowed.
    const reservedCode = await TradingCode.findOneAndUpdate(
      {
        _id: preview._id,
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now },
        $expr: { $lt: ['$usedCount', '$maxUses'] }
      },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!reservedCode) return error(res, 'Ce code a atteint son nombre d\'utilisations maximum');

    const asset = await TradingAsset.findOne({ key: reservedCode.asset });
    if (!asset) {
      await TradingCode.updateOne({ _id: reservedCode._id }, { $inc: { usedCount: -1 } });
      return error(res, 'Actif introuvable', 404);
    }

    // Atomic check-and-debit, same pattern as investments/withdrawals — no
    // window where two concurrent requests could both pass the balance check.
    const debited = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount } },
      { new: true }
    );
    if (!debited) {
      await TradingCode.updateOne({ _id: reservedCode._id }, { $inc: { usedCount: -1 } });
      return error(res, `Solde insuffisant. Votre solde disponible est de ${req.user.balance} USD.`);
    }

    const entryResolved = await marketData.resolvePrice(asset);
    const entryPrice = entryResolved.price ?? currentSimulatedPrice(asset.key, asset.basePrice);

    let position;
    try {
      position = await TradingPosition.create({
        userId: req.user._id,
        mode: 'code',
        asset: reservedCode.asset,
        amount: numAmount,
        code: reservedCode.code,
        entryPrice,
        variationPercent: reservedCode.variationPercent,
        status: 'open',
        closesAt: new Date(Date.now() + reservedCode.durationHours * 3600000)
      });
    } catch (createErr) {
      await User.updateOne({ _id: req.user._id }, { $inc: { balance: numAmount } });
      await TradingCode.updateOne({ _id: reservedCode._id }, { $inc: { usedCount: -1 } });
      throw createErr;
    }

    await TradingCode.updateOne(
      { _id: reservedCode._id },
      {
        $push: { redemptions: { userId: req.user._id, positionId: position._id } },
        ...(reservedCode.usedCount >= reservedCode.maxUses ? { $set: { status: 'disabled' } } : {})
      }
    );

    await Transaction.create({
      userId: req.user._id,
      type: 'trading',
      amount: -numAmount,
      status: 'completed',
      method: 'code',
      reference: `TRD-${position._id}`
    });

    success(res, { position, balance: debited.balance, message: 'Position ouverte' }, 201);
  } catch (err) { error(res, err.message); }
};

// ── Path 2: self-directed BUY/SELL on the chart ───────────────────────────
// For users who read the chart themselves. No code involved. A short-duration
// rise/fall contract, à la Deriv: pick a direction and how long, and win the
// configured payout if the real (or simulated, for assets with no live feed)
// price moved the way you called it by the time it closes.
exports.openSelfPosition = async (req, res) => {
  try {
    const { asset: assetKey, amount, type, durationMinutes } = req.body;
    const numAmount = Number(amount);
    const numDuration = Number(durationMinutes);
    if (!['BUY', 'SELL'].includes(type)) return error(res, 'Choisissez BUY ou SELL');
    if (!Number.isFinite(numAmount) || numAmount <= 0) return error(res, 'Montant invalide');
    if (req.user.kycStatus !== 'verified') return error(res, 'Vérification KYC requise avant de trader', 403);

    const asset = await TradingAsset.findOne({ key: assetKey, active: true });
    if (!asset) return error(res, 'Actif introuvable', 404);

    const config = await TradingConfig.findOne() || await TradingConfig.create({});
    if (!config.durationsMinutes.includes(numDuration)) return error(res, 'Durée invalide');

    const debited = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount } },
      { new: true }
    );
    if (!debited) return error(res, `Solde insuffisant. Votre solde disponible est de ${req.user.balance} USD.`);

    const { price: entryPrice, source: priceSource } = await marketData.resolveTradePrice(asset);

    let position;
    try {
      position = await TradingPosition.create({
        userId: req.user._id,
        mode: 'self',
        asset: assetKey,
        type,
        amount: numAmount,
        entryPrice,
        priceSource,
        payoutPercent: config.payoutPercent,
        status: 'open',
        closesAt: new Date(Date.now() + numDuration * 60000)
      });
    } catch (createErr) {
      await User.updateOne({ _id: req.user._id }, { $inc: { balance: numAmount } });
      throw createErr;
    }

    await Transaction.create({
      userId: req.user._id,
      type: 'trading',
      amount: -numAmount,
      status: 'completed',
      method: `self-${type}`,
      reference: `TRD-${position._id}`
    });

    success(res, { position, balance: debited.balance, message: 'Position ouverte' }, 201);
  } catch (err) { error(res, err.message); }
};

exports.myPositions = async (req, res) => {
  try {
    const positions = await TradingPosition.find({ userId: req.user._id }).sort({ openedAt: -1 });
    const withPreview = positions.map(p => {
      const obj = p.toObject();
      if (p.status === 'open' && p.mode === 'code') {
        // Linear preview toward the code's defined outcome — illustrative
        // only, the real result is fixed and applied at closesAt, and it's
        // the same regardless of direction (there is none, for this mode).
        const total = p.closesAt - p.openedAt;
        const elapsed = Math.min(Math.max(Date.now() - p.openedAt, 0), total);
        const fraction = total > 0 ? elapsed / total : 1;
        obj.previewResult = Number((p.amount * (p.variationPercent / 100) * fraction).toFixed(2));
      }
      // Self-directed positions show no running preview — their outcome is
      // strictly win/loss at settlement (like a Deriv rise/fall contract),
      // not a percentage that drifts smoothly toward a known target.
      return obj;
    });
    success(res, { positions: withPreview });
  } catch (err) { error(res, err.message); }
};
