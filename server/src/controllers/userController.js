const User = require('../models/User');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return sendPaginated(res, users, total, page, limit, 'Utilisateurs récupérés');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return sendError(res, 'Utilisateur introuvable.', 404);
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, department } = req.body;
    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) return sendError(res, 'Cet email est déjà utilisé.', 400);

    const user = await User.create({ fullName, email, password, role, department });
    const userObj = user.toObject();
    delete userObj.password;
    return sendSuccess(res, { user: userObj }, 'Utilisateur créé avec succès', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, role, department, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'Utilisateur introuvable.', 404);

    if (email && email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return sendError(res, 'Cet email est déjà utilisé.', 400);
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (status !== undefined) user.status = status;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return sendSuccess(res, { user: userObj }, 'Utilisateur mis à jour');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'Utilisateur introuvable.', 404);
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Vous ne pouvez pas supprimer votre propre compte.', 400);
    }
    await user.deleteOne();
    return sendSuccess(res, {}, 'Utilisateur supprimé');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status
// @route   PATCH /api/users/:id/status
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'Utilisateur introuvable.', 404);
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Vous ne pouvez pas modifier votre propre statut.', 400);
    }
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return sendSuccess(res, { user: userObj }, `Utilisateur ${user.status === 'active' ? 'activé' : 'suspendu'}`);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus };
