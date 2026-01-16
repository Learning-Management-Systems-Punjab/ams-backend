import {
  getCollegeAdminDashboardStatsService,
  getProgramWiseStatsService,
  getSectionWiseStatsService,
  getTeacherStatsService,
  getCollegeAdminQuickStatsService,
  getRecentEnrollmentsService,
  getCapacityUtilizationService,
} from "../services/college-admin-statistics.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

/**
 * Get dashboard statistics for College Admin
 * Scoped to their college only
 * @route GET /api/college-admin/statistics/dashboard
 * @access Private (College Admin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getCollegeAdminDashboardStatsService(college._id);

    // Add college info to response
    const response = {
      college: {
        id: college._id,
        name: college.name,
        code: college.code,
        city: college.city,
      },
      statistics: stats,
    };

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * Get program-wise statistics
 * Shows students and sections per program
 * @route GET /api/college-admin/statistics/programs
 * @access Private (College Admin)
 */
export const getProgramWiseStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getProgramWiseStatsService(college._id);

    res.status(200).json({
      success: true,
      message: "Program-wise statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getProgramWiseStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve program statistics",
      error: error.message,
    });
  }
};

/**
 * Get section-wise statistics
 * Shows students per section with optional program filter
 * @route GET /api/college-admin/statistics/sections
 * @access Private (College Admin)
 * @query programId - Optional program filter
 */
export const getSectionWiseStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { programId } = req.query;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getSectionWiseStatsService(college._id, programId);

    res.status(200).json({
      success: true,
      message: "Section-wise statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getSectionWiseStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve section statistics",
      error: error.message,
    });
  }
};

/**
 * Get teacher statistics
 * Shows teacher breakdown by gender, qualification, and subject assignments
 * @route GET /api/college-admin/statistics/teachers
 * @access Private (College Admin)
 */
export const getTeacherStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getTeacherStatsService(college._id);

    res.status(200).json({
      success: true,
      message: "Teacher statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getTeacherStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve teacher statistics",
      error: error.message,
    });
  }
};

/**
 * Get quick stats for dashboard cards
 * Ultra-fast endpoint for overview cards
 * @route GET /api/college-admin/statistics/quick
 * @access Private (College Admin)
 */
export const getQuickStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getCollegeAdminQuickStatsService(college._id);

    res.status(200).json({
      success: true,
      message: "Quick statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getQuickStats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve quick statistics",
      error: error.message,
    });
  }
};

/**
 * Get recent student enrollments
 * Shows last 10 students enrolled
 * @route GET /api/college-admin/statistics/recent-enrollments
 * @access Private (College Admin)
 * @query limit - Number of records (default 10, max 50)
 */
export const getRecentEnrollments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const students = await getRecentEnrollmentsService(college._id, limit);

    res.status(200).json({
      success: true,
      message: "Recent enrollments retrieved successfully",
      data: students,
    });
  } catch (error) {
    console.error("Error in getRecentEnrollments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recent enrollments",
      error: error.message,
    });
  }
};

/**
 * Get capacity and utilization metrics
 * Shows college capacity, enrollment, and section utilization
 * @route GET /api/college-admin/statistics/capacity
 * @access Private (College Admin)
 */
export const getCapacityUtilization = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getCapacityUtilizationService(college._id);

    res.status(200).json({
      success: true,
      message: "Capacity utilization retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getCapacityUtilization:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve capacity utilization",
      error: error.message,
    });
  }
};
