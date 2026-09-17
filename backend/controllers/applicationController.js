const { Application, Citizen, District, Upazila } = require('../models');
const eligibilityService = require('../services/eligibilityService');
const fraudDetectionService = require('../services/fraudDetectionService');

// @desc    Submit a new application
// @route   POST /api/applications
exports.submitApplication = async (req, res, next) => {
  try {
    const { 
      first_name,
      last_name,
      father_name,
      mother_name,
      nid_number,
      dob,
      ward_no,
      present_address,
      permanent_address,
      payment_method,
      account_number,
      monthly_income, 
      occupation, 
      housing_type, 
      has_land, 
      dependents, 
      is_disabled, 
      is_orphan, 
      is_elderly,
      govt_employee,
      vehicle_owner,
      district_id, 
      upazila_id 
    } = req.body;
    const citizen_id = req.user.id;

    // Check if citizen already has an application
    const existing = await Application.findOne({ where: { citizen_id, status: ['submitted', 'under_review', 'approved'] } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an active application' });
    }

    const citizen = await Citizen.findByPk(citizen_id);
    const upazila = await Upazila.findByPk(upazila_id);

    // Calculate Eligibility Score
    const eligibilityScore = eligibilityService.calculateEligibilityScore({
      monthlyIncome: parseFloat(monthly_income) || 0,
      headGender: citizen ? citizen.gender : 'male',
      totalMembers: parseInt(dependents || 0) + 1,
      hasDisabledMember: is_disabled,
      hasOrphanChild: is_orphan,
      hasElderlyMember: is_elderly,
      upazilaPovertyLevel: upazila ? upazila.poverty_level : 'medium'
    });

    // Fraud Detection check
    const fraudRisk = await fraudDetectionService.detectFraud({
      citizen_id, phone: citizen.phone, nid: citizen.nid_number, district_id, upazila_id
    }, monthly_income);

    let status = 'submitted';
    if (fraudRisk.score > 70) status = 'rejected';
    else if (eligibilityScore.score >= 70 && fraudRisk.score <= 40) status = 'approved';

    const application = await Application.create({
      citizen_id,
      district_id,
      upazila_id,
      personal_info: {
        firstName: first_name,
        lastName: last_name,
        fatherName: father_name,
        motherName: mother_name,
        nid: nid_number,
        dob: dob
      },
      address_info: {
        wardNo: ward_no,
        presentAddress: present_address,
        permanentAddress: permanent_address
      },
      financial_info: {
        paymentMethod: payment_method,
        accountNumber: account_number,
        monthlyIncome: monthly_income,
        occupation: occupation
      },
      eligibility_info: {
        govtEmployee: govt_employee,
        vehicleOwner: vehicle_owner,
        residenceType: housing_type,
        hasLand: has_land,
        dependents: dependents,
        isDisabled: is_disabled,
        isOrphan: is_orphan,
        isElderly: is_elderly
      },
      eligibility_score: eligibilityScore.score,
      fraud_risk_score: fraudRisk.score,
      fraud_flags: fraudRisk.flags,
      status
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current citizen's applications
// @route   GET /api/applications/my
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { citizen_id: req.user.id },
      include: [
        { model: District, as: 'District', attributes: ['district_name'] },
        { model: Upazila, as: 'Upazila', attributes: ['upazila_name'] }
      ]
    });

    // Also fetch family card if exists
    const FamilyCard = require('../models/FamilyCard');
    const familyCard = await FamilyCard.findOne({ where: { citizen_id: req.user.id } });

    // Fetch citizen profile
    const citizen = await Citizen.findByPk(req.user.id, {
      attributes: ['id', 'full_name', 'nid', 'phone', 'gender', 'date_of_birth', 'address']
    });

    res.status(200).json({ success: true, applications, familyCard, citizen });
  } catch (err) {
    next(err);
  }
};
