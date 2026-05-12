const express = require('express');
const router = express.Router();
const { getLogs, getMyLogs, exportLogs } = require('../controllers/logController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.get('/me', getMyLogs);
router.get('/export', authorize('admin', 'security'), exportLogs);
router.get('/', authorize('admin', 'security'), getLogs);

module.exports = router;
