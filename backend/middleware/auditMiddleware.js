// middleware/auditMiddleware.js
// Automatic audit logging middleware for state-changing requests
const { createAuditLogFromRequest } = require('../services/auditService');

/**
 * Middleware factory to automatically log actions
 * Use on specific routes where you want auto-logging
 * @param {string} action - The action name (e.g., 'CREATE_APPLICATION')
 * @param {string} entityType - Entity type (e.g., 'application')
 */
const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      // Only log successful mutations (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
        const entityId = body.data?.id || req.params.id || null;

        createAuditLogFromRequest(req, {
          action,
          entityType,
          entityId,
          newValues: req.body,
          description: `${action} on ${entityType} ${entityId ? '#' + entityId : ''}`,
        }).catch(() => {}); // Non-blocking
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = { auditLog };
