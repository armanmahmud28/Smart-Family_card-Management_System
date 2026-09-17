// models/Family.js
// Family registration with auto-generated Family Card Number
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Family = sequelize.define('families', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  head_citizen_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'citizens', key: 'id' },
    comment: 'Family head citizen ID',
  },
  monthly_income: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  upazila_poverty_level: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    defaultValue: 'medium',
  },
  has_disabled_member: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  has_orphan_child: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  has_elderly_member: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  has_luxury_assets: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'For fraud detection: income vs luxury mismatch',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
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
    beforeUpdate: (family) => {
      family.updated_at = new Date();
    },
  },
});

module.exports = Family;
