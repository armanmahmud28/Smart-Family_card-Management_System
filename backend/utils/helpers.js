// utils/helpers.js
// Common utility functions
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique Family Card Number
 * Format: FC-BD-YYYY-XXXXXX (e.g., FC-BD-2026-A3F8K1)
 */
function generateFamilyCardNumber() {
  const year = new Date().getFullYear();
  const uniquePart = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
  return `FC-BD-${year}-${uniquePart}`;
}

/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Generate idempotency key for payments
 * Format: PAY-familyId-YYYY-MM
 */
function generatePaymentIdempotencyKey(familyCardId, year, month) {
  return `PAY-${familyCardId}-${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Paginate query results
 */
function getPagination(page = 1, limit = 20) {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  return {
    limit: parseInt(limit),
    offset: Math.max(offset, 0),
  };
}

/**
 * Format pagination response
 */
function getPaginationData(data, page, limit) {
  const { count: totalItems, rows: items } = data;
  const currentPage = parseInt(page) || 1;
  const totalPages = Math.ceil(totalItems / parseInt(limit));
  return { totalItems, items, totalPages, currentPage };
}

module.exports = {
  generateFamilyCardNumber,
  generateOTP,
  getClientIP,
  generatePaymentIdempotencyKey,
  getPagination,
  getPaginationData,
};
