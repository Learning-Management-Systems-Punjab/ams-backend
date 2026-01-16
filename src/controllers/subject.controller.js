import {
  getAllSubjectsService,
  getSubjectByIdService,
  searchSubjectsService,
} from "../services/subject.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";

/**
 * Get all subjects with pagination
 * @route GET /api/subjects
 * @access Private - SysAdmin only
 */
export const getAllSubjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllSubjectsService(page, limit);
    return sendSuccess(res, 200, "Subjects retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get subject by ID
 * @route GET /api/subjects/:subjectId
 * @access Private - SysAdmin only
 */
export const getSubjectById = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const subject = await getSubjectByIdService(subjectId);
    return sendSuccess(res, 200, "Subject retrieved successfully", subject);
  } catch (error) {
    if (error.message === "Subject not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Search subjects
 * @route GET /api/subjects/search
 * @access Private - SysAdmin only
 */
export const searchSubjects = async (req, res, next) => {
  try {
    const { q: searchQuery } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!searchQuery) {
      return sendError(res, 400, "Search query is required");
    }

    const result = await searchSubjectsService(searchQuery, page, limit);
    return sendSuccess(
      res,
      200,
      "Subject search completed successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};
