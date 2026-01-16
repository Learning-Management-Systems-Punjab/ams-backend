import {
  getAllStudentsService,
  getStudentByIdService,
  searchStudentsService,
} from "../services/student.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";

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
