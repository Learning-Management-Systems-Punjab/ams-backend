import { param, query } from "express-validator";

/**
 * Validation for getting all subjects
 */
export const getAllSubjectsValidation = [
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
 * Validation for getting subject by ID
 */
export const getSubjectByIdValidation = [
  param("subjectId").isMongoId().withMessage("Invalid subject ID format"),
];

/**
 * Validation for searching subjects
 */
export const searchSubjectsValidation = [
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
