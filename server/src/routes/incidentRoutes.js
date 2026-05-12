const express = require('express');
const router = express.Router();
const { getIncidents, createIncident, updateIncident, deleteIncident } = require('../controllers/incidentController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('admin', 'security'));
const validate = require('../middlewares/validate');
const { incidentSchema } = require('../validators/schemas');

router.route('/').get(getIncidents).post(validate(incidentSchema), createIncident);
router.route('/:id').put(validate(incidentSchema), updateIncident).delete(authorize('admin'), deleteIncident);

module.exports = router;
