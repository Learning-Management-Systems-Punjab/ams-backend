import express from "express";
import {
  markAttendance,
  getAttendanceBySectionDate,
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceStats,
  getSectionAttendanceStats,
  generateAttendanceSheet,
} from "../controllers/college-admin-attendance.controller.js";
import {
  markAttendanceValidation,
  getAttendanceByDateValidation,
  getStudentAttendanceValidation,
  updateAttendanceValidation,
  attendanceIdValidation,
  studentStatsValidation,
  sectionStatsValidation,
} from "../validators/college-admin-attendance.validator.js";
import { sectionIdValidation } from "../validators/college-admin-section.validator.js";
import { validate } from "../middlewares/validate.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/college-admin/attendance/mark - Mark attendance
router.post(
  "/mark",
  ...isCollegeAdmin,
  markAttendanceValidation,
  validate,
  markAttendance
);

// GET /api/college-admin/attendance - Get attendance by section and date
router.get(
  "/",
  ...isCollegeAdmin,
  getAttendanceByDateValidation,
  validate,
  getAttendanceBySectionDate
);

// GET /api/college-admin/attendance/student/:studentId - Get student attendance
router.get(
  "/student/:studentId",
  ...isCollegeAdmin,
  getStudentAttendanceValidation,
  validate,
  getAttendanceByStudent
);

// GET /api/college-admin/attendance/stats/student/:studentId - Student stats
router.get(
  "/stats/student/:studentId",
  ...isCollegeAdmin,
  studentStatsValidation,
  validate,
  getStudentAttendanceStats
);

// GET /api/college-admin/attendance/stats/section/:sectionId - Section stats
router.get(
  "/stats/section/:sectionId",
  ...isCollegeAdmin,
  sectionStatsValidation,
  validate,
  getSectionAttendanceStats
);

// GET /api/college-admin/attendance/sheet/:sectionId - Generate attendance sheet
router.get(
  "/sheet/:sectionId",
  ...isCollegeAdmin,
  sectionIdValidation,
  validate,
  generateAttendanceSheet
);

// PUT /api/college-admin/attendance/:attendanceId - Update attendance
router.put(
  "/:attendanceId",
  ...isCollegeAdmin,
  updateAttendanceValidation,
  validate,
  updateAttendance
);

// DELETE /api/college-admin/attendance/:attendanceId - Delete attendance
router.delete(
  "/:attendanceId",
  ...isCollegeAdmin,
  attendanceIdValidation,
  validate,
  deleteAttendance
);

export default router;
