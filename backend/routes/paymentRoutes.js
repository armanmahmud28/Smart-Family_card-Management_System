const express = require('express');
const router = express.Router();
const { getMyPayments, getAllPayments, triggerManualPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my', authorize('citizen', 'family_head'), getMyPayments);

router.get('/', authorize('admin', 'super_admin'), getAllPayments);
router.post('/trigger', authorize('admin', 'super_admin'), triggerManualPayment);

module.exports = router;
