// models/Application.js
// Enhanced application model with eligibility scoring and fraud detection fields
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('applications', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  citizen_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'citizens', key: 'id' },
  },
  family_id: {
    type: DataTypes.INTEGER,
    references: { model: 'families', key: 'id' },
  },
  application_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },

  // Personal info stored as JSON for flexibility
  personal_info: {
    type: DataTypes.JSON,
    comment: 'firstName, lastName, nid, dob, maritalStatus, applicantPhoto',
  },
  address_info: {
    type: DataTypes.JSON,
    comment: 'present and permanent address objects',
  },
  financial_info: {
    type: DataTypes.JSON,
    comment: 'paymentMethod, accountNumber, monthlyIncome',
  },
  eligibility_info: {
    type: DataTypes.JSON,
    comment: 'govtEmployee, landAmount, vehicleOwner, disabledEarner, residenceType',
  },

  // Multi-level approval status
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected'),
    defaultValue: 'submitted',
  },

  // Approval workflow tracking
  approval_level: {
    type: DataTypes.ENUM('none', 'local_officer', 'district_admin'),
    defaultValue: 'none',
    comment: 'Current approval level in workflow',
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    references: { model: 'admins', key: 'id' },
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: { model: 'admins', key: 'id' },
  },
  remarks: {
    type: DataTypes.TEXT,
  },

  // Eligibility scoring
  eligibility_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Calculated score 0-100',
  },
  eligibility_recommendation: {
    type: DataTypes.ENUM('auto_approve', 'manual_review', 'likely_reject'),
    comment: '>=70 auto_approve, 50-69 manual_review, <50 likely_reject',
  },

  // Fraud detection
  fraud_risk_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Fraud risk score 0-100',
  },
  fraud_flags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of fraud flag objects [{type, severity}]',
  },
  fraud_recommendation: {
    type: DataTypes.ENUM('approve', 'manual_review', 'reject'),
    defaultValue: 'approve',
  },

  is_duplicate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  district_id: {
    type: DataTypes.INTEGER,
    references: { model: 'districts', key: 'id' },
  },
  upazila_id: {
    type: DataTypes.INTEGER,
    references: { model: 'upazilas', key: 'id' },
  },
  submission_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Number of times this citizen has submitted applications',
  },
  submitter_ip: {
    type: DataTypes.STRING(45),
    comment: 'IP address at submission time for fraud detection',
  },

  // Documents stored as JSON (file paths)
  documents: {
    type: DataTypes.JSON,
    comment: 'Object with file paths for uploaded documents',
  },

  // Override justification (when officer overrides eligibility/fraud)
  override_justification: {
    type: DataTypes.TEXT,
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  hooks: {
    beforeUpdate: (application) => {
      application.updated_at = new Date();
    },
  },
});

module.exports = Application;
