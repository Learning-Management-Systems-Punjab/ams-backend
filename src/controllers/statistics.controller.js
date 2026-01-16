import {
  getDashboardStatisticsService,
  getRegionWiseStatisticsService,
  getCollegeWiseStatisticsService,
  getQuickStatsService,
} from "../services/statistics.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";

/**
 * Get dashboard statistics
 * @route GET /api/statistics/dashboard
 * @access Private - SysAdmin only
 */
export const getDashboardStatistics = async (req, res, next) => {
  try {
    const statistics = await getDashboardStatisticsService();
    return sendSuccess(
      res,
      200,
      "Dashboard statistics retrieved successfully",
      statistics
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get region-wise statistics
 * @route GET /api/statistics/regions
 * @access Private - SysAdmin only
 */
export const getRegionWiseStatistics = async (req, res, next) => {
  try {
    const statistics = await getRegionWiseStatisticsService();
    return sendSuccess(
      res,
      200,
      "Region-wise statistics retrieved successfully",
      {
        regions: statistics,
        total: statistics.length,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get college-wise statistics
 * @route GET /api/statistics/colleges
 * @access Private - SysAdmin only
 */
export const getCollegeWiseStatistics = async (req, res, next) => {
  try {
    const { regionId } = req.query;
    const statistics = await getCollegeWiseStatisticsService(regionId);
    return sendSuccess(
      res,
      200,
      "College-wise statistics retrieved successfully",
      {
        colleges: statistics,
        total: statistics.length,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get quick statistics (for dashboard cards)
 * @route GET /api/statistics/quick
 * @access Private - SysAdmin only
 */
export const getQuickStats = async (req, res, next) => {
  try {
    const statistics = await getQuickStatsService();
    return sendSuccess(
      res,
      200,
      "Quick statistics retrieved successfully",
      statistics
    );
  } catch (error) {
    next(error);
  }
};
