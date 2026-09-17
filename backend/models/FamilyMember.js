// models/FamilyMember.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FamilyMember = sequelize.define('family_members', {
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
  relationship: {
    type: DataTypes.STRING(50),
  },
  monthly_income: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  nid_or_birth_cert: {
    type: DataTypes.STRING(20),
    comment: 'NID or birth certificate number',
  },
  is_disabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_orphan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_elderly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Age >= 60 auto-flagged',
  },
}, {
  timestamps: false,
});

module.exports = FamilyMember;
