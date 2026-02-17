const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadPresentation,
  getPresentation,
  getAllPresentations,
  addActivity,
  removeActivity,
  deletePresentation,
} = require('../controllers/presentationController');

router.post('/upload', (req, res, next) => {
  upload.single('presentation')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, uploadPresentation);
router.get('/', getAllPresentations);
router.get('/:id', getPresentation);
router.post('/:id/activities', addActivity);
router.delete('/:id/activities/:activityId', removeActivity);
router.delete('/:id', deletePresentation);

module.exports = router;
