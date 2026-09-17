const { Complaint } = require('../models');

// @desc    Submit complaint
// @route   POST /api/grievances
exports.submitComplaint = async (req, res, next) => {
  try {
    const { subject, description, category } = req.body;
    const complaint = await Complaint.create({
      citizen_id: req.user.id,
      subject,
      description,
      category,
      status: 'pending'
    });
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my complaints
// @route   GET /api/grievances/my
exports.getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.findAll({ where: { citizen_id: req.user.id } });
    res.status(200).json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all complaints (admin)
// @route   GET /api/grievances
exports.getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.findAll();
    res.status(200).json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve complaint (admin)
// @route   PUT /api/grievances/:id/resolve
exports.resolveComplaint = async (req, res, next) => {
  try {
    const { response_text } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = 'resolved';
    complaint.response_text = response_text;
    complaint.resolved_by = req.user.id;
    complaint.resolved_at = new Date();

    await complaint.save();
    res.status(200).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};
