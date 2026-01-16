import express from "express";
import {
  getDashboardStats,
  getProgramWiseStats,
  getSectionWiseStats,
  getTeacherStats,
  getQuickStats,
  getRecentEnrollments,
  getCapacityUtilization,
} from "../controllers/college-admin-statistics.controller.js";
import {
  validateSectionStats,
  validateRecentEnrollments,
} from "../validators/college-admin-statistics.validator.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/college-admin/statistics/dashboard
 * @desc    Get comprehensive dashboard statistics for college admin
 * @access  Private (College Admin)
 */
router.get("/dashboard", isCollegeAdmin, getDashboardStats);

/**
 * @route   GET /api/college-admin/statistics/quick
 * @desc    Get quick stats for dashboard cards (ultra-fast)
 * @access  Private (College Admin)
 */
router.get("/quick", isCollegeAdmin, getQuickStats);

/**
 * @route   GET /api/college-admin/statistics/programs
 * @desc    Get program-wise statistics (students, sections per program)
 * @access  Private (College Admin)
 */
router.get("/programs", isCollegeAdmin, getProgramWiseStats);

/**
 * @route   GET /api/college-admin/statistics/sections
 * @desc    Get section-wise statistics with optional program filter
 * @access  Private (College Admin)
 * @query   programId - Optional MongoDB ObjectId
 */
router.get(
  "/sections",
  isCollegeAdmin,
  validateSectionStats,
  getSectionWiseStats
);

/**
 * @route   GET /api/college-admin/statistics/teachers
 * @desc    Get teacher statistics (gender, qualifications, subject assignments)
 * @access  Private (College Admin)
 */
router.get("/teachers", isCollegeAdmin, getTeacherStats);

/**
 * @route   GET /api/college-admin/statistics/recent-enrollments
 * @desc    Get recent student enrollments
 * @access  Private (College Admin)
 * @query   limit - Number of records (default 10, max 50)
 */
router.get(
  "/recent-enrollments",
  isCollegeAdmin,
  validateRecentEnrollments,
  getRecentEnrollments
);

/**
 * @route   GET /api/college-admin/statistics/capacity
 * @desc    Get college capacity and utilization metrics
 * @access  Private (College Admin)
 */
router.get("/capacity", isCollegeAdmin, getCapacityUtilization);

export default router;
