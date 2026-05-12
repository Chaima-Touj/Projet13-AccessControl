const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';
  let errors = null;

  // Zod validation error
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Erreur de validation';
    errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `La valeur du champ '${field}' est déjà utilisée.`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join('. ');
    statusCode = 400;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Identifiant invalide: ${err.value}`;
    statusCode = 400;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  return sendError(res, message, statusCode, errors);
};

module.exports = errorHandler;
