const express = require('express');
const router = express.Router();
const {
  getStoriesByProject, getEpics, generateStories, saveGeneratedStories,
  createStory, updateStory, deleteStory,
} = require('../controllers/storyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/project/:projectId', getStoriesByProject);
router.get('/epics/:projectId', getEpics);
router.post('/generate/:projectId', authorize('admin', 'scrum_master'), generateStories);
router.post('/save/:projectId', authorize('admin', 'scrum_master'), saveGeneratedStories);
router.post('/', createStory);
router.route('/:id').put(updateStory).delete(deleteStory);

module.exports = router;
