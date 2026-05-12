const { simulateAccess, detectSuspiciousActivity } = require('../services/accessService');
const AccessLog = require('../models/AccessLog');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Simulate badge access
// @route   POST /api/access/simulate
// @access  Admin, Security
const simulate = async (req, res, next) => {
  try {
    const { badgeId, doorId } = req.body;

    const decision = await simulateAccess({ badgeId, doorId });

    if (decision.door && decision.building) {
      await AccessLog.create({
        userId: decision.user?._id || null,
        badgeId,
        buildingId: decision.building._id,
        doorId: decision.door._id,
        result: decision.result,
        reason: decision.reason,
        simulatedBy: req.user._id,
        ipAddress: req.ip
      });
    }

    let suspicious = false;
    if (decision.reason === 'Badge bloque') {
      suspicious = await detectSuspiciousActivity(badgeId);
    }

    return sendSuccess(res, {
      result: decision.result,
      reason: decision.reason,
      suspicious,
      badge: decision.badge ? {
        badgeId: decision.badge.badgeId,
        status: decision.badge.status,
        expiresAt: decision.badge.expiresAt
      } : null,
      user: decision.user ? {
        fullName: decision.user.fullName,
        role: decision.user.role,
        status: decision.user.status
      } : null,
      door: decision.door ? {
        _id: decision.door._id,
        name: decision.door.name,
        code: decision.door.code,
        securityLevel: decision.door.securityLevel
      } : null,
      building: decision.building ? {
        _id: decision.building._id,
        name: decision.building.name,
        code: decision.building.code
      } : null
    }, decision.result === 'granted' ? 'Acces autorise' : 'Acces refuse');
  } catch (error) {
    next(error);
  }
};

module.exports = { simulate };
