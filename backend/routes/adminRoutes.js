const express = require('express');
const router = express.Router();
const { getApplications, updateApplicationStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('officer', 'admin', 'super_admin'));

router.get('/applications', getApplications);
router.put('/applications/:id', updateApplicationStatus);

module.exports = router;
