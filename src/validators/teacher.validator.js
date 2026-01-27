import { body, param, query } from "express-validator";

/**
 * Validation for getting all teachers
 */
export const getAllTeachersValidation = [
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
 * Validation for getting teacher by ID
 */
export const getTeacherByIdValidation = [
  param("teacherId").isMongoId().withMessage("Invalid teacher ID format"),
];

/**
 * Validation for searching teachers
 */
export const searchTeachersValidation = [
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
// TEACHER-SPECIFIC VALIDATIONS (SCOPED TO ASSIGNMENTS)
// ============================================

/**
 * Validation for pagination (teacher endpoints)
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
 * Validation for sectionId param
 */
export const validateSectionId = [
  param("sectionId").isMongoId().withMessage("Invalid section ID"),
];

/**
 * Validation for studentId param
 */
export const validateStudentId = [
  param("studentId").isMongoId().withMessage("Invalid student ID"),
];

/**
 * Validation for marking attendance
 */
export const validateMarkAttendance = [
  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid section ID"),
  body("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid subject ID"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format. Use YYYY-MM-DD"),
  body("period")
    .notEmpty()
    .withMessage("Period is required")
    .custom((value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1 || num > 10) {
        throw new Error("Period must be between 1 and 10");
      }
      return true;
    }),
  body("attendanceRecords")
    .isArray({ min: 1 })
    .withMessage("Attendance records must be a non-empty array"),
  body("attendanceRecords.*.studentId")
    .notEmpty()
    .withMessage("Student ID is required in each record")
    .isMongoId()
    .withMessage("Invalid student ID in attendance record"),
  body("attendanceRecords.*.status")
    .notEmpty()
    .withMessage("Status is required in each record")
    .isIn(["Present", "Absent", "Late", "Leave", "Excused"])
    .withMessage(
      "Status must be one of: Present, Absent, Late, Leave, Excused",
    ),
];

/**
 * Validation for getting attendance records (flexible filtering)
 */
export const validateGetAttendanceByDate = [
  query("sectionId").optional().isMongoId().withMessage("Invalid section ID"),
  query("subjectId").optional().isMongoId().withMessage("Invalid subject ID"),
  query("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format. Use YYYY-MM-DD"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format. Use YYYY-MM-DD"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format. Use YYYY-MM-DD"),
  query("period")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Period must be between 1 and 10"),
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
 * Validation for generating attendance sheet
 */
export const validateGenerateSheet = [
  query("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid section ID"),
  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid subject ID"),
];

/**
 * Validation for student attendance stats
 */
export const validateStudentStats = [
  param("studentId").isMongoId().withMessage("Invalid student ID"),
  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid subject ID"),
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
 * Validation for section attendance stats
 */
export const validateSectionStats = [
  param("sectionId").isMongoId().withMessage("Invalid section ID"),
  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid subject ID"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format. Use YYYY-MM-DD"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format. Use YYYY-MM-DD"),
];
