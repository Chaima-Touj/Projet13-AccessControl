const User = require('../models/User');
const Badge = require('../models/Badge');
const Building = require('../models/Building');
const Door = require('../models/Door');
const AccessLog = require('../models/AccessLog');
const Incident = require('../models/Incident');
const Permission = require('../models/Permission');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [
      totalUsers, totalBuildings, totalDoors,
      activeBadges, blockedBadges, expiredBadges,
      grantedToday, deniedToday,
      recentLogs, recentIncidents, openIncidents
    ] = await Promise.all([
      User.countDocuments(),
      Building.countDocuments(),
      Door.countDocuments(),
      Badge.countDocuments({ status: 'active' }),
      Badge.countDocuments({ status: 'blocked' }),
      Badge.countDocuments({ status: 'expired' }),
      AccessLog.countDocuments({ result: 'granted', createdAt: { $gte: todayStart, $lte: todayEnd } }),
      AccessLog.countDocuments({ result: 'denied', createdAt: { $gte: todayStart, $lte: todayEnd } }),
      AccessLog.find().populate('userId', 'fullName role').populate('doorId', 'name').populate('buildingId', 'name').sort({ createdAt: -1 }).limit(10),
      Incident.find().populate('createdBy', 'fullName').sort({ createdAt: -1 }).limit(5),
      Incident.countDocuments({ status: 'open' })
    ]);

    // Charts: last 7 days granted vs denied
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      const [granted, denied] = await Promise.all([
        AccessLog.countDocuments({ result: 'granted', createdAt: { $gte: start, $lte: end } }),
        AccessLog.countDocuments({ result: 'denied', createdAt: { $gte: start, $lte: end } })
      ]);
      last7Days.push({ date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), granted, denied });
    }

    // Top denied doors
    const topDenied = await AccessLog.aggregate([
      { $match: { result: 'denied' } },
      { $group: { _id: '$doorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'doors', localField: '_id', foreignField: '_id', as: 'door' } },
      { $unwind: '$door' },
      { $project: { name: '$door.name', code: '$door.code', count: 1 } }
    ]);

    return sendSuccess(res, {
      stats: {
        totalUsers, totalBuildings, totalDoors,
        activeBadges, blockedBadges, expiredBadges,
        grantedToday, deniedToday, openIncidents
      },
      charts: { last7Days },
      topDenied,
      recentLogs,
      recentIncidents
    }, 'Dashboard admin chargé');
  } catch (error) {
    next(error);
  }
};

// @desc    Security dashboard
// @route   GET /api/dashboard/security
// @access  Admin, Security
const getSecurityDashboard = async (req, res, next) => {
  try {
    const [
      openIncidents,
      recentDenied,
      incidents,
      totalDeniedToday
    ] = await Promise.all([
      Incident.countDocuments({ status: 'open' }),
      AccessLog.find({ result: 'denied' })
        .populate('userId', 'fullName role')
        .populate('doorId', 'name')
        .populate('buildingId', 'name')
        .sort({ createdAt: -1 }).limit(15),
      Incident.find({ status: { $in: ['open', 'investigating'] } })
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 }).limit(10),
      AccessLog.countDocuments({ result: 'denied', createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
    ]);

    // Suspicious: blocked badge used 3+ times in 10 min
    const suspicious = await AccessLog.aggregate([
      { $match: { result: 'denied', reason: 'Badge bloqué', createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } } },
      { $group: { _id: '$badgeId', count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } }
    ]);

    return sendSuccess(res, {
      stats: { openIncidents, totalDeniedToday, suspiciousCount: suspicious.length },
      recentDenied,
      incidents,
      suspicious
    }, 'Dashboard sécurité chargé');
  } catch (error) {
    next(error);
  }
};

// @desc    User/Student/Teacher dashboard
// @route   GET /api/dashboard/user
// @access  All authenticated
const getUserDashboard = async (req, res, next) => {
  try {
    const badge = await Badge.findOne({ userId: req.user._id });
    const recentLogs = await AccessLog.find({ userId: req.user._id })
      .populate('doorId', 'name code')
      .populate('buildingId', 'name code')
      .sort({ createdAt: -1 }).limit(10);

    const permissions = await Permission.find({
      status: 'active',
      $or: [{ userId: req.user._id }, { role: req.user.role }]
    }).populate('buildingId', 'name code').populate('doorId', 'name code');

    const totalAccess = await AccessLog.countDocuments({ userId: req.user._id });
    const totalGranted = await AccessLog.countDocuments({ userId: req.user._id, result: 'granted' });

    return sendSuccess(res, {
      badge,
      stats: { totalAccess, totalGranted, totalDenied: totalAccess - totalGranted },
      recentLogs,
      permissions
    }, 'Dashboard utilisateur chargé');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminDashboard, getSecurityDashboard, getUserDashboard };
