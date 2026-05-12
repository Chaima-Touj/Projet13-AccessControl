const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));

const validate = require('../middlewares/validate');
const { userSchema } = require('../validators/schemas');

router.route('/').get(getUsers).post(validate(userSchema), createUser);
router.route('/:id').get(getUserById).put(validate(userSchema), updateUser).delete(deleteUser);
router.patch('/:id/status', toggleUserStatus);

module.exports = router;
