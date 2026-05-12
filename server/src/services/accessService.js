const Badge = require('../models/Badge');
const Door = require('../models/Door');
const Permission = require('../models/Permission');
const AccessLog = require('../models/AccessLog');

/**
 * Core access decision algorithm.
 * Priority:
 * 1. Door must exist so the building can be derived for logs
 * 2. Badge must exist and be active
 * 3. User must be active
 * 4. Door must be active
 * 5. Building must be active
 * 6. Check user-specific permission
 * 7. Check role-based permission
 * 8. Check time/day restrictions
 * 9. Deny
 */
const simulateAccess = async ({ badgeId, doorId }) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun,...6=Sat
  const currentTime = now.toTimeString().substring(0, 5); // HH:mm

  const door = await Door.findById(doorId).populate('buildingId');
  if (!door) {
    return { result: 'denied', reason: 'Porte introuvable', badge: null, user: null, door: null, building: null };
  }

  const building = door.buildingId;

  const badge = await Badge.findOne({ badgeId }).populate('userId');
  if (!badge) {
    return { result: 'denied', reason: 'Badge introuvable', badge: null, user: null, door, building };
  }

  if (badge.status === 'blocked') {
    return { result: 'denied', reason: 'Badge bloque', badge, user: badge.userId, door, building };
  }

  if (badge.status === 'expired' || new Date(badge.expiresAt) < now) {
    if (badge.status !== 'expired') {
      badge.status = 'expired';
      await badge.save();
    }
    return { result: 'denied', reason: 'Badge expire', badge, user: badge.userId, door, building };
  }

  const user = badge.userId;
  if (!user || user.status === 'suspended') {
    return { result: 'denied', reason: 'Utilisateur suspendu', badge, user, door, building };
  }

  if (door.status === 'inactive') {
    return { result: 'denied', reason: 'Porte inactive', badge, user, door, building };
  }

  if (!building || building.status === 'inactive') {
    return { result: 'denied', reason: 'Batiment inactif', badge, user, door, building };
  }

  if (user.role === 'admin') {
    return { result: 'granted', reason: 'Acces administrateur', badge, user, door, building };
  }

  const permissions = await Permission.find({
    status: 'active',
    $and: [
      { $or: [{ userId: user._id }, { role: user.role }] },
      { $or: [{ doorId: door._id }, { buildingId: building._id }] }
    ]
  });

  if (permissions.length === 0) {
    return { result: 'denied', reason: 'Aucune permission pour cette porte', badge, user, door, building };
  }

  const userPerms = permissions.filter(p => p.userId && p.userId.toString() === user._id.toString());
  const rolePerms = permissions.filter(p => p.role && p.role === user.role);
  const applicable = userPerms.length > 0 ? userPerms : rolePerms;

  for (const perm of applicable) {
    const hasDay = perm.allowedDays && perm.allowedDays.length > 0;
    const hasTime = perm.startTime && perm.endTime;

    if (hasDay && !perm.allowedDays.includes(currentDay)) {
      continue;
    }
    if (hasTime && (currentTime < perm.startTime || currentTime > perm.endTime)) {
      continue;
    }

    return { result: 'granted', reason: 'Acces autorise', badge, user, door, building };
  }

  const hasTimeRestriction = applicable.some(p => (
    (p.allowedDays && p.allowedDays.length > 0) ||
    (p.startTime && p.endTime)
  ));

  if (hasTimeRestriction) {
    return { result: 'denied', reason: 'Acces hors horaire autorise', badge, user, door, building };
  }

  return { result: 'denied', reason: 'Acces refuse', badge, user, door, building };
};

const detectSuspiciousActivity = async (badgeId) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const count = await AccessLog.countDocuments({
    badgeId,
    result: 'denied',
    reason: 'Badge bloque',
    createdAt: { $gte: tenMinutesAgo }
  });
  return count >= 3;
};

module.exports = { simulateAccess, detectSuspiciousActivity };
