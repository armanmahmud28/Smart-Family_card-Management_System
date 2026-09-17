const express = require('express');
const router = express.Router();
const { registerFamily, getMyFamily } = require('../controllers/familyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('citizen', 'family_head'));

router.post('/', registerFamily);
router.get('/my', getMyFamily);

module.exports = router;
