const { Payment } = require('../models');
const paymentService = require('../services/paymentService');

// @desc    Get my payments
// @route   GET /api/payments/my
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({ where: { citizen_id: req.user.id } });
    res.status(200).json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger manual payment (admin)
// @route   POST /api/payments/trigger
exports.triggerManualPayment = async (req, res, next) => {
  try {
    const { family_card_id, amount } = req.body;
    
    // Call payment service
    const payment = await paymentService.processPayment(family_card_id, amount);
    
    res.status(200).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};
