// controllers/authController.js
// Sequelize version with Joi validation and refresh tokens
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { Citizen, Admin, OTPVerification, RefreshToken } = require('../models');
const { registerCitizenSchema, loginSchema, otpSendSchema, resetPasswordSchema } = require('../utils/validators');
const ApiError = require('../utils/logger'); // or use next(new ApiError(...))

const generateTokens = (user, role) => {
  const accessToken = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
};

// @desc    Register a new citizen
// @route   POST /api/auth/register
exports.registerCitizen = async (req, res, next) => {
  try {
    const { error } = registerCitizenSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { nid, full_name, phone, password, date_of_birth, gender, address } = req.body;

    const existingCitizen = await Citizen.findOne({ where: { phone } });
    if (existingCitizen) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const citizen = await Citizen.create({
      nid, full_name, phone, password, date_of_birth, gender, address
    });

    const { accessToken, refreshToken } = generateTokens(citizen, citizen.role);
    await RefreshToken.create({ user_id: citizen.id, user_type: 'citizen', token: refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.status(201).json({ success: true, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// @desc    Login Citizen
// @route   POST /api/auth/login
exports.loginCitizen = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { phone, password } = req.body;
    const citizen = await Citizen.findOne({ where: { phone } });
    if (!citizen || !(await bcrypt.compare(password, citizen.password))) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const { accessToken, refreshToken } = generateTokens(citizen, citizen.role);
    await RefreshToken.create({ user_id: citizen.id, user_type: 'citizen', token: refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
exports.loginAdmin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ success: false, message: 'ফোন নম্বর ও পাসওয়ার্ড দিন (Please provide phone and password)' });

    const admin = await Admin.findOne({ where: { phone } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ success: false, message: 'ভুল ফোন নম্বর অথবা পাসওয়ার্ড (Invalid phone or password)' });
    }

    if (admin.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় (Your account is inactive)' });
    }

    const { accessToken, refreshToken } = generateTokens(admin, admin.role);
    await RefreshToken.create({ user_id: admin.id, user_type: 'admin', token: refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.status(200).json({ success: true, accessToken, refreshToken, admin: { id: admin.id, full_name: admin.full_name, role: admin.role } });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token is required' });

    const tokenRecord = await RefreshToken.findOne({ where: { token } });
    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    let user;
    if (tokenRecord.user_type === 'citizen') {
      user = await Citizen.findByPk(tokenRecord.user_id);
    } else {
      user = await Admin.findByPk(tokenRecord.user_id);
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newTokens = generateTokens(user, user.role);
    await tokenRecord.update({ token: newTokens.refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.status(200).json({ success: true, accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken });
  } catch (err) {
    next(err);
  }
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { error } = otpSendSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { phone } = req.body;
    const citizen = await Citizen.findOne({ where: { phone } });
    if (!citizen) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTPVerification.create({ citizen_id: citizen.id, otp_code: otp, expires_at: new Date(Date.now() + 10 * 60000) }); // 10 min

    console.log(`OTP for ${phone} is ${otp}`);
    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { phone, otp, newPassword } = req.body;
    const citizen = await Citizen.findOne({ where: { phone } });
    if (!citizen) return res.status(404).json({ success: false, message: 'User not found' });

    const otpRecord = await OTPVerification.findOne({ where: { citizen_id: citizen.id }, order: [['created_at', 'DESC']] });
    if (!otpRecord || otpRecord.otp_code !== otp || otpRecord.expires_at < new Date() || otpRecord.is_verified) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    citizen.password = newPassword; // Will be hashed by model hook
    await citizen.save();

    otpRecord.is_verified = true;
    await otpRecord.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};
