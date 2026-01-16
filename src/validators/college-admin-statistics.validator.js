import { query, validationResult } from "express-validator";

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
 * Validation for section statistics with optional program filter
 */
export const validateSectionStats = [
  query("programId")
    .optional()
    .isMongoId()
    .withMessage("Invalid program ID format"),
  handleValidationErrors,
];

/**
 * Validation for recent enrollments with limit
 */
export const validateRecentEnrollments = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
  handleValidationErrors,
];
