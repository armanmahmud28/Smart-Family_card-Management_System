// models/Citizen.js
// Replaces old Mongoose User model — maps to citizens table + auth fields
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Citizen = sequelize.define('citizens', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nid: {
    type: DataTypes.STRING(17),
    unique: true,
    allowNull: false,
    comment: 'National ID (10, 13, or 17 digit)',
  },
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
  },
  father_name: {
    type: DataTypes.STRING(150),
  },
  mother_name: {
    type: DataTypes.STRING(150),
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    comment: 'Login phone number',
  },
  email: {
    type: DataTypes.STRING(100),
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'bcrypt hashed password',
  },
  occupation: {
    type: DataTypes.STRING(100),
  },
  marital_status: {
    type: DataTypes.ENUM('single', 'married', 'widowed'),
  },
  address: {
    type: DataTypes.TEXT,
  },
  division_id: {
    type: DataTypes.INTEGER,
    references: { model: 'divisions', key: 'id' },
  },
  district_id: {
    type: DataTypes.INTEGER,
    references: { model: 'districts', key: 'id' },
  },
  upazila_id: {
    type: DataTypes.INTEGER,
    references: { model: 'upazilas', key: 'id' },
  },
  role: {
    type: DataTypes.ENUM('citizen', 'family_head'),
    defaultValue: 'citizen',
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  has_application: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false, // We use created_at manually to match existing schema
  hooks: {
    beforeCreate: async (citizen) => {
      if (citizen.password) {
        const salt = await bcrypt.genSalt(10);
        citizen.password = await bcrypt.hash(citizen.password, salt);
      }
    },
    beforeUpdate: async (citizen) => {
      if (citizen.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        citizen.password = await bcrypt.hash(citizen.password, salt);
      }
    },
  },
});

// Instance method: Match password
Citizen.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hide password from JSON output
Citizen.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = Citizen;
