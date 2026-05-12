const express = require('express');
const router = express.Router();
const { getPermissions, createPermission, updatePermission, deletePermission } = require('../controllers/permissionController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin'));
const validate = require('../middlewares/validate');
const { permissionSchema } = require('../validators/schemas');

router.route('/').get(getPermissions).post(validate(permissionSchema), createPermission);
router.route('/:id').put(validate(permissionSchema), updatePermission).delete(deletePermission);

module.exports = router;
