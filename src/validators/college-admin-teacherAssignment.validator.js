import { body, param, query } from "express-validator";

export const createAssignmentValidation = [
  body("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid Teacher ID"),

  body("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  body("academicYear")
    .trim()
    .notEmpty()
    .withMessage("Academic year is required")
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in format YYYY-YYYY (e.g., 2025-2026)"),

  body("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isIn(["Fall", "Spring", "Summer"])
    .withMessage("Semester must be Fall, Spring, or Summer"),
];

export const updateAssignmentValidation = [
  param("assignmentId")
    .notEmpty()
    .withMessage("Assignment ID is required")
    .isMongoId()
    .withMessage("Invalid Assignment ID"),

  body("academicYear")
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in format YYYY-YYYY"),

  body("semester")
    .optional()
    .isIn(["Fall", "Spring", "Summer"])
    .withMessage("Semester must be Fall, Spring, or Summer"),
];

export const assignmentIdValidation = [
  param("assignmentId")
    .notEmpty()
    .withMessage("Assignment ID is required")
    .isMongoId()
    .withMessage("Invalid Assignment ID"),
];

export const teacherIdValidation = [
  param("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid Teacher ID"),
];

export const assignmentPaginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("academicYear")
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in format YYYY-YYYY"),

  query("semester")
    .optional()
    .isIn(["Fall", "Spring", "Summer"])
    .withMessage("Semester must be Fall, Spring, or Summer"),

  query("programId").optional().isMongoId().withMessage("Invalid Program ID"),
];
