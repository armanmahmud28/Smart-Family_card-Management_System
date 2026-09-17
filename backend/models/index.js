// models/index.js
// Central model loader with all Sequelize associations
const sequelize = require('../config/database');

// Import all models
const Division = require('./Division');
const District = require('./District');
const Upazila = require('./Upazila');
const Citizen = require('./Citizen');
const Admin = require('./Admin');
const Family = require('./Family');
const FamilyMember = require('./FamilyMember');
const Application = require('./Application');
const Payment = require('./Payment');
const AuditLog = require('./AuditLog');
const OTPVerification = require('./OTPVerification');
const Complaint = require('./Complaint');
const RefreshToken = require('./RefreshToken');
const IncomeRecord = require('./IncomeRecord');
const FamilyCard = require('./FamilyCard');

// ==================== Associations ====================

// Division → District → Upazila (location hierarchy)
Division.hasMany(District, { foreignKey: 'division_id', as: 'districts' });
District.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });

District.hasMany(Upazila, { foreignKey: 'district_id', as: 'upazilas' });
Upazila.belongsTo(District, { foreignKey: 'district_id', as: 'district' });

// Citizen → Location
Citizen.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Citizen.belongsTo(District, { foreignKey: 'district_id', as: 'district' });
Citizen.belongsTo(Upazila, { foreignKey: 'upazila_id', as: 'upazila' });

// Admin → Location (assigned jurisdiction)
Admin.belongsTo(District, { foreignKey: 'district_id', as: 'district' });
Admin.belongsTo(Upazila, { foreignKey: 'upazila_id', as: 'upazila' });

// Family → Citizen (head)
Family.belongsTo(Citizen, { foreignKey: 'head_citizen_id', as: 'head' });
Citizen.hasOne(Family, { foreignKey: 'head_citizen_id', as: 'family' });

// FamilyMember → Citizen, Family
FamilyMember.belongsTo(Citizen, { foreignKey: 'citizen_id', as: 'citizen' });
Citizen.hasMany(FamilyMember, { foreignKey: 'citizen_id', as: 'familyMemberships' });
FamilyMember.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });
Family.hasMany(FamilyMember, { foreignKey: 'family_id', as: 'members' });

// Application → Citizen, Family, Admin (reviewer/approver)
Application.belongsTo(Citizen, { foreignKey: 'citizen_id', as: 'citizen' });
Citizen.hasMany(Application, { foreignKey: 'citizen_id', as: 'applications' });
Application.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });
Application.belongsTo(Admin, { foreignKey: 'reviewed_by', as: 'reviewer' });
Application.belongsTo(Admin, { foreignKey: 'approved_by', as: 'approver' });
Application.belongsTo(District, { foreignKey: 'district_id', as: 'District' });
Application.belongsTo(Upazila, { foreignKey: 'upazila_id', as: 'Upazila' });

// Payment → Citizen, Family
Payment.belongsTo(Citizen, { foreignKey: 'citizen_id', as: 'citizen' });
Payment.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });
Citizen.hasMany(Payment, { foreignKey: 'citizen_id', as: 'payments' });
Family.hasMany(Payment, { foreignKey: 'family_id', as: 'payments' });

// Complaint → Citizen, Admin
Complaint.belongsTo(Citizen, { foreignKey: 'citizen_id', as: 'citizen' });
Complaint.belongsTo(Admin, { foreignKey: 'resolved_by', as: 'resolver' });
Citizen.hasMany(Complaint, { foreignKey: 'citizen_id', as: 'complaints' });

// IncomeRecord → Citizen, Admin
IncomeRecord.belongsTo(Citizen, { foreignKey: 'citizen_id', as: 'citizen' });
IncomeRecord.belongsTo(Admin, { foreignKey: 'verified_by', as: 'verifier' });

// FamilyCard → Citizen, Family, Admin
FamilyCard.belongsTo(Citizen, { foreignKey: 'citizen_id', as: 'citizen' });
FamilyCard.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });
FamilyCard.belongsTo(Admin, { foreignKey: 'approved_by', as: 'approver' });
Family.hasOne(FamilyCard, { foreignKey: 'family_id', as: 'card' });
Citizen.hasOne(FamilyCard, { foreignKey: 'citizen_id', as: 'familyCard' });

// OTPVerification → Citizen
OTPVerification.belongsTo(Citizen, { foreignKey: 'citizen_id', as: 'citizen' });

module.exports = {
  sequelize,
  Division,
  District,
  Upazila,
  Citizen,
  Admin,
  Family,
  FamilyMember,
  Application,
  Payment,
  AuditLog,
  OTPVerification,
  Complaint,
  RefreshToken,
  IncomeRecord,
  FamilyCard,
};
