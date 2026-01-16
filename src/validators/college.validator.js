import { param, query, body } from "express-validator";

/**
 * Validation for getting all colleges
 */
export const getAllCollegesValidation = [
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
 * Validation for getting college by ID
 */
export const getCollegeByIdValidation = [
  param("collegeId").isMongoId().withMessage("Invalid college ID format"),
];

/**
 * Validation for searching colleges
 */
export const searchCollegesValidation = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 2 })
    .withMessage("Search query must be at least 2 characters"),
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
 * Validation for creating a college
 */
export const createCollegeValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("College name is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("College name must be between 3 and 200 characters"),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("College code is required")
    .isLength({ min: 2, max: 10 })
    .withMessage("College code must be between 2 and 10 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage(
      "College code must contain only uppercase letters and numbers"
    ),
  body("regionId")
    .notEmpty()
    .withMessage("Region ID is required")
    .isMongoId()
    .withMessage("Invalid region ID format"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Address must be between 10 and 500 characters"),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("City name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("establishedYear")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(
      `Established year must be between 1900 and ${new Date().getFullYear()}`
    ),
];

/**
 * Validation for updating a college
 */
export const updateCollegeValidation = [
  param("collegeId").isMongoId().withMessage("Invalid college ID format"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("College name must be between 3 and 200 characters"),
  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("College code must be between 2 and 10 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage(
      "College code must contain only uppercase letters and numbers"
    ),
  body("regionId")
    .optional()
    .isMongoId()
    .withMessage("Invalid region ID format"),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Address must be between 10 and 500 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("City name must be between 2 and 100 characters"),
  body("establishedYear")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(
      `Established year must be between 1900 and ${new Date().getFullYear()}`
    ),
];
