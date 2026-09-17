// models/FamilyCard.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FamilyCard = sequelize.define('family_cards', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  card_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  citizen_id: {
    type: DataTypes.INTEGER,
    references: { model: 'citizens', key: 'id' },
  },
  family_id: {
    type: DataTypes.INTEGER,
    references: { model: 'families', key: 'id' },
  },
  issue_date: {
    type: DataTypes.DATEONLY,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'suspended'),
    defaultValue: 'active',
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: { model: 'admins', key: 'id' },
  },
}, {
  timestamps: false,
});

module.exports = FamilyCard;
