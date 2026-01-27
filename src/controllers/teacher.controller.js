import {
  getAllTeachersService,
  getTeacherByIdService,
  searchTeachersService,
  getMyAssignmentsService,
  getMySectionsService,
  getMySubjectsService,
  getStudentsInMySectionService,
  markAttendanceByTeacherService,
  getMyAttendanceRecordsService,
  getStudentAttendanceStatsForTeacherService,
  getSectionAttendanceStatsForTeacherService,
  generateAttendanceSheetForTeacherService,
} from "../services/teacher.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";
import { validationResult } from "express-validator";

/**
 * Get all teachers with pagination
 * @route GET /api/teachers
 * @access Private - SysAdmin only
 */
export const getAllTeachers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllTeachersService(page, limit);
    return sendSuccess(res, 200, "Teachers retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher by ID
 * @route GET /api/teachers/:teacherId
 * @access Private - SysAdmin only
 */
export const getTeacherById = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const teacher = await getTeacherByIdService(teacherId);
    return sendSuccess(res, 200, "Teacher retrieved successfully", teacher);
  } catch (error) {
    if (error.message === "Teacher not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Search teachers
 * @route GET /api/teachers/search
 * @access Private - SysAdmin only
 */
export const searchTeachers = async (req, res, next) => {
  try {
    const { q: searchQuery } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!searchQuery) {
      return sendError(res, 400, "Search query is required");
    }

    const result = await searchTeachersService(searchQuery, page, limit);
    return sendSuccess(
      res,
      200,
      "Teacher search completed successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// TEACHER-SPECIFIC OPERATIONS (SCOPED TO ASSIGNMENTS)
// ============================================

/**
 * Get my assignments (sections and subjects I teach)
 * @route GET /api/teacher/my-assignments
 * @access Private (Teacher only)
 */
export const getMyAssignments = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const { page = 1, limit = 50 } = req.query;

    const result = await getMyAssignmentsService(
      teacherId,
      collegeId,
      parseInt(page),
      parseInt(limit),
    );

    res.status(200).json({
      success: true,
      message: "Assignments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my sections (unique sections I teach)
 * @route GET /api/teacher/my-sections
 * @access Private (Teacher only)
 */
export const getMySections = async (req, res, next) => {
  try {
    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const sections = await getMySectionsService(teacherId, collegeId);

    res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      data: { sections },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my subjects (unique subjects I teach)
 * @route GET /api/teacher/my-subjects
 * @access Private (Teacher only)
 */
export const getMySubjects = async (req, res, next) => {
  try {
    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const subjects = await getMySubjectsService(teacherId, collegeId);

    res.status(200).json({
      success: true,
      message: "Subjects retrieved successfully",
      data: { subjects },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get students in my section
 * @route GET /api/teacher/sections/:sectionId/students
 * @access Private (Teacher only)
 */
export const getStudentsInMySection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const { sectionId } = req.params;

    const students = await getStudentsInMySectionService(
      teacherId,
      collegeId,
      sectionId,
    );

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark attendance for my class
 * @route POST /api/teacher/attendance/mark
 * @access Private (Teacher only)
 */
export const markAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;
    const userId = req.user.userId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const { sectionId, subjectId, date, period, attendanceRecords } = req.body;

    const attendance = await markAttendanceByTeacherService(
      teacherId,
      collegeId,
      userId,
      sectionId,
      subjectId,
      new Date(date),
      parseInt(period, 10), // Convert to integer
      attendanceRecords,
    );

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my attendance records with flexible filtering
 * @route GET /api/teacher/attendance
 * @access Private (Teacher only)
 */
export const getMyAttendanceByDate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const {
      sectionId,
      subjectId,
      date,
      startDate,
      endDate,
      period,
      page = 1,
      limit = 50,
    } = req.query;

    const attendance = await getMyAttendanceRecordsService(
      teacherId,
      collegeId,
      {
        sectionId,
        subjectId,
        date: date ? new Date(date) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        period: period ? parseInt(period) : undefined,
      },
      { page: parseInt(page), limit: parseInt(limit) },
    );

    res.status(200).json({
      success: true,
      message: "Attendance retrieved successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate attendance sheet for marking
 * @route GET /api/teacher/attendance/sheet
 * @access Private (Teacher only)
 */
export const generateAttendanceSheet = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const { sectionId, subjectId } = req.query;

    const sheet = await generateAttendanceSheetForTeacherService(
      teacherId,
      collegeId,
      sectionId,
      subjectId,
    );

    res.status(200).json({
      success: true,
      message: "Attendance sheet generated successfully",
      data: sheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student attendance stats for my subject
 * @route GET /api/teacher/attendance/stats/student/:studentId
 * @access Private (Teacher only)
 */
export const getStudentAttendanceStats = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const { studentId } = req.params;
    const { subjectId, startDate, endDate } = req.query;

    const stats = await getStudentAttendanceStatsForTeacherService(
      teacherId,
      collegeId,
      studentId,
      subjectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    res.status(200).json({
      success: true,
      message: "Student attendance stats retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get section attendance stats for my class
 * @route GET /api/teacher/attendance/stats/section/:sectionId
 * @access Private (Teacher only)
 */
export const getSectionAttendanceStats = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const teacherId = req.user.teacherId;
    const collegeId = req.user.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile not found. Please contact administrator.",
      });
    }

    const { sectionId } = req.params;
    const { subjectId, startDate, endDate } = req.query;

    const stats = await getSectionAttendanceStatsForTeacherService(
      teacherId,
      collegeId,
      sectionId,
      subjectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    res.status(200).json({
      success: true,
      message: "Section attendance stats retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
