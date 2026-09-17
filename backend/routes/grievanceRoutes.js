const express = require('express');
const router = express.Router();
const { submitComplaint, getMyComplaints, getAllComplaints, resolveComplaint } = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('citizen', 'family_head'), submitComplaint);
router.get('/my', authorize('citizen', 'family_head'), getMyComplaints);

router.get('/', authorize('officer', 'admin', 'super_admin'), getAllComplaints);
router.put('/:id/resolve', authorize('officer', 'admin', 'super_admin'), resolveComplaint);

module.exports = router;
