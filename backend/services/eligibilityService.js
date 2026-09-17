// services/eligibilityService.js
// Eligibility Score Calculation (Total 100 points)
// Determines whether a family qualifies for government cash support

const logger = require('../utils/logger');

/**
 * Calculate eligibility score for a family
 * @param {Object} familyData - Family information
 * @param {number} familyData.monthlyIncome - Total family monthly income
 * @param {string} familyData.headGender - Gender of family head ('male'|'female'|'other')
 * @param {number} familyData.totalMembers - Total number of family members
 * @param {boolean} familyData.hasDisabledMember - Whether family has disabled member(s)
 * @param {boolean} familyData.hasOrphanChild - Whether family has orphan child(ren)
 * @param {boolean} familyData.hasElderlyMember - Whether family has elderly member(s) (60+)
 * @param {string} familyData.upazilaPovertyLevel - Poverty level of upazila ('high'|'medium'|'low')
 * @returns {Object} { score, breakdown, recommendation }
 */
function calculateEligibilityScore(familyData) {
  let score = 0;
  const breakdown = {};

  // 1. Economic Condition (Max 40 points)
  if (familyData.monthlyIncome <= 3000) {
    breakdown.economic = 40;
    score += 40;
  } else if (familyData.monthlyIncome <= 6000) {
    breakdown.economic = 30;
    score += 30;
  } else if (familyData.monthlyIncome <= 10000) {
    breakdown.economic = 20;
    score += 20;
  } else if (familyData.monthlyIncome <= 15000) {
    breakdown.economic = 10;
    score += 10;
  } else {
    breakdown.economic = 0;
  }

  // 2. Family Head Gender (Max 20 points)
  if (familyData.headGender === 'female') {
    breakdown.headGender = 20;
    score += 20;
  } else {
    breakdown.headGender = 0;
  }

  // 3. Family Size & Dependency (Max 15 points)
  if (familyData.totalMembers >= 5) {
    breakdown.familySize = 15;
    score += 15;
  } else if (familyData.totalMembers >= 3) {
    breakdown.familySize = 10;
    score += 10;
  } else {
    breakdown.familySize = 0;
  }

  // 4. Special Conditions (Max 15 points)
  breakdown.specialConditions = 0;
  if (familyData.hasDisabledMember) {
    breakdown.specialConditions += 8;
    score += 8;
  }
  if (familyData.hasOrphanChild) {
    breakdown.specialConditions += 4;
    score += 4;
  }
  if (familyData.hasElderlyMember) {
    breakdown.specialConditions += 3;
    score += 3;
  }

  // 5. Location Based Poverty Index (Max 10 points)
  if (familyData.upazilaPovertyLevel === 'high') {
    breakdown.locationPoverty = 10;
    score += 10;
  } else if (familyData.upazilaPovertyLevel === 'medium') {
    breakdown.locationPoverty = 6;
    score += 6;
  } else {
    breakdown.locationPoverty = 0;
  }

  // Cap at 100
  const finalScore = Math.min(score, 100);

  // Determine recommendation
  let recommendation;
  if (finalScore >= 70) {
    recommendation = 'auto_approve';
  } else if (finalScore >= 50) {
    recommendation = 'manual_review';
  } else {
    recommendation = 'likely_reject';
  }

  logger.info('Eligibility score calculated', {
    familyData: {
      monthlyIncome: familyData.monthlyIncome,
      headGender: familyData.headGender,
      totalMembers: familyData.totalMembers,
    },
    score: finalScore,
    recommendation,
  });

  return {
    score: finalScore,
    breakdown,
    recommendation,
  };
}

/**
 * Build family data object from application and family member data
 * for eligibility scoring
 */
function buildFamilyDataFromApplication(application, familyMembers) {
  const financialInfo = application.financial_info || {};
  const personalInfo = application.personal_info || {};

  // Check for special conditions in family members
  let hasDisabledMember = false;
  let hasOrphanChild = false;
  let hasElderlyMember = false;

  if (familyMembers && familyMembers.length > 0) {
    for (const member of familyMembers) {
      if (member.is_disabled) hasDisabledMember = true;
      if (member.is_orphan) hasOrphanChild = true;
      const memberAge = member.citizen ? (new Date().getFullYear() - new Date(member.citizen.date_of_birth).getFullYear()) : 0;
      if (member.is_elderly || memberAge >= 60) hasElderlyMember = true;
    }
  }

  // Check eligibility info for disabled earner status
  const eligibilityInfo = application.eligibility_info || {};
  if (eligibilityInfo.disabledEarner) hasDisabledMember = true;

  return {
    monthlyIncome: parseFloat(financialInfo.monthlyIncome) || 0,
    headGender: personalInfo.gender || 'male',
    totalMembers: (familyMembers ? familyMembers.length : 0) + 1, // +1 for head
    hasDisabledMember,
    hasOrphanChild,
    hasElderlyMember,
    upazilaPovertyLevel: application.upazila_poverty_level || 'medium',
  };
}

module.exports = {
  calculateEligibilityScore,
  buildFamilyDataFromApplication,
};
