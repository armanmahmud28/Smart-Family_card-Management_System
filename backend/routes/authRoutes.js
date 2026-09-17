const express = require('express');
const router = express.Router();
const {
  registerCitizen,
  loginCitizen,
  loginAdmin,
  refreshToken,
  sendOTP,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerCitizen);
router.post('/login', rateLimiter.authLimiter, loginCitizen);
router.post('/admin/login', rateLimiter.authLimiter, loginAdmin);
router.post('/refresh', refreshToken);
router.post('/send-otp', rateLimiter.otpLimiter, sendOTP);
router.post('/reset-password', rateLimiter.authLimiter, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
