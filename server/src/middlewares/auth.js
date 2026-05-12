const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Non authentifié. Veuillez vous connecter.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'Utilisateur introuvable.', 401);
    }
    if (user.status === 'suspended') {
      return sendError(res, 'Compte suspendu. Contactez un administrateur.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expirée. Veuillez vous reconnecter.', 401);
    }
    return sendError(res, 'Token invalide.', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Accès refusé. Rôle '${req.user.role}' non autorisé.`, 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
