const { Family, FamilyMember } = require('../models');

// @desc    Register family
// @route   POST /api/family
exports.registerFamily = async (req, res, next) => {
  try {
    const { members } = req.body;
    const citizen_id = req.user.id;

    // Check if family exists
    let family = await Family.findOne({ where: { head_citizen_id: citizen_id } });
    if (!family) {
      family = await Family.create({
        head_citizen_id: citizen_id
      });
    }

    // Add members
    if (members && members.length > 0) {
      const formattedMembers = members.map(m => ({
        family_id: family.id,
        name_en: m.name_en,
        nid_birth_cert: m.nid_birth_cert,
        relation: m.relation,
        gender: m.gender,
        date_of_birth: m.date_of_birth,
        is_disabled: m.is_disabled || false,
        is_orphan: m.is_orphan || false,
        is_elderly: m.is_elderly || false
      }));
      await FamilyMember.bulkCreate(formattedMembers);
    }

    res.status(201).json({ success: true, family });
  } catch (err) {
    next(err);
  }
};

// @desc    Get family details
// @route   GET /api/family/my
exports.getMyFamily = async (req, res, next) => {
  try {
    const family = await Family.findOne({
      where: { head_citizen_id: req.user.id },
      include: [{ model: FamilyMember, as: 'members' }]
    });

    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    const familyData = family.toJSON();
    familyData.total_members = (familyData.members ? familyData.members.length : 0) + 1;

    res.status(200).json({ success: true, family: familyData });
  } catch (err) {
    next(err);
  }
};
