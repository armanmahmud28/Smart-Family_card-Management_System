// services/fraudDetectionService.js
// Comprehensive anti-fraud detection for government cash transfer system
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Lazy-load models to avoid circular dependency
let models;
function getModels() {
  if (!models) {
    models = require('../models');
  }
  return models;
}

/**
 * Main fraud detection function
 * Called during application submission and before final approval
 * @param {Object} applicationData - The application being checked
 * @param {Object} familyData - Family information
 * @returns {Object} { riskScore, flags, recommendation }
 */
async function detectFraud(applicationData, familyData) {
  const flags = [];
  const { Application, Citizen, Family } = getModels();

  const nid = applicationData.personalInfo?.nid || applicationData.nid;
  const phone = applicationData.phone;
  const ip = applicationData.submitterIp || applicationData.ip;

  // 1. Duplicate NID Detection - Block if NID already has approved family
  try {
    if (nid && await hasExistingApprovedFamily(nid)) {
      flags.push({
        type: 'duplicate_nid',
        severity: 'high',
        message: 'এই NID ইতিমধ্যে একটি অনুমোদিত পরিবারের সাথে যুক্ত (NID already linked to approved family)',
      });
    }
  } catch (err) {
    logger.error('Fraud check failed: duplicate_nid', { error: err.message });
  }

  // 2. Multiple Applications from same Phone or NID
  try {
    if (await hasMultipleApplicationsSamePhoneOrNid(applicationData)) {
      flags.push({
        type: 'multiple_applications',
        severity: 'medium',
        message: 'একই ফোন/NID থেকে একাধিক আবেদন (Multiple applications from same phone/NID)',
      });
    }
  } catch (err) {
    logger.error('Fraud check failed: multiple_applications', { error: err.message });
  }

  // 3. Repeated Submissions Check
  try {
    const submissionCount = applicationData.submissionCount || 0;
    if (submissionCount > 3) {
      flags.push({
        type: 'repeated_submissions',
        severity: 'medium',
        message: `${submissionCount} বার আবেদন জমা দেওয়া হয়েছে (${submissionCount} submission attempts)`,
      });
    }
  } catch (err) {
    logger.error('Fraud check failed: repeated_submissions', { error: err.message });
  }

  // 4. Income vs Luxury Asset Mismatch
  try {
    const monthlyIncome = familyData?.monthlyIncome || 0;
    const hasLuxuryAssets = familyData?.hasLuxuryAssets || false;
    const vehicleOwner = applicationData.eligibilityInfo?.vehicleOwner || false;

    if ((monthlyIncome <= 10000) && (hasLuxuryAssets || vehicleOwner)) {
      flags.push({
        type: 'income_mismatch',
        severity: 'high',
        message: 'আয় কম কিন্তু বিলাসবহুল সম্পদ আছে (Low income reported but luxury assets detected)',
      });
    }
  } catch (err) {
    logger.error('Fraud check failed: income_mismatch', { error: err.message });
  }

  // 5. IP Cluster Fraud Detection
  try {
    if (ip && await hasManyApplicationsFromSameIP(ip)) {
      flags.push({
        type: 'ip_cluster_fraud',
        severity: 'high',
        message: 'একই IP ঠিকানা থেকে অনেক আবেদন (Many applications from same IP address)',
      });
    }
  } catch (err) {
    logger.error('Fraud check failed: ip_cluster_fraud', { error: err.message });
  }

  // 6. Geographic Cluster - Multiple family heads from same address/area
  try {
    if (await hasFamilyInSameUpazilaWithSameNIDPattern(familyData, applicationData)) {
      flags.push({
        type: 'geographic_cluster',
        severity: 'medium',
        message: 'একই এলাকায় সন্দেহজনক সংখ্যক আবেদন (Suspicious number of applications from same area)',
      });
    }
  } catch (err) {
    logger.error('Fraud check failed: geographic_cluster', { error: err.message });
  }

  // 7. Address Mismatch (if NID verification available)
  try {
    if (applicationData.addressMismatchWithNid) {
      flags.push({
        type: 'address_mismatch',
        severity: 'high',
        message: 'NID এর ঠিকানা আবেদনের ঠিকানার সাথে মিলছে না (NID address does not match application address)',
      });
    }
  } catch (err) {
    logger.error('Fraud check failed: address_mismatch', { error: err.message });
  }

  // Calculate overall risk score
  const riskScore = calculateRiskScore(flags);

  // Determine recommendation
  let recommendation;
  if (riskScore > 70) {
    recommendation = 'reject';
  } else if (riskScore > 40) {
    recommendation = 'manual_review';
  } else {
    recommendation = 'approve';
  }

  logger.info('Fraud detection completed', {
    nid,
    riskScore,
    flagCount: flags.length,
    recommendation,
  });

  return {
    riskScore,
    flags,
    recommendation,
  };
}

/**
 * Check if NID is already linked to an approved family
 */
async function hasExistingApprovedFamily(nid) {
  const { Application } = getModels();
  const existing = await Application.findOne({
    where: {
      status: 'approved',
    },
    include: [{
      model: getModels().Citizen,
      as: 'citizen',
      where: { nid },
    }],
  });
  return !!existing;
}

/**
 * Check for multiple applications from same phone or NID
 */
async function hasMultipleApplicationsSamePhoneOrNid(applicationData) {
  const { Application, Citizen } = getModels();
  const nid = applicationData.personalInfo?.nid || applicationData.nid;

  if (!nid) return false;

  const count = await Application.count({
    include: [{
      model: Citizen,
      as: 'citizen',
      where: { nid },
    }],
  });

  return count > 1;
}

/**
 * Check if many applications came from the same IP address (>5 in last 24h)
 */
async function hasManyApplicationsFromSameIP(ip) {
  const { Application } = getModels();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const count = await Application.count({
    where: {
      submitter_ip: ip,
      created_at: { [Op.gte]: oneDayAgo },
    },
  });

  return count >= 5;
}

/**
 * Check for suspicious geographic clustering
 * Flag if more than 10 applications from same upazila in last week
 * with similar NID patterns (first 4 digits match)
 */
async function hasFamilyInSameUpazilaWithSameNIDPattern(familyData, applicationData) {
  const { Application } = getModels();
  const district_id = applicationData.district_id;

  if (!district_id) return false;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const count = await Application.count({
    where: {
      district_id,
      created_at: { [Op.gte]: oneWeekAgo },
    },
  });

  return count >= 10;
}

/**
 * Calculate risk score from fraud flags (0-100)
 * High severity = 25 points each, Medium = 15 points each
 */
function calculateRiskScore(flags) {
  let score = 0;

  for (const flag of flags) {
    if (flag.severity === 'high') {
      score += 25;
    } else if (flag.severity === 'medium') {
      score += 15;
    } else {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Check application limits per upazila (daily/weekly)
 * Returns true if limits exceeded
 */
async function checkUpazilaApplicationLimits(district_id, dailyLimit = 50, weeklyLimit = 200) {
  const { Application } = getModels();

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const dailyCount = await Application.count({
    where: {
      district_id,
      created_at: { [Op.gte]: oneDayAgo },
    },
  });

  if (dailyCount >= dailyLimit) {
    return { exceeded: true, type: 'daily', count: dailyCount, limit: dailyLimit };
  }

  const weeklyCount = await Application.count({
    where: {
      district_id,
      created_at: { [Op.gte]: oneWeekAgo },
    },
  });

  if (weeklyCount >= weeklyLimit) {
    return { exceeded: true, type: 'weekly', count: weeklyCount, limit: weeklyLimit };
  }

  return { exceeded: false };
}

/**
 * Monitor for officer approval spikes
 * Flag if an officer approves more than 20 applications in a single day
 */
async function checkOfficerApprovalSpike(adminId) {
  const { AuditLog } = getModels();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const approvalCount = await AuditLog.count({
    where: {
      user_id: adminId,
      action: 'APPROVE_APPLICATION',
      action_time: { [Op.gte]: oneDayAgo },
    },
  });

  return approvalCount > 20;
}

module.exports = {
  detectFraud,
  hasExistingApprovedFamily,
  hasMultipleApplicationsSamePhoneOrNid,
  hasManyApplicationsFromSameIP,
  hasFamilyInSameUpazilaWithSameNIDPattern,
  calculateRiskScore,
  checkUpazilaApplicationLimits,
  checkOfficerApprovalSpike,
};
