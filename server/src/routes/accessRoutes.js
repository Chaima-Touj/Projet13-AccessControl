const express = require('express');
const router = express.Router();
const { simulate } = require('../controllers/accessController');
const { protect, authorize } = require('../middlewares/auth');

const validate = require('../middlewares/validate');
const { simulationSchema } = require('../validators/schemas');

router.post('/simulate', protect, authorize('admin', 'security'), validate(simulationSchema), simulate);

module.exports = router;
