import { body, param, query, validationResult } from "express-validator";

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Validation for creating a teacher
 */
export const createTeacherValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("fatherName")
    .trim()
    .notEmpty()
    .withMessage("Father name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Father name must be between 3 and 100 characters"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("cnic")
    .trim()
    .notEmpty()
    .withMessage("CNIC is required")
    .matches(/^\d{5}-\d{7}-\d{1}$/)
    .withMessage("CNIC must be in format: 12345-1234567-1"),

  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const dob = new Date(value);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18 || age > 70) {
        throw new Error("Teacher age must be between 18 and 70 years");
      }
      return true;
    }),

  body("maritalStatus")
    .notEmpty()
    .withMessage("Marital status is required")
    .isIn(["Single", "Married", "Divorced", "Widowed"])
    .withMessage("Invalid marital status"),

  body("religion")
    .trim()
    .notEmpty()
    .withMessage("Religion is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Religion must be between 2 and 50 characters"),

  body("highestQualification")
    .trim()
    .notEmpty()
    .withMessage("Highest qualification is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Qualification must be between 2 and 100 characters"),

  body("domicile")
    .trim()
    .notEmpty()
    .withMessage("Domicile is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Domicile must be between 2 and 100 characters"),

  body("contactNumber")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required")
    .matches(/^(\+92|0)?3\d{9}$/)
    .withMessage("Invalid Pakistani phone number format"),

  body("contactEmail")
    .trim()
    .notEmpty()
    .withMessage("Contact email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("presentAddress")
    .trim()
    .notEmpty()
    .withMessage("Present address is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Address must be between 10 and 500 characters"),

  body("personalNumber")
    .trim()
    .notEmpty()
    .withMessage("Personal number is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Personal number must be between 3 and 50 characters"),

  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Designation must be between 2 and 100 characters"),

  body("bps")
    .notEmpty()
    .withMessage("BPS is required")
    .isInt({ min: 1, max: 22 })
    .withMessage("BPS must be between 1 and 22")
    .toInt(),

  body("employmentStatus")
    .notEmpty()
    .withMessage("Employment status is required")
    .isIn(["Regular", "Contract"])
    .withMessage("Employment status must be Regular or Contract"),

  body("superannuation")
    .notEmpty()
    .withMessage("Superannuation date is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("joinedServiceAt")
    .notEmpty()
    .withMessage("Joined service date is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("joinedCollegeAt")
    .notEmpty()
    .withMessage("Joined college date is required")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  handleValidationErrors,
];

/**
 * Validation for updating a teacher
 */
export const updateTeacherValidation = [
  param("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("fatherName")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Father name must be between 3 and 100 characters"),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("cnic")
    .optional()
    .trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/)
    .withMessage("CNIC must be in format: 12345-1234567-1"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const dob = new Date(value);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18 || age > 70) {
        throw new Error("Teacher age must be between 18 and 70 years");
      }
      return true;
    }),

  body("maritalStatus")
    .optional()
    .isIn(["Single", "Married", "Divorced", "Widowed"])
    .withMessage("Invalid marital status"),

  body("religion")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Religion must be between 2 and 50 characters"),

  body("highestQualification")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Qualification must be between 2 and 100 characters"),

  body("domicile")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Domicile must be between 2 and 100 characters"),

  body("contactNumber")
    .optional()
    .trim()
    .matches(/^(\+92|0)?3\d{9}$/)
    .withMessage("Invalid Pakistani phone number format"),

  body("contactEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("presentAddress")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Address must be between 10 and 500 characters"),

  body("personalNumber")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Personal number must be between 3 and 50 characters"),

  body("designation")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Designation must be between 2 and 100 characters"),

  body("bps")
    .optional()
    .isInt({ min: 1, max: 22 })
    .withMessage("BPS must be between 1 and 22")
    .toInt(),

  body("employmentStatus")
    .optional()
    .isIn(["Regular", "Contract"])
    .withMessage("Employment status must be Regular or Contract"),

  body("superannuation")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  body("joinedServiceAt")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  body("joinedCollegeAt")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),

  handleValidationErrors,
];

/**
 * Validation for teacher ID parameter
 */
export const teacherIdValidation = [
  param("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),
  handleValidationErrors,
];

/**
 * Validation for pagination
 */
export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  handleValidationErrors,
];

/**
 * Validation for search
 */
export const searchValidation = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  handleValidationErrors,
];

/**
 * Validation for bulk import
 */
export const bulkImportValidation = [
  body("teachers")
    .isArray({ min: 1, max: 500 })
    .withMessage("Teachers must be an array with 1-500 items"),

  body("teachers.*.name")
    .trim()
    .notEmpty()
    .withMessage("Name is required for all teachers"),

  body("teachers.*.fatherName")
    .trim()
    .notEmpty()
    .withMessage("Father name is required for all teachers"),

  body("teachers.*.gender")
    .notEmpty()
    .withMessage("Gender is required for all teachers")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("teachers.*.cnic")
    .trim()
    .notEmpty()
    .withMessage("CNIC is required for all teachers")
    .matches(/^\d{5}-\d{7}-\d{1}$/)
    .withMessage("CNIC must be in format: 12345-1234567-1"),

  body("teachers.*.dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required for all teachers")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("teachers.*.maritalStatus")
    .notEmpty()
    .withMessage("Marital status is required for all teachers")
    .isIn(["Single", "Married", "Divorced", "Widowed"])
    .withMessage("Invalid marital status"),

  body("teachers.*.religion")
    .trim()
    .notEmpty()
    .withMessage("Religion is required for all teachers"),

  body("teachers.*.highestQualification")
    .trim()
    .notEmpty()
    .withMessage("Highest qualification is required for all teachers"),

  body("teachers.*.domicile")
    .trim()
    .notEmpty()
    .withMessage("Domicile is required for all teachers"),

  body("teachers.*.contactNumber")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required for all teachers"),

  body("teachers.*.contactEmail")
    .trim()
    .notEmpty()
    .withMessage("Contact email is required for all teachers")
    .isEmail()
    .withMessage("Invalid email format"),

  body("teachers.*.presentAddress")
    .trim()
    .notEmpty()
    .withMessage("Present address is required for all teachers"),

  body("teachers.*.personalNumber")
    .trim()
    .notEmpty()
    .withMessage("Personal number is required for all teachers"),

  body("teachers.*.designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required for all teachers"),

  body("teachers.*.bps")
    .notEmpty()
    .withMessage("BPS is required for all teachers")
    .isInt({ min: 1, max: 22 })
    .withMessage("BPS must be between 1 and 22"),

  body("teachers.*.employmentStatus")
    .notEmpty()
    .withMessage("Employment status is required for all teachers")
    .isIn(["Regular", "Contract"])
    .withMessage("Employment status must be Regular or Contract"),

  body("teachers.*.superannuation")
    .notEmpty()
    .withMessage("Superannuation date is required for all teachers")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("teachers.*.joinedServiceAt")
    .notEmpty()
    .withMessage("Joined service date is required for all teachers")
    .isISO8601()
    .withMessage("Invalid date format"),

  body("teachers.*.joinedCollegeAt")
    .notEmpty()
    .withMessage("Joined college date is required for all teachers")
    .isISO8601()
    .withMessage("Invalid date format"),

  handleValidationErrors,
];
