const { Application, Citizen, FamilyCard, AuditLog } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all applications based on admin's role/location
// @route   GET /api/admin/applications
exports.getApplications = async (req, res, next) => {
  try {
    const admin = req.user;
    let whereClause = {};

    // Role-based filtering: officers see their area, admins see their district, super_admin sees all
    if (admin.role === 'officer') {
      // Officer sees applications at 'none' approval level in their upazila
      if (admin.upazila_id) whereClause.upazila_id = admin.upazila_id;
      else if (admin.district_id) whereClause.district_id = admin.district_id;
    } else if (admin.role === 'admin') {
      // District admin sees applications at 'local_officer' approval level in their district
      if (admin.district_id) whereClause.district_id = admin.district_id;
    }
    // super_admin sees ALL applications (no filter)

    const applications = await Application.findAll({
      where: whereClause,
      include: [{ model: Citizen, as: 'citizen', attributes: ['full_name', 'nid', 'phone'] }],
      order: [['created_at', 'DESC']]
    });

    // Calculate stats
    let statsWhere = {};
    if (admin.role === 'officer' && admin.upazila_id) {
      statsWhere.upazila_id = admin.upazila_id;
    } else if (admin.role === 'officer' && admin.district_id) {
      statsWhere.district_id = admin.district_id;
    } else if (admin.role === 'admin' && admin.district_id) {
      statsWhere.district_id = admin.district_id;
    }

    const allApps = await Application.findAll({ where: statsWhere, attributes: ['status'] });
    const stats = {
      total: allApps.length,
      pending: allApps.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
      approved: allApps.filter(a => a.status === 'approved').length,
      rejected: allApps.filter(a => a.status === 'rejected').length
    };

    res.status(200).json({ success: true, applications, stats });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (Multi-level workflow)
// @route   PUT /api/admin/applications/:id
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const admin = req.user;
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'আবেদন পাওয়া যায়নি (Application not found)' });
    }

    // Role-based approval workflow using ENUM string values
    if (admin.role === 'officer' && application.approval_level === 'none') {
      if (status === 'approved') {
        application.approval_level = 'local_officer';
        application.status = 'under_review';
      } else {
        application.status = 'rejected';
      }
      application.reviewed_by = admin.id;

    } else if (admin.role === 'admin' && (application.approval_level === 'none' || application.approval_level === 'local_officer')) {
      if (status === 'approved') {
        application.approval_level = 'district_admin';
        application.status = 'approved';
        application.approved_by = admin.id;

        // Auto-generate family card on final approval
        if (application.citizen_id) {
          await FamilyCard.create({
            family_id: application.family_id,
            citizen_id: application.citizen_id,
            card_number: `FC-BD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
            issue_date: new Date(),
            expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            status: 'active'
          });
        }
      } else {
        application.status = 'rejected';
      }
      application.reviewed_by = admin.id;

    } else if (admin.role === 'super_admin') {
      // Super admin can approve/reject at any level
      if (status === 'approved') {
        application.approval_level = 'district_admin';
        application.status = 'approved';
        application.approved_by = admin.id;

        if (application.citizen_id) {
          await FamilyCard.create({
            family_id: application.family_id,
            citizen_id: application.citizen_id,
            card_number: `FC-BD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
            issue_date: new Date(),
            expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
            status: 'active'
          });
        }
      } else {
        application.status = 'rejected';
      }
      application.reviewed_by = admin.id;

    } else {
      return res.status(403).json({ success: false, message: 'এই অনুমোদন স্তরে আপনার অনুমতি নেই (Not authorized for this approval level)' });
    }

    if (remarks) application.remarks = remarks;

    await application.save();
    res.status(200).json({ success: true, message: 'সফলভাবে আপডেট করা হয়েছে (Status updated)', application });
  } catch (err) {
    next(err);
  }
};

