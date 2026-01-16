import express from "express";
import { isStudent } from "../middlewares/auth.js";
import {
  getMyProfile,
  getMySectionDetails,
  getMyAttendance,
  getMyAttendanceStats,
  getMyAttendanceBySubject,
  getMyAttendanceSummary,
  getMyClassmates,
} from "../controllers/student.controller.js";
import {
  validatePagination,
  validateGetAttendance,
  validateGetAttendanceStats,
  validateSubjectId,
} from "../validators/student.validator.js";

const router = express.Router();

// All routes require student authentication
router.use(isStudent);

/**
 * @route   GET /api/student-portal/my-profile
 * @desc    Get student's profile information
 * @access  Private (Student only)
 */
router.get("/my-profile", getMyProfile);

/**
 * @route   GET /api/student-portal/my-section
 * @desc    Get student's section details with subjects and teachers
 * @access  Private (Student only)
 */
router.get("/my-section", getMySectionDetails);

/**
 * @route   GET /api/student-portal/my-attendance
 * @desc    Get student's attendance records with pagination
 * @access  Private (Student only)
 */
router.get("/my-attendance", validateGetAttendance, getMyAttendance);

/**
 * @route   GET /api/student-portal/my-attendance/stats
 * @desc    Get student's attendance statistics
 * @access  Private (Student only)
 */
router.get(
  "/my-attendance/stats",
  validateGetAttendanceStats,
  getMyAttendanceStats
);

/**
 * @route   GET /api/student-portal/my-attendance/summary
 * @desc    Get student's overall attendance summary
 * @access  Private (Student only)
 */
router.get("/my-attendance/summary", getMyAttendanceSummary);

/**
 * @route   GET /api/student-portal/subjects/:subjectId/attendance
 * @desc    Get student's attendance for a specific subject
 * @access  Private (Student only)
 */
router.get(
  "/subjects/:subjectId/attendance",
  validateSubjectId,
  validatePagination,
  getMyAttendanceBySubject
);

/**
 * @route   GET /api/student-portal/my-classmates
 * @desc    Get student's classmates (students in same section)
 * @access  Private (Student only)
 */
router.get("/my-classmates", getMyClassmates);

export default router;
