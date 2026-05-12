const AccessLog = require('../models/AccessLog');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

// @desc    Get all access logs (admin/security)
// @route   GET /api/logs
// @access  Admin, Security
const getLogs = async (req, res, next) => {
  try {
    const { result, buildingId, doorId, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (result) filter.result = result;
    if (buildingId) filter.buildingId = buildingId;
    if (doorId) filter.doorId = doorId;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const total = await AccessLog.countDocuments(filter);
    const logs = await AccessLog.find(filter)
      .populate('userId', 'fullName email role')
      .populate('buildingId', 'name code')
      .populate('doorId', 'name code')
      .populate('simulatedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return sendPaginated(res, logs, total, page, limit, 'Logs récupérés');
  } catch (error) {
    next(error);
  }
};

// @desc    Get personal logs
// @route   GET /api/logs/me
// @access  All authenticated
const getMyLogs = async (req, res, next) => {
  try {
    const { result, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (result) filter.result = result;

    const total = await AccessLog.countDocuments(filter);
    const logs = await AccessLog.find(filter)
      .populate('buildingId', 'name code')
      .populate('doorId', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return sendPaginated(res, logs, total, page, limit, 'Historique personnel récupéré');
  } catch (error) {
    next(error);
  }
};

// @desc    Export logs as CSV
// @route   GET /api/logs/export
// @access  Admin, Security
const exportLogs = async (req, res, next) => {
  try {
    const { startDate, endDate, result } = req.query;
    const filter = {};
    if (result) filter.result = result;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const logs = await AccessLog.find(filter)
      .populate('userId', 'fullName email role')
      .populate('buildingId', 'name code')
      .populate('doorId', 'name code')
      .sort({ createdAt: -1 })
      .limit(5000);

    const headers = ['Date', 'Utilisateur', 'Email', 'Rôle', 'Badge ID', 'Bâtiment', 'Porte', 'Résultat', 'Raison'];
    const rows = logs.map(l => [
      new Date(l.createdAt).toLocaleString('fr-FR'),
      l.userId?.fullName || 'N/A',
      l.userId?.email || 'N/A',
      l.userId?.role || 'N/A',
      l.badgeId,
      l.buildingId?.name || 'N/A',
      l.doorId?.name || 'N/A',
      l.result,
      l.reason || ''
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="access-logs-${Date.now()}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  } catch (error) {
    next(error);
  }
};

module.exports = { getLogs, getMyLogs, exportLogs };
