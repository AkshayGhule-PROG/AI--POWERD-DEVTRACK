const express = require('express');
const router = express.Router();
const { connectRepo, getCommits, triggerAnalysis, handleWebhook } = require('../controllers/githubController');
const { protect } = require('../middleware/auth');

router.post('/webhook/:projectId', handleWebhook); // Public - webhook
router.use(protect);
router.post('/connect/:projectId', connectRepo);
router.get('/commits/:projectId', getCommits);
router.post('/analyze/:projectId', triggerAnalysis);

module.exports = router;
