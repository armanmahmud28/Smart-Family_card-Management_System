// models/IncomeRecord.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IncomeRecord = sequelize.define('income_records', {
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
  income_source: {
    type: DataTypes.STRING(100),
  },
  monthly_income: {
    type: DataTypes.DECIMAL(10, 2),
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
  },
  verified_by: {
    type: DataTypes.INTEGER,
    references: { model: 'admins', key: 'id' },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

module.exports = IncomeRecord;
