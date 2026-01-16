import { body, param, query } from "express-validator";

export const createDistrictHeadValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("contactNumber")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required")
    .matches(/^(\+92|92|0)?3\d{9}$/)
    .withMessage("Invalid contact number format. Use format: 03XX-XXXXXXX"),

  body("cnic")
    .trim()
    .notEmpty()
    .withMessage("CNIC is required")
    .matches(/^[0-9\-]+$/)
    .withMessage("Invalid CNIC format"),

  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("regionId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid region ID format"),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
];

export const updateDistrictHeadValidation = [
  param("districtHeadId")
    .trim()
    .isMongoId()
    .withMessage("Invalid district head ID format"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),

  body("contactNumber")
    .optional()
    .trim()
    .matches(/^(\+92|92|0)?3\d{9}$/)
    .withMessage("Invalid contact number format. Use format: 03XX-XXXXXXX"),

  body("cnic")
    .optional()
    .trim()
    .matches(/^[0-9\-]+$/)
    .withMessage("Invalid CNIC format"),

  body("gender")
    .optional()
    .trim()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("regionId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid region ID format"),

  body("image")
    .optional()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
];

export const getDistrictHeadByIdValidation = [
  param("userId").trim().isMongoId().withMessage("Invalid user ID format"),
];

export const getDistrictHeadByRegionValidation = [
  param("regionId").trim().isMongoId().withMessage("Invalid region ID format"),
];

export const getAllDistrictHeadsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export const searchDistrictHeadsValidation = [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query (q) is required")
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

export const resetDistrictHeadPasswordValidation = [
  param("districtHeadId")
    .trim()
    .isMongoId()
    .withMessage("Invalid district head ID format"),
];

export const exportDistrictHeadsValidation = [
  query("includePassword")
    .optional()
    .isBoolean()
    .withMessage("includePassword must be a boolean (true or false)"),
];
