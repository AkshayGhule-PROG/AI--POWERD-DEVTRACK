const express = require('express');
const router = express.Router();
const { getDashboard, getOverview } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/overview', getOverview);
router.get('/:projectId', getDashboard);

module.exports = router;
