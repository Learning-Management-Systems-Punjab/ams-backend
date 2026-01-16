import {
  getAllTeachersService,
  getTeacherByIdService,
  searchTeachersService,
} from "../services/teacher.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";

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
      result
    );
  } catch (error) {
    next(error);
  }
};
