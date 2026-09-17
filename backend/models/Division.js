// models/Division.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Division = sequelize.define('divisions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  division_name: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
}, {
  timestamps: false,
});

module.exports = Division;
