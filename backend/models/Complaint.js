// models/Complaint.js
// Grievance/complaint system for transparency
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('complaints', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  citizen_id: {
    type: DataTypes.INTEGER,
    references: { model: 'citizens', key: 'id' },
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  complaint_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'resolved'),
    defaultValue: 'pending',
  },
  response_text: {
    type: DataTypes.TEXT,
    comment: 'Admin response to the complaint',
  },
  resolved_by: {
    type: DataTypes.INTEGER,
    references: { model: 'admins', key: 'id' },
  },
  resolved_at: {
    type: DataTypes.DATE,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

module.exports = Complaint;
