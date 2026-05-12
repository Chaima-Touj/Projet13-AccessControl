const Permission = require('../models/Permission');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getPermissions = async (req, res, next) => {
  try {
    const { userId, role, buildingId, doorId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (role) filter.role = role;
    if (buildingId) filter.buildingId = buildingId;
    if (doorId) filter.doorId = doorId;

    const permissions = await Permission.find(filter)
      .populate('userId', 'fullName email role')
      .populate('buildingId', 'name code')
      .populate('doorId', 'name code')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { permissions });
  } catch (error) {
    next(error);
  }
};

const createPermission = async (req, res, next) => {
  try {
    const permission = await Permission.create(req.body);
    const populated = await permission
      .populate([
        { path: 'userId', select: 'fullName email role' },
        { path: 'buildingId', select: 'name code' },
        { path: 'doorId', select: 'name code' }
      ]);
    return sendSuccess(res, { permission: populated }, 'Permission créée', 201);
  } catch (error) {
    next(error);
  }
};

const updatePermission = async (req, res, next) => {
  try {
    const permission = await Permission.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('userId', 'fullName email role')
      .populate('buildingId', 'name code')
      .populate('doorId', 'name code');
    if (!permission) return sendError(res, 'Permission introuvable.', 404);
    return sendSuccess(res, { permission }, 'Permission mise à jour');
  } catch (error) {
    next(error);
  }
};

const deletePermission = async (req, res, next) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission) return sendError(res, 'Permission introuvable.', 404);
    return sendSuccess(res, {}, 'Permission supprimée');
  } catch (error) {
    next(error);
  }
};

module.exports = { getPermissions, createPermission, updatePermission, deletePermission };
