const cron = require('node-cron');
const { FamilyCard, Payment, sequelize } = require('../models');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Job runs at 00:00 on the 1st of every month
const monthlyPaymentJob = cron.schedule('0 0 1 * *', async () => {
  logger.info('Starting monthly payment generation job...');
  const t = await sequelize.transaction();

  try {
    const activeCards = await FamilyCard.findAll({ where: { status: 'active' }, transaction: t });
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    let count = 0;
    for (const card of activeCards) {
      // Check if payment already exists for this month (idempotency check by query)
      const existingPayment = await Payment.findOne({
        where: {
          family_card_id: card.id,
          payment_month: currentMonth,
          payment_year: currentYear
        },
        transaction: t
      });

      if (!existingPayment) {
        await Payment.create({
          citizen_id: card.citizen_id,
          family_card_id: card.id,
          amount: 500.00, // Monthly allowance amount
          status: 'pending',
          payment_month: currentMonth,
          payment_year: currentYear,
          idempotency_key: uuidv4() // Idempotency key for gateway
        }, { transaction: t });
        count++;
      }
    }

    await t.commit();
    logger.info(`Monthly payment generation job completed successfully. Generated ${count} payments.`);
  } catch (error) {
    await t.rollback();
    logger.error('Monthly payment generation job failed:', error);
  }
});

module.exports = monthlyPaymentJob;
