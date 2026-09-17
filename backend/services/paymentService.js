// services/paymentService.js
// Payment generation & processing service with idempotency
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { generatePaymentIdempotencyKey } = require('../utils/helpers');
const { createAuditLog } = require('./auditService');

// Lazy-load models
let models;
function getModels() {
  if (!models) {
    models = require('../models');
  }
  return models;
}

/**
 * Generate monthly payments for all approved/active families
 * Called by cron job on 1st of every month
 * @param {number} year - Payment year
 * @param {number} month - Payment month (1-12)
 * @returns {Object} { generated, skipped, failed }
 */
async function generateMonthlyPayments(year, month) {
  const { Family, FamilyCard, Payment, Application, Citizen } = getModels();
  const amount = parseFloat(process.env.DEFAULT_PAYMENT_AMOUNT) || 1000.00;

  const results = { generated: 0, skipped: 0, failed: 0, errors: [] };

  try {
    // Find all active families with approved applications
    const activeFamilies = await Family.findAll({
      where: { status: 'active' },
      include: [
        {
          model: Citizen,
          as: 'head',
          attributes: ['id', 'phone', 'full_name'],
        },
        {
          model: FamilyCard,
          as: 'card',
        },
      ],
    });

    for (const family of activeFamilies) {
      try {
        const idempotencyKey = generatePaymentIdempotencyKey(family.id, year, month);

        // Idempotency check — skip if payment already exists for this month
        const existingPayment = await Payment.findOne({
          where: { idempotency_key: idempotencyKey },
        });

        if (existingPayment) {
          results.skipped++;
          continue;
        }

        // Check that family has an approved application
        const approvedApp = await Application.findOne({
          where: {
            family_id: family.id,
            status: 'approved',
          },
        });

        if (!approvedApp) {
          results.skipped++;
          continue;
        }

        // Get payment method from application
        const financialInfo = approvedApp.financial_info || {};

        // Create pending payment
        await Payment.create({
          citizen_id: family.head_citizen_id,
          family_id: family.id,
          amount,
          payment_method: financialInfo.paymentMethod || 'bkash',
          status: 'pending',
          payment_month: month,
          payment_year: year,
          idempotency_key: idempotencyKey,
        });

        results.generated++;

        // Audit log
        await createAuditLog({
          userType: 'system',
          action: 'GENERATE_PAYMENT',
          entityType: 'payment',
          entityId: family.id,
          newValues: { amount, month, year, familyId: family.id },
          description: `Monthly payment generated for family ${family.card?.card_number || family.id} - ${year}/${month}`,
        });
      } catch (err) {
        results.failed++;
        results.errors.push({
          familyId: family.id,
          error: err.message,
        });
        logger.error('Failed to generate payment for family', {
          familyId: family.id,
          error: err.message,
        });
      }
    }

    logger.info('Monthly payment generation completed', results);
    return results;
  } catch (error) {
    logger.error('Monthly payment generation failed', { error: error.message });
    throw error;
  }
}

/**
 * Process a pending payment (simulate bKash/Nagad transaction)
 * In production, this would call the actual payment gateway API
 */
async function processPayment(paymentId) {
  const { Payment } = getModels();

  const payment = await Payment.findByPk(paymentId);
  if (!payment) {
    throw new Error('পেমেন্ট পাওয়া যায়নি (Payment not found)');
  }

  if (payment.status !== 'pending') {
    throw new Error('শুধুমাত্র পেন্ডিং পেমেন্ট প্রসেস করা যায় (Only pending payments can be processed)');
  }

  try {
    // Simulate payment gateway call
    // In production: call bKash/Nagad API here
    const transactionId = `TXN-${payment.payment_method.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await payment.update({
      status: 'completed',
      transaction_id: transactionId,
      processed_at: new Date(),
    });

    await createAuditLog({
      userType: 'system',
      action: 'PROCESS_PAYMENT',
      entityType: 'payment',
      entityId: payment.id,
      oldValues: { status: 'pending' },
      newValues: { status: 'completed', transaction_id: transactionId },
      description: `Payment processed successfully. Transaction: ${transactionId}`,
    });

    logger.info('Payment processed', { paymentId, transactionId });
    return { success: true, transactionId };
  } catch (error) {
    await payment.update({
      status: 'failed',
      failure_reason: error.message,
    });

    logger.error('Payment processing failed', {
      paymentId,
      error: error.message,
    });

    return { success: false, error: error.message };
  }
}

/**
 * Get payment summary for a family
 */
async function getFamilyPaymentSummary(familyId) {
  const { Payment } = getModels();

  const payments = await Payment.findAll({
    where: { family_id: familyId },
    order: [['payment_year', 'DESC'], ['payment_month', 'DESC']],
  });

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;

  return {
    payments,
    totalPaid,
    pendingCount,
    failedCount,
    totalPayments: payments.length,
  };
}

module.exports = {
  generateMonthlyPayments,
  processPayment,
  getFamilyPaymentSummary,
};
