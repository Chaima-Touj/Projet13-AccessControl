const express = require('express');
const router = express.Router();
const { getAdminDashboard, getSecurityDashboard, getUserDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/security', protect, authorize('admin', 'security'), getSecurityDashboard);
router.get('/user', protect, getUserDashboard);

module.exports = router;
