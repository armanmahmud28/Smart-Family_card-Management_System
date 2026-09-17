// models/AuditLog.js
// Enhanced audit log for full transparency and traceability
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('audit_logs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    comment: 'ID of the user (citizen or admin) who performed the action',
  },
  user_type: {
    type: DataTypes.ENUM('citizen', 'local_officer', 'district_admin', 'super_admin', 'system'),
    defaultValue: 'system',
    comment: 'Type of user who performed the action',
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Action performed: CREATE, UPDATE, DELETE, LOGIN, APPROVE, REJECT, etc.',
  },
  entity_type: {
    type: DataTypes.STRING(50),
    comment: 'Table/entity name: application, payment, family, citizen, etc.',
  },
  entity_id: {
    type: DataTypes.INTEGER,
    comment: 'ID of the entity being modified',
  },
  old_values: {
    type: DataTypes.JSON,
    comment: 'Previous values before change (for updates)',
  },
  new_values: {
    type: DataTypes.JSON,
    comment: 'New values after change',
  },
  ip_address: {
    type: DataTypes.STRING(45),
    comment: 'IPv4 or IPv6 address',
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'Human-readable description of the action',
  },
  action_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['entity_type', 'entity_id'] },
    { fields: ['action'] },
    { fields: ['action_time'] },
  ],
});

module.exports = AuditLog;
