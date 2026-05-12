const express = require('express');
const router = express.Router();
const { getBuildings, createBuilding, updateBuilding, deleteBuilding } = require('../controllers/buildingController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
const validate = require('../middlewares/validate');
const { buildingSchema } = require('../validators/schemas');

router.route('/').get(getBuildings).post(authorize('admin'), validate(buildingSchema), createBuilding);
router.route('/:id').put(authorize('admin'), validate(buildingSchema), updateBuilding).delete(authorize('admin'), deleteBuilding);

module.exports = router;
