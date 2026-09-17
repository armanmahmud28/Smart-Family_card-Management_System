const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('super_admin')); // Only super admin can view audit logs

router.get('/', getAuditLogs);

module.exports = router;
