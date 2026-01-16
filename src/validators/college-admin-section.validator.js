import { body, param, query } from "express-validator";

export const createSectionValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Section name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("programId")
    .notEmpty()
    .withMessage("Program ID is required")
    .isMongoId()
    .withMessage("Invalid Program ID"),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),

  body("shift")
    .notEmpty()
    .withMessage("Shift is required")
    .isIn(["1st Shift", "2nd Shift", "Morning", "Evening"])
    .withMessage("Invalid shift"),

  body("rollNumberRange.start")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range start must be a positive integer"),

  body("rollNumberRange.end")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range end must be a positive integer"),

  body("subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array"),

  body("subjects.*").optional().isMongoId().withMessage("Invalid Subject ID"),

  body("capacity")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Capacity must be between 1 and 500"),
];

export const updateSectionValidation = [
  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("year")
    .optional()
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),

  body("shift")
    .optional()
    .isIn(["1st Shift", "2nd Shift", "Morning", "Evening"])
    .withMessage("Invalid shift"),

  body("rollNumberRange.start")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range start must be a positive integer"),

  body("rollNumberRange.end")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range end must be a positive integer"),

  body("capacity")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Capacity must be between 1 and 500"),
];

export const splitSectionValidation = [
  body("programId")
    .notEmpty()
    .withMessage("Program ID is required")
    .isMongoId()
    .withMessage("Invalid Program ID"),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),

  body("sectionRanges")
    .notEmpty()
    .withMessage("Section ranges are required")
    .isArray({ min: 1 })
    .withMessage("Section ranges must be an array with at least one item"),

  body("sectionRanges.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each section must have a name"),

  body("sectionRanges.*.start")
    .isInt({ min: 1 })
    .withMessage("Start roll number must be a positive integer"),

  body("sectionRanges.*.end")
    .isInt({ min: 1 })
    .withMessage("End roll number must be a positive integer"),

  body("sectionRanges.*.shift")
    .optional()
    .isIn(["1st Shift", "2nd Shift", "Morning", "Evening"])
    .withMessage("Invalid shift"),
];

export const assignStudentValidation = [
  body("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),
];

export const bulkAssignValidation = [
  body("assignments")
    .notEmpty()
    .withMessage("Assignments array is required")
    .isArray({ min: 1 })
    .withMessage("Assignments must be an array with at least one item"),

  body("assignments.*.studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  body("assignments.*.sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),
];

export const sectionIdValidation = [
  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),
];

export const sectionPaginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("programId").optional().isMongoId().withMessage("Invalid Program ID"),

  query("year")
    .optional()
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),
];
