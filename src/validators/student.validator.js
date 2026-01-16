import { param, query } from "express-validator";

/**
 * Validation for getting all students
 */
export const getAllStudentsValidation = [
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
 * Validation for getting student by ID
 */
export const getStudentByIdValidation = [
  param("studentId").isMongoId().withMessage("Invalid student ID format"),
];

/**
 * Validation for searching students
 */
export const searchStudentsValidation = [
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

// ============================================
// STUDENT-SPECIFIC VALIDATIONS (STUDENT PORTAL)
// ============================================

/**
 * Validation for pagination
 */
export const validatePagination = [
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
 * Validation for getting attendance
 */
export const validateGetAttendance = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("subjectId").optional().isMongoId().withMessage("Invalid subject ID"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format. Use YYYY-MM-DD"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format. Use YYYY-MM-DD"),
];

/**
 * Validation for getting attendance stats
 */
export const validateGetAttendanceStats = [
  query("subjectId").optional().isMongoId().withMessage("Invalid subject ID"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format. Use YYYY-MM-DD"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format. Use YYYY-MM-DD"),
];

/**
 * Validation for subjectId param
 */
export const validateSubjectId = [
  param("subjectId").isMongoId().withMessage("Invalid subject ID"),
];
