const Badge = require('../models/Badge');
const User = require('../models/User');
const generateBadgeId = require('../utils/generateBadgeId');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Admin, Security
const getBadges = async (req, res, next) => {
  try {
    const { status, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const badges = await Badge.find(filter)
      .populate('userId', 'fullName email role department')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { badges }, 'Badges récupérés');
  } catch (error) {
    next(error);
  }
};

// @desc    Get badge for a specific user
// @route   GET /api/badges/me
// @access  All authenticated
const getMyBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findOne({ userId: req.user._id })
      .populate('userId', 'fullName email role');
    if (!badge) return sendError(res, 'Aucun badge associé à votre compte.', 404);
    return sendSuccess(res, { badge });
  } catch (error) {
    next(error);
  }
};

// @desc    Create badge
// @route   POST /api/badges
// @access  Admin
const createBadge = async (req, res, next) => {
  try {
    const { userId, expiresAt } = req.body;

    const user = await User.findById(userId);
    if (!user) return sendError(res, 'Utilisateur introuvable.', 404);

    const existing = await Badge.findOne({ userId });
    if (existing) return sendError(res, 'Cet utilisateur a déjà un badge.', 400);

    const badge = await Badge.create({
      badgeId: generateBadgeId(),
      userId,
      expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    const populated = await badge.populate('userId', 'fullName email role');
    return sendSuccess(res, { badge: populated }, 'Badge créé avec succès', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update badge
// @route   PUT /api/badges/:id
// @access  Admin
const updateBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('userId', 'fullName email role');
    if (!badge) return sendError(res, 'Badge introuvable.', 404);
    return sendSuccess(res, { badge }, 'Badge mis à jour');
  } catch (error) {
    next(error);
  }
};

// @desc    Block badge
// @route   PATCH /api/badges/:id/block
// @access  Admin
const blockBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) return sendError(res, 'Badge introuvable.', 404);
    badge.status = 'blocked';
    await badge.save();
    return sendSuccess(res, { badge }, 'Badge bloqué');
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock badge
// @route   PATCH /api/badges/:id/unblock
// @access  Admin
const unblockBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) return sendError(res, 'Badge introuvable.', 404);
    if (new Date(badge.expiresAt) < new Date()) {
      return sendError(res, 'Le badge est expiré. Veuillez le renouveler.', 400);
    }
    badge.status = 'active';
    await badge.save();
    return sendSuccess(res, { badge }, 'Badge débloqué');
  } catch (error) {
    next(error);
  }
};

// @desc    Renew badge
// @route   PATCH /api/badges/:id/renew
// @access  Admin
const renewBadge = async (req, res, next) => {
  try {
    const { expiresAt } = req.body;
    const badge = await Badge.findById(req.params.id);
    if (!badge) return sendError(res, 'Badge introuvable.', 404);

    badge.expiresAt = expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    badge.status = 'active';
    badge.issuedAt = new Date();
    await badge.save();
    return sendSuccess(res, { badge }, 'Badge renouvelé');
  } catch (error) {
    next(error);
  }
};

module.exports = { getBadges, getMyBadge, createBadge, updateBadge, blockBadge, unblockBadge, renewBadge };
