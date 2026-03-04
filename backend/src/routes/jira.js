const express = require('express');
const router = express.Router();
const { testConnection, getJiraProjects, connectProject, pushToJira } = require('../controllers/jiraController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/test', testConnection);
router.get('/projects', getJiraProjects);
router.post('/connect/:projectId', connectProject);
router.post('/push/:projectId', authorize('admin', 'scrum_master'), pushToJira);

module.exports = router;
