import { body, param, query } from "express-validator";

export const markAttendanceValidation = [
  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  body("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),

  body("period")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Period must be between 1 and 10"),

  body("attendanceRecords")
    .notEmpty()
    .withMessage("Attendance records are required")
    .isArray({ min: 1 })
    .withMessage(
      "Attendance records must be an array with at least one record"
    ),

  body("attendanceRecords.*.studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  body("attendanceRecords.*.status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Present", "Absent", "Late", "Leave", "Excused"])
    .withMessage("Status must be Present, Absent, Late, Leave, or Excused"),

  body("attendanceRecords.*.remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks must not exceed 500 characters"),
];

export const getAttendanceByDateValidation = [
  query("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  query("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Limit must be between 1 and 500"),
];

export const getStudentAttendanceValidation = [
  param("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),

  query("subjectId").optional().isMongoId().withMessage("Invalid Subject ID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Limit must be between 1 and 200"),
];

export const updateAttendanceValidation = [
  param("attendanceId")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isMongoId()
    .withMessage("Invalid Attendance ID"),

  body("status")
    .optional()
    .isIn(["Present", "Absent", "Late", "Leave", "Excused"])
    .withMessage("Status must be Present, Absent, Late, Leave, or Excused"),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks must not exceed 500 characters"),
];

export const attendanceIdValidation = [
  param("attendanceId")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isMongoId()
    .withMessage("Invalid Attendance ID"),
];

export const studentStatsValidation = [
  param("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  query("subjectId").optional().isMongoId().withMessage("Invalid Subject ID"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

export const sectionStatsValidation = [
  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  query("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];
