const { sendError } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return sendError(res, 'Erreur de validation', 400, errors);
  }
};

module.exports = validate;
