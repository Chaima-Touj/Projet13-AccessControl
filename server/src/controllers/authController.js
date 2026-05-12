const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email et mot de passe requis.', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'Identifiants invalides.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Identifiants invalides.', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Compte suspendu. Contactez un administrateur.', 403);
    }

    const token = generateToken(user._id);

    // Set cookie (httpOnly for security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendSuccess(res, {
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        createdAt: user.createdAt
      }
    }, 'Connexion réussie');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return sendSuccess(res, { user }, 'Utilisateur récupéré');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return sendSuccess(res, {}, 'Déconnexion réussie');
};

module.exports = { login, getMe, logout };
