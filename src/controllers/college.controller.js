import {
  getAllCollegesService,
  getCollegeByIdService,
  searchCollegesService,
  createCollegeService,
  updateCollegeService,
} from "../services/college.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";

/**
 * Get all colleges with pagination
 * @route GET /api/colleges
 * @access Private - SysAdmin only
 */
export const getAllColleges = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllCollegesService(page, limit);
    return sendSuccess(res, 200, "Colleges retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get college by ID
 * @route GET /api/colleges/:collegeId
 * @access Private - SysAdmin only
 */
export const getCollegeById = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const college = await getCollegeByIdService(collegeId);
    return sendSuccess(res, 200, "College retrieved successfully", college);
  } catch (error) {
    if (error.message === "College not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Search colleges
 * @route GET /api/colleges/search
 * @access Private - SysAdmin only
 */
export const searchColleges = async (req, res, next) => {
  try {
    const { q: searchQuery } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!searchQuery) {
      return sendError(res, 400, "Search query is required");
    }

    const result = await searchCollegesService(searchQuery, page, limit);
    return sendSuccess(
      res,
      200,
      "College search completed successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create new college
 * @route POST /api/colleges
 * @access Private - SysAdmin only
 */
export const createCollege = async (req, res, next) => {
  try {
    const result = await createCollegeService(req.body);
    return sendSuccess(
      res,
      201,
      "College created successfully. Login credentials have been generated.",
      result
    );
  } catch (error) {
    if (error.message === "Region not found") {
      return sendError(res, 404, error.message);
    }
    if (error.message === "College code already exists") {
      return sendError(res, 409, error.message);
    }
    if (error.message === "Email already exists") {
      return sendError(res, 409, error.message);
    }
    next(error);
  }
};

/**
 * Update college
 * @route PUT /api/colleges/:collegeId
 * @access Private - SysAdmin only
 */
export const updateCollege = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const result = await updateCollegeService(collegeId, req.body);
    return sendSuccess(res, 200, "College updated successfully", result);
  } catch (error) {
    if (error.message === "College not found") {
      return sendError(res, 404, error.message);
    }
    if (error.message === "Region not found") {
      return sendError(res, 404, error.message);
    }
    if (error.message === "College code already exists") {
      return sendError(res, 409, error.message);
    }
    next(error);
  }
};
