import { query } from "express-validator";

/**
 * Validation for college-wise statistics with optional region filter
 */
export const getCollegeWiseStatisticsValidation = [
  query("regionId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid region ID format"),
];
