// services/auditService.js
// Audit trail service for tracking all system changes
const logger = require('../utils/logger');
const { getClientIP } = require('../utils/helpers');

// Lazy-load model
let AuditLog;
function getAuditLog() {
  if (!AuditLog) {
    AuditLog = require('../models').AuditLog;
  }
  return AuditLog;
}

/**
 * Create an audit log entry
 * @param {Object} params
 * @param {number} params.userId - ID of user performing the action
 * @param {string} params.userType - 'citizen'|'local_officer'|'district_admin'|'super_admin'|'system'
 * @param {string} params.action - Action name (CREATE, UPDATE, DELETE, LOGIN, APPROVE, etc.)
 * @param {string} params.entityType - Entity being modified (application, payment, family, etc.)
 * @param {number} params.entityId - ID of the entity
 * @param {Object} params.oldValues - Previous values (for updates)
 * @param {Object} params.newValues - New values
 * @param {string} params.ipAddress - Client IP address
 * @param {string} params.description - Human-readable description
 */
async function createAuditLog({
  userId = null,
  userType = 'system',
  action,
  entityType = null,
  entityId = null,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  description = null,
}) {
  try {
    const AuditLogModel = getAuditLog();

    await AuditLogModel.create({
      user_id: userId,
      user_type: userType,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      description,
    });

    // Also log to Winston audit file
    logger.info('AUDIT', {
      userId,
      userType,
      action,
      entityType,
      entityId,
      description,
    });
  } catch (error) {
    // Audit log failures should not break the main operation
    logger.error('Failed to create audit log', {
      error: error.message,
      action,
      entityType,
      entityId,
    });
  }
}

/**
 * Create audit log from Express request context
 * Convenience wrapper that extracts user info and IP from req
 */
async function createAuditLogFromRequest(req, {
  action,
  entityType,
  entityId,
  oldValues = null,
  newValues = null,
  description = null,
}) {
  const userId = req.citizen?.id || req.admin?.id || null;
  let userType = 'system';

  if (req.citizen) {
    userType = req.citizen.role || 'citizen';
  } else if (req.admin) {
    userType = req.admin.role || 'local_officer';
  }

  await createAuditLog({
    userId,
    userType,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress: getClientIP(req),
    description,
  });
}

/**
 * Log a fraud flag to audit trail
 */
async function logFraudFlags(applicationId, fraudResult, ipAddress) {
  await createAuditLog({
    userType: 'system',
    action: 'FRAUD_CHECK',
    entityType: 'application',
    entityId: applicationId,
    newValues: {
      riskScore: fraudResult.riskScore,
      flags: fraudResult.flags,
      recommendation: fraudResult.recommendation,
    },
    ipAddress,
    description: `Fraud detection completed. Risk score: ${fraudResult.riskScore}, Recommendation: ${fraudResult.recommendation}`,
  });
}

module.exports = {
  createAuditLog,
  createAuditLogFromRequest,
  logFraudFlags,
};
