import { body, param, query } from "express-validator";

export const createRegionValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Region name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Region name must be between 3 and 100 characters"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Region code is required")
    .isLength({ min: 2, max: 10 })
    .withMessage("Region code must be between 2 and 10 characters")
    .matches(/^[A-Z0-9\-]+$/i)
    .withMessage("Region code can only contain letters, numbers, and hyphens"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("districtHeadId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid district head ID format"),
];

export const updateRegionValidation = [
  param("regionId").trim().isMongoId().withMessage("Invalid region ID format"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Region name must be between 3 and 100 characters"),

  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("Region code must be between 2 and 10 characters")
    .matches(/^[A-Z0-9\-]+$/i)
    .withMessage("Region code can only contain letters, numbers, and hyphens"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("districtHeadId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid district head ID format"),
];

export const getRegionByIdValidation = [
  param("regionId").trim().isMongoId().withMessage("Invalid region ID format"),
];

export const deleteRegionValidation = [
  param("regionId").trim().isMongoId().withMessage("Invalid region ID format"),
];

export const getAllRegionsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
