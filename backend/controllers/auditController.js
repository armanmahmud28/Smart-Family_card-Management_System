const { AuditLog } = require('../models');

// @desc    Get all audit logs
// @route   GET /api/audit
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 100 // Pagination should be implemented in production
    });
    res.status(200).json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};
