// models/Payment.js
// Payment model with idempotency and status tracking
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('payments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  citizen_id: {
    type: DataTypes.INTEGER,
    references: { model: 'citizens', key: 'id' },
  },
  family_id: {
    type: DataTypes.INTEGER,
    references: { model: 'families', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('bkash', 'nagad', 'bank'),
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    comment: 'Transaction ID from bKash/Nagad/Bank',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  payment_month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Month number (1-12)',
  },
  payment_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  idempotency_key: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    comment: 'PAY-familyId-YYYY-MM to prevent duplicate payments',
  },
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  processed_at: {
    type: DataTypes.DATE,
    comment: 'When the payment was actually processed',
  },
  failure_reason: {
    type: DataTypes.STRING(255),
    comment: 'Reason if payment failed',
  },
}, {
  timestamps: false,
});

module.exports = Payment;
