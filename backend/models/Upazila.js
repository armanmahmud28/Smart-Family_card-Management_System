// models/Upazila.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Upazila = sequelize.define('upazilas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  upazila_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  district_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'districts',
      key: 'id',
    },
  },
  // Poverty level for eligibility scoring
  poverty_level: {
    type: DataTypes.ENUM('high', 'medium', 'low'),
    defaultValue: 'medium',
  },
}, {
  timestamps: false,
});

module.exports = Upazila;
