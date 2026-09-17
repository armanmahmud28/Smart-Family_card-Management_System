// models/District.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const District = sequelize.define('districts', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  district_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  division_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'divisions',
      key: 'id',
    },
  },
}, {
  timestamps: false,
});

module.exports = District;
