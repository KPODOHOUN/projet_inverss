const MiningRobot = require('../models/MiningRobot');
const MiningConfig = require('../models/MiningConfig');
const { success, error } = require('../utils/response');

exports.getStatus = async (req, res) => {
  try {
    let robot = await MiningRobot.findOne({ userId: req.user._id });
    if (!robot) robot = await MiningRobot.create({ userId: req.user._id });

    const config = await MiningConfig.findOne();
    const robotConfig = config?.robots?.find(r => r.id === robot.pack);

    success(res, {
      nlxBalance: req.user.nlxBalance,
      tapsToday: robot.tapsToday,
      nlxEarnedToday: robot.nlxEarnedToday,
      activeRobot: robot.pack ? {
        pack: robot.pack,
        level: robot.level,
        daysRemaining: robot.expiresAt ? Math.max(0, Math.ceil((robot.expiresAt - new Date()) / 86400000)) : 0,
        nlxPerHour: robotConfig?.nlxPerHour || 0,
        dailyCap: robotConfig?.dailyCap || 0,
        manualTaps: robotConfig?.manualTaps || 0
      } : null
    });
  } catch (err) {
    error(res, err.message);
  }
};

exports.tap = async (req, res) => {
  try {
    let robot = await MiningRobot.findOne({ userId: req.user._id });
    if (!robot || !robot.pack) return error(res, 'Purchase a robot first');

    const config = await MiningConfig.findOne();
    const robotConfig = config?.robots?.find(r => r.id === robot.pack);
    if (robotConfig && robotConfig.manualTaps !== -1 && robot.tapsToday >= robotConfig.manualTaps) {
      return error(res, 'Daily tap limit reached');
    }

    const reward = config?.rewardPerBlock || 0.5;
    robot.tapsToday += 1;
    robot.nlxEarnedToday += reward;
    await robot.save();

    req.user.nlxBalance += reward;
    await req.user.save();

    success(res, { nlxEarned: reward, tapsToday: robot.tapsToday, nlxBalance: req.user.nlxBalance });
  } catch (err) {
    error(res, err.message);
  }
};

exports.purchaseRobot = async (req, res) => {
  try {
    const { robotId } = req.body;
    const config = await MiningConfig.findOne();
    const robotConfig = config?.robots?.find(r => r.id === robotId);
    if (!robotConfig) return error(res, 'Robot not found', 404);

    let robot = await MiningRobot.findOne({ userId: req.user._id });
    if (!robot) robot = new MiningRobot({ userId: req.user._id });

    robot.pack = robotConfig.id;
    robot.level = robotConfig.level;
    robot.activatedAt = new Date();
    robot.expiresAt = new Date(Date.now() + (robotConfig.lifetimeDays || 30) * 86400000);
    robot.tapsToday = 0;
    robot.nlxEarnedToday = 0;
    await robot.save();

    success(res, { robot, message: `${robotConfig.name} activated` });
  } catch (err) {
    error(res, err.message);
  }
};
