import { body, param, query } from "express-validator";

/**
 * Validation for creating a student
 */
export const createStudentValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("rollNumber")
    .trim()
    .notEmpty()
    .withMessage("Roll number is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Roll number must be between 1 and 50 characters"),

  body("fatherName")
    .trim()
    .notEmpty()
    .withMessage("Father name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Father name must be between 2 and 100 characters"),

  body("contactNumber")
    .optional()
    .trim()
    .matches(/^(\+92|0)?[0-9]{10}$/)
    .withMessage("Contact number must be a valid Pakistani phone number"),

  body("cnic")
    .optional()
    .trim()
    .matches(/^[0-9]{13}$|^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
    .withMessage("CNIC must be in format: 1234567890123 or 12345-1234567-1"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail(),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),

  body("programId")
    .notEmpty()
    .withMessage("Program ID is required")
    .isMongoId()
    .withMessage("Program ID must be a valid MongoDB ID"),

  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Section ID must be a valid MongoDB ID"),

  body("enrollmentDate")
    .optional()
    .isISO8601()
    .withMessage("Enrollment date must be a valid date"),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Graduated", "Dropped"])
    .withMessage("Status must be Active, Inactive, Graduated, or Dropped"),

  body("createLoginAccount")
    .optional()
    .isBoolean()
    .withMessage("createLoginAccount must be a boolean"),
];

/**
 * Validation for updating a student
 */
export const updateStudentValidation = [
  param("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be a valid MongoDB ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("rollNumber")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Roll number must be between 1 and 50 characters"),

  body("fatherName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Father name must be between 2 and 100 characters"),

  body("contactNumber")
    .optional()
    .trim()
    .matches(/^(\+92|0)?[0-9]{10}$/)
    .withMessage("Contact number must be a valid Pakistani phone number"),

  body("cnic")
    .optional()
    .trim()
    .matches(/^[0-9]{13}$|^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
    .withMessage("CNIC must be in format: 1234567890123 or 12345-1234567-1"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail(),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),

  body("programId")
    .optional()
    .isMongoId()
    .withMessage("Program ID must be a valid MongoDB ID"),

  body("sectionId")
    .optional()
    .isMongoId()
    .withMessage("Section ID must be a valid MongoDB ID"),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Graduated", "Dropped"])
    .withMessage("Status must be Active, Inactive, Graduated, or Dropped"),

  body("collegeId")
    .optional()
    .custom(() => {
      throw new Error("College ID cannot be updated");
    }),

  body("userId")
    .optional()
    .custom(() => {
      throw new Error("User ID cannot be updated");
    }),
];

/**
 * Validation for student ID parameter
 */
export const studentIdValidation = [
  param("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Student ID must be a valid MongoDB ID"),
];

/**
 * Validation for pagination
 */
export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("programId")
    .optional()
    .isMongoId()
    .withMessage("Program ID must be a valid MongoDB ID"),

  query("sectionId")
    .optional()
    .isMongoId()
    .withMessage("Section ID must be a valid MongoDB ID"),

  query("status")
    .optional()
    .isIn(["Active", "Inactive", "Graduated", "Dropped"])
    .withMessage("Status must be Active, Inactive, Graduated, or Dropped"),
];

/**
 * Validation for search
 */
export const searchValidation = [
  query("query")
    .notEmpty()
    .withMessage("Search query is required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

/**
 * Validation for bulk import
 */
export const bulkImportValidation = [
  body("students")
    .notEmpty()
    .withMessage("Students array is required")
    .isArray({ min: 1, max: 500 })
    .withMessage("Students must be an array with 1 to 500 items"),

  body("students.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each student must have a name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("students.*.rollNumber")
    .trim()
    .notEmpty()
    .withMessage("Each student must have a roll number")
    .isLength({ min: 1, max: 50 })
    .withMessage("Roll number must be between 1 and 50 characters"),

  body("students.*.fatherName")
    .trim()
    .notEmpty()
    .withMessage("Each student must have a father name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Father name must be between 2 and 100 characters"),

  body("students.*.contactNumber")
    .optional()
    .trim()
    .matches(/^(\+92|0)?[0-9]{10}$/)
    .withMessage("Contact number must be a valid Pakistani phone number"),

  body("students.*.cnic")
    .optional()
    .trim()
    .matches(/^[0-9]{13}$|^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
    .withMessage("CNIC must be in format: 1234567890123 or 12345-1234567-1"),

  body("students.*.email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email must be valid")
    .normalizeEmail(),

  body("students.*.dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  body("students.*.gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("students.*.programId")
    .notEmpty()
    .withMessage("Each student must have a program ID")
    .isMongoId()
    .withMessage("Program ID must be a valid MongoDB ID"),

  body("students.*.sectionId")
    .notEmpty()
    .withMessage("Each student must have a section ID")
    .isMongoId()
    .withMessage("Section ID must be a valid MongoDB ID"),

  body("students.*.status")
    .optional()
    .isIn(["Active", "Inactive", "Graduated", "Dropped"])
    .withMessage("Status must be Active, Inactive, Graduated, or Dropped"),

  body("createLoginAccounts")
    .optional()
    .isBoolean()
    .withMessage("createLoginAccounts must be a boolean"),
];

/**
 * Validation for export
 */
export const exportValidation = [
  query("programId")
    .optional()
    .isMongoId()
    .withMessage("Program ID must be a valid MongoDB ID"),

  query("sectionId")
    .optional()
    .isMongoId()
    .withMessage("Section ID must be a valid MongoDB ID"),
];
