import express from "express";
import { isTeacher } from "../middlewares/auth.js";
import {
  getMyAssignments,
  getMySections,
  getMySubjects,
  getStudentsInMySection,
  markAttendance,
  getMyAttendanceByDate,
  generateAttendanceSheet,
  getStudentAttendanceStats,
  getSectionAttendanceStats,
} from "../controllers/teacher.controller.js";
import {
  validatePagination,
  validateSectionId,
  validateStudentId,
  validateMarkAttendance,
  validateGetAttendanceByDate,
  validateGenerateSheet,
  validateStudentStats,
  validateSectionStats,
} from "../validators/teacher.validator.js";

const router = express.Router();

// All routes require teacher authentication
router.use(isTeacher);

/**
 * @route   GET /api/teacher-portal/my-assignments
 * @desc    Get my assignments (sections and subjects I teach)
 * @access  Private (Teacher only)
 */
router.get("/my-assignments", validatePagination, getMyAssignments);

/**
 * @route   GET /api/teacher-portal/my-sections
 * @desc    Get unique sections I teach
 * @access  Private (Teacher only)
 */
router.get("/my-sections", getMySections);

/**
 * @route   GET /api/teacher-portal/my-subjects
 * @desc    Get unique subjects I teach
 * @access  Private (Teacher only)
 */
router.get("/my-subjects", getMySubjects);

/**
 * @route   GET /api/teacher-portal/sections/:sectionId/students
 * @desc    Get students in my section
 * @access  Private (Teacher only - must be assigned to section)
 */
router.get(
  "/sections/:sectionId/students",
  validateSectionId,
  getStudentsInMySection
);

/**
 * @route   POST /api/teacher-portal/attendance/mark
 * @desc    Mark attendance for my class
 * @access  Private (Teacher only - must be assigned to section+subject)
 */
router.post("/attendance/mark", validateMarkAttendance, markAttendance);

/**
 * @route   GET /api/teacher-portal/attendance
 * @desc    Get attendance for my class by date
 * @access  Private (Teacher only - must be assigned to section+subject)
 */
router.get("/attendance", validateGetAttendanceByDate, getMyAttendanceByDate);

/**
 * @route   GET /api/teacher-portal/attendance/sheet
 * @desc    Generate attendance sheet for marking
 * @access  Private (Teacher only - must be assigned to section+subject)
 */
router.get("/attendance/sheet", validateGenerateSheet, generateAttendanceSheet);

/**
 * @route   GET /api/teacher-portal/attendance/stats/student/:studentId
 * @desc    Get student attendance stats for my subject
 * @access  Private (Teacher only - must teach the subject)
 */
router.get(
  "/attendance/stats/student/:studentId",
  validateStudentStats,
  getStudentAttendanceStats
);

/**
 * @route   GET /api/teacher-portal/attendance/stats/section/:sectionId
 * @desc    Get section attendance stats for my class
 * @access  Private (Teacher only - must be assigned to section+subject)
 */
router.get(
  "/attendance/stats/section/:sectionId",
  validateSectionStats,
  getSectionAttendanceStats
);

export default router;
