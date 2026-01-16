import {
  createRegionService,
  getRegionByIdService,
  getAllRegionsService,
  updateRegionService,
  deleteRegionService,
} from "../services/region.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";

/**
 * Create region
 * @route POST /api/regions
 * @access Private - SysAdmin only
 */
export const createRegion = async (req, res, next) => {
  try {
    const region = await createRegionService(req.body);
    return sendSuccess(res, 201, "Region created successfully", region);
  } catch (error) {
    if (error.message === "Region with this code already exists") {
      return sendError(res, 409, error.message);
    }
    if (error.message === "District Head not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Get region by ID
 * @route GET /api/regions/:regionId
 * @access Private - SysAdmin only
 */
export const getRegionById = async (req, res, next) => {
  try {
    const { regionId } = req.params;
    const region = await getRegionByIdService(regionId);
    return sendSuccess(res, 200, "Region retrieved successfully", region);
  } catch (error) {
    if (error.message === "Region not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Get all regions
 * @route GET /api/regions
 * @access Private - SysAdmin only
 */
export const getAllRegions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllRegionsService(page, limit);
    return sendSuccess(res, 200, "Regions retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update region
 * @route PUT /api/regions/:regionId
 * @access Private - SysAdmin only
 */
export const updateRegion = async (req, res, next) => {
  try {
    const { regionId } = req.params;
    const updatedRegion = await updateRegionService(regionId, req.body);
    return sendSuccess(res, 200, "Region updated successfully", updatedRegion);
  } catch (error) {
    if (error.message === "Region not found") {
      return sendError(res, 404, error.message);
    }
    if (error.message === "Region with this code already exists") {
      return sendError(res, 409, error.message);
    }
    if (error.message === "District Head not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Delete region
 * @route DELETE /api/regions/:regionId
 * @access Private - SysAdmin only
 */
export const deleteRegion = async (req, res, next) => {
  try {
    const { regionId } = req.params;
    const deletedRegion = await deleteRegionService(regionId);
    return sendSuccess(res, 200, "Region deleted successfully", deletedRegion);
  } catch (error) {
    if (error.message === "Region not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};
