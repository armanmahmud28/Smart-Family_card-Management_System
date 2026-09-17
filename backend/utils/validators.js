// utils/validators.js
// Joi validation schemas for all request inputs
const Joi = require('joi');

// ==================== Auth Validators ====================

const registerSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^01[3-9]\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'সঠিক ফোন নম্বর দিন (Valid Bangladeshi phone required)',
      'any.required': 'ফোন নম্বর আবশ্যক (Phone number is required)',
    }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে (Password must be at least 6 characters)',
    'any.required': 'পাসওয়ার্ড আবশ্যক (Password is required)',
  }),
  full_name: Joi.string().max(150).required().messages({
    'any.required': 'পূর্ণ নাম আবশ্যক (Full name is required)',
  }),
  nid: Joi.string()
    .pattern(/^\d{10}$|^\d{13}$|^\d{17}$/)
    .required()
    .messages({
      'string.pattern.base': 'সঠিক NID নম্বর দিন (10, 13, or 17 digit NID required)',
      'any.required': 'NID আবশ্যক (NID is required)',
    }),
  date_of_birth: Joi.date().required().messages({
    'any.required': 'জন্ম তারিখ আবশ্যক (Date of birth is required)',
  }),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  address: Joi.string().allow(''),
});

const loginSchema = Joi.object({
  phone: Joi.string().required().messages({
    'any.required': 'ফোন নম্বর আবশ্যক (Phone is required)',
  }),
  password: Joi.string().required().messages({
    'any.required': 'পাসওয়ার্ড আবশ্যক (Password is required)',
  }),
});

const adminLoginSchema = Joi.object({
  phone: Joi.string().required().messages({
    'any.required': 'ফোন নম্বর আবশ্যক (Phone is required)',
  }),
  password: Joi.string().required().messages({
    'any.required': 'পাসওয়ার্ড আবশ্যক (Password is required)',
  }),
});

const sendOTPSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^01[3-9]\d{8}$/)
    .required(),
});

const resetPasswordSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// ==================== Application Validators ====================

const applicationSchema = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().max(100).required(),
    lastName: Joi.string().max(100).required(),
    nid: Joi.string()
      .pattern(/^\d{10}$|^\d{13}$|^\d{17}$/)
      .required(),
    dob: Joi.date().required(),
    maritalStatus: Joi.string().valid('single', 'married', 'widowed').required(),
  }).required(),
  addressInfo: Joi.object({
    present: Joi.object({
      houseNo: Joi.string().allow(''),
      roadNo: Joi.string().allow(''),
      villageArea: Joi.string().required(),
      unionWard: Joi.string().required(),
      upazila_id: Joi.number().required(),
      district_id: Joi.number().required(),
      division_id: Joi.number().required(),
      postCode: Joi.string().allow(''),
    }).required(),
    permanent: Joi.object({
      houseNo: Joi.string().allow(''),
      roadNo: Joi.string().allow(''),
      villageArea: Joi.string().allow(''),
      unionWard: Joi.string().allow(''),
      upazila_id: Joi.number().allow(null),
      district_id: Joi.number().allow(null),
      division_id: Joi.number().allow(null),
      postCode: Joi.string().allow(''),
    }),
  }).required(),
  financialInfo: Joi.object({
    paymentMethod: Joi.string().valid('bkash', 'nagad', 'bank').required(),
    accountNumber: Joi.string().required(),
    monthlyIncome: Joi.number().min(0).required(),
  }).required(),
  eligibility: Joi.object({
    govtEmployee: Joi.boolean().default(false),
    landAmount: Joi.number().min(0).default(0),
    vehicleOwner: Joi.boolean().default(false),
    disabledEarner: Joi.boolean().default(false),
    residenceType: Joi.string().valid('own', 'rent', 'government', 'homeless').default('rent'),
  }).required(),
  familyMembers: Joi.array()
    .items(
      Joi.object({
        citizen_id: Joi.number().integer().required(),
        nidOrBirthCert: Joi.string().allow(''),
        relation: Joi.string().required(),
        is_disabled: Joi.boolean().default(false),
        is_orphan: Joi.boolean().default(false),
        is_elderly: Joi.boolean().default(false),
      })
    )
    .min(1)
    .required(),
});

// ==================== Family Validators ====================

const familyRegistrationSchema = Joi.object({
  monthly_income: Joi.number().min(0).required(),
  upazila_poverty_level: Joi.string().valid('high', 'medium', 'low').default('medium'),
  members: Joi.array()
    .items(
      Joi.object({
        citizen_id: Joi.number().integer().required(),
        relationship: Joi.string().required(),
        monthly_income: Joi.number().min(0).default(0),
        is_disabled: Joi.boolean().default(false),
        is_orphan: Joi.boolean().default(false),
        is_elderly: Joi.boolean().default(false),
      })
    )
    .min(1),
});

// ==================== Admin Validators ====================

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid('submitted', 'under_review', 'approved', 'rejected')
    .required(),
  remarks: Joi.string().max(1000).allow(''),
  justification: Joi.string().max(1000).allow(''), // Required when overriding fraud/eligibility
});

// ==================== Grievance Validators ====================

const grievanceSchema = Joi.object({
  subject: Joi.string().max(200).required().messages({
    'any.required': 'বিষয় আবশ্যক (Subject is required)',
  }),
  complaint_text: Joi.string().max(5000).required().messages({
    'any.required': 'অভিযোগের বিবরণ আবশ্যক (Complaint text is required)',
  }),
});

const grievanceResponseSchema = Joi.object({
  response_text: Joi.string().max(5000).required(),
  status: Joi.string().valid('pending', 'resolved').required(),
});

module.exports = {
  registerCitizenSchema: registerSchema,
  loginSchema,
  adminLoginSchema,
  sendOTPSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  applicationSchema,
  familyRegistrationSchema,
  updateApplicationStatusSchema,
  grievanceSchema,
  grievanceResponseSchema,
};
