const express = require('express');
const router = express.Router();
const { getDoors, createDoor, updateDoor, deleteDoor } = require('../controllers/doorController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
const validate = require('../middlewares/validate');
const { doorSchema } = require('../validators/schemas');

router.route('/').get(getDoors).post(authorize('admin'), validate(doorSchema), createDoor);
router.route('/:id').put(authorize('admin'), validate(doorSchema), updateDoor).delete(authorize('admin'), deleteDoor);

module.exports = router;
