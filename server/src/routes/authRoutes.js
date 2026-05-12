const express = require('express');
const router = express.Router();
const { login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Trop de tentatives. Réessayez dans 15 minutes.' }
});

const validate = require('../middlewares/validate');
const { loginSchema } = require('../validators/schemas');

router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
