const express = require('express');
const router = express.Router();
const { upload, getDocuments, uploadDocument, deleteDocument, reingestDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/project/:projectId', getDocuments);
router.post('/upload/:projectId', upload.single('document'), uploadDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/reingest', reingestDocument);

module.exports = router;
