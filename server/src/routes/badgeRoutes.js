const express = require('express');
const router = express.Router();
const { getBadges, getMyBadge, createBadge, updateBadge, blockBadge, unblockBadge, renewBadge } = require('../controllers/badgeController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

const validate = require('../middlewares/validate');
const { badgeSchema } = require('../validators/schemas');

router.get('/me', getMyBadge);
router.route('/').get(authorize('admin', 'security'), getBadges).post(authorize('admin'), validate(badgeSchema), createBadge);
router.put('/:id', authorize('admin'), validate(badgeSchema), updateBadge);
router.patch('/:id/block', authorize('admin'), blockBadge);
router.patch('/:id/unblock', authorize('admin'), unblockBadge);
router.patch('/:id/renew', authorize('admin'), renewBadge);

module.exports = router;
