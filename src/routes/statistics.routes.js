import express from "express";
import {
  getDashboardStatistics,
  getRegionWiseStatistics,
  getCollegeWiseStatistics,
  getQuickStats,
} from "../controllers/statistics.controller.js";
import { getCollegeWiseStatisticsValidation } from "../validators/statistics.validator.js";
import { validate } from "../middlewares/validate.js";
import { isSysAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/statistics/dashboard
 * @desc    Get comprehensive dashboard statistics
 * @access  Private - SysAdmin only
 */
router.get("/dashboard", isSysAdmin, getDashboardStatistics);

/**
 * @route   GET /api/statistics/quick
 * @desc    Get quick statistics for dashboard cards (optimized)
 * @access  Private - SysAdmin only
 */
router.get("/quick", isSysAdmin, getQuickStats);

/**
 * @route   GET /api/statistics/regions
 * @desc    Get region-wise statistics (colleges per region, district head assignment)
 * @access  Private - SysAdmin only
 */
router.get("/regions", isSysAdmin, getRegionWiseStatistics);

/**
 * @route   GET /api/statistics/colleges
 * @desc    Get college-wise statistics (teachers, students, programs per college)
 * @access  Private - SysAdmin only
 * @query   regionId (optional) - Filter colleges by region
 */
router.get(
  "/colleges",
  isSysAdmin,
  getCollegeWiseStatisticsValidation,
  validate,
  getCollegeWiseStatistics
);

export default router;
