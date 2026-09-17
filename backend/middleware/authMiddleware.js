// middleware/authMiddleware.js
// JWT authentication and role-based authorization middleware (Sequelize version)
const jwt = require('jsonwebtoken');
const { Citizen, Admin } = require('../models');

/**
 * Protect routes — authenticate user via JWT
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.role;
    let user;

    if (['citizen', 'family_head'].includes(role)) {
      user = await Citizen.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    } else {
      user = await Admin.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.user.role = role; // Ensure role is accessible
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorize };
