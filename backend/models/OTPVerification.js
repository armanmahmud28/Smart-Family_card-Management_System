// models/OTPVerification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OTPVerification = sequelize.define('otp_verifications', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  citizen_id: {
    type: DataTypes.INTEGER,
    references: { model: 'citizens', key: 'id' },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  otp_code: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'OTP expiry time (5 minutes from creation)',
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

module.exports = OTPVerification;
