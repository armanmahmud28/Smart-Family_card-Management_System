const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/', protect, authorize('citizen', 'family_head'), rateLimiter.applicationLimiter, submitApplication);
router.get('/my', protect, authorize('citizen', 'family_head'), getMyApplications);

module.exports = router;
