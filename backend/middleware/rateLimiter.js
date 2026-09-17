// middleware/rateLimiter.js
// Rate limiting configuration for API protection
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'অনেক বেশি অনুরোধ। ১৫ মিনিট পর আবার চেষ্টা করুন (Too many requests. Try again after 15 minutes)',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: {
    success: false,
    message: 'অনেক বেশি লগইন প্রচেষ্টা। ১৫ মিনিট পর আবার চেষ্টা করুন (Too many login attempts)',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per 5 minutes
  message: {
    success: false,
    message: 'OTP সীমা অতিক্রম করেছে। ৫ মিনিট পর আবার চেষ্টা করুন (OTP limit exceeded)',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Application submission rate limiter
const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour
  message: {
    success: false,
    message: 'আবেদন সীমা অতিক্রম করেছে (Application submission limit exceeded)',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  applicationLimiter,
};
