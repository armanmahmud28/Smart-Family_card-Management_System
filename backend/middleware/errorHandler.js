// middleware/errorHandler.js
// Centralized error handling middleware with Winston logging
const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `রুট পাওয়া যায়নি: ${req.originalUrl} (Route not found)`);
  next(error);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'সার্ভারে সমস্যা হয়েছে (Server Error)';

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'এই ডেটা ইতিমধ্যে বিদ্যমান (Duplicate entry)';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'অবৈধ টোকেন (Invalid token)';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'টোকেনের মেয়াদ শেষ হয়েছে (Token expired)';
  }

  // Joi validation error
  if (err.isJoi) {
    statusCode = 400;
    message = err.details.map(d => d.message).join(', ');
  }

  // Log the error
  logger.error(message, {
    statusCode,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { ApiError, notFound, errorHandler };
