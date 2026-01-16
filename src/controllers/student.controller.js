import {
  getAllStudentsService,
  getStudentByIdService,
  searchStudentsService,
  getMyProfileService,
  getMySectionDetailsService,
  getMyAttendanceService,
  getMyAttendanceStatsService,
  getMyAttendanceBySubjectService,
  getMyAttendanceSummaryService,
  getMyClassmatesService,
} from "../services/student.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";
import { validationResult } from "express-validator";

/**
 * Get all students with pagination
 * @route GET /api/students
 * @access Private - SysAdmin only
 */
export const getAllStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllStudentsService(page, limit);
    return sendSuccess(res, 200, "Students retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by ID
 * @route GET /api/students/:studentId
 * @access Private - SysAdmin only
 */
export const getStudentById = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await getStudentByIdService(studentId);
    return sendSuccess(res, 200, "Student retrieved successfully", student);
  } catch (error) {
    if (error.message === "Student not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Search students
 * @route GET /api/students/search
 * @access Private - SysAdmin only
 */
export const searchStudents = async (req, res, next) => {
  try {
    const { q: searchQuery } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!searchQuery) {
      return sendError(res, 400, "Search query is required");
    }

    const result = await searchStudentsService(searchQuery, page, limit);
    return sendSuccess(
      res,
      200,
      "Student search completed successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// STUDENT-SPECIFIC OPERATIONS (STUDENT PORTAL)
// ============================================

/**
 * Get my profile
 * @route GET /api/student-portal/my-profile
 * @access Private (Student only)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const profile = await getMyProfileService(userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    if (error.message === "Student profile not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get my section details with subjects and teachers
 * @route GET /api/student-portal/my-section
 * @access Private (Student only)
 */
export const getMySectionDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const sectionDetails = await getMySectionDetailsService(userId);

    res.status(200).json({
      success: true,
      message: "Section details retrieved successfully",
      data: sectionDetails,
    });
  } catch (error) {
    if (
      error.message === "Student profile not found" ||
      error.message === "You are not assigned to any section yet" ||
      error.message === "Section not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get my attendance records
 * @route GET /api/student-portal/my-attendance
 * @access Private (Student only)
 */
export const getMyAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.userId;
    const { page = 1, limit = 50, subjectId, startDate, endDate } = req.query;

    const result = await getMyAttendanceService(
      userId,
      parseInt(page),
      parseInt(limit),
      subjectId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "Student profile not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get my attendance statistics
 * @route GET /api/student-portal/my-attendance/stats
 * @access Private (Student only)
 */
export const getMyAttendanceStats = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.userId;
    const { subjectId, startDate, endDate } = req.query;

    const stats = await getMyAttendanceStatsService(
      userId,
      subjectId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      message: "Attendance statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    if (error.message === "Student profile not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get my attendance for a specific subject
 * @route GET /api/student-portal/subjects/:subjectId/attendance
 * @access Private (Student only)
 */
export const getMyAttendanceBySubject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user.userId;
    const { subjectId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await getMyAttendanceBySubjectService(
      userId,
      subjectId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Subject attendance retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "Student profile not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get my overall attendance summary
 * @route GET /api/student-portal/my-attendance/summary
 * @access Private (Student only)
 */
export const getMyAttendanceSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const summary = await getMyAttendanceSummaryService(userId);

    res.status(200).json({
      success: true,
      message: "Attendance summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    if (error.message === "Student profile not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get my classmates
 * @route GET /api/student-portal/my-classmates
 * @access Private (Student only)
 */
export const getMyClassmates = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const classmates = await getMyClassmatesService(userId);

    res.status(200).json({
      success: true,
      message: "Classmates retrieved successfully",
      data: classmates,
    });
  } catch (error) {
    if (
      error.message === "Student profile not found" ||
      error.message === "You are not assigned to any section yet"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
