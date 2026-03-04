const express = require('express');
const router = express.Router();
const { getSprints, createSprint, updateSprint, deleteSprint } = require('../controllers/sprintController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/project/:projectId', getSprints);
router.post('/project/:projectId', createSprint);
router.route('/:id').put(updateSprint).delete(deleteSprint);

module.exports = router;
