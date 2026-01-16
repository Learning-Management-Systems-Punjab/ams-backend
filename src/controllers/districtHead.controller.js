import {
  createDistrictHeadService,
  getDistrictHeadByIdService,
  getAllDistrictHeadsService,
  updateDistrictHeadService,
  getDistrictHeadByRegionService,
  searchDistrictHeadsService,
  resetDistrictHeadPasswordService,
  exportDistrictHeadsToCSVService,
} from "../services/districtHead.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";

/**
 * Create district head
 * @route POST /api/district-heads
 * @access Private - SysAdmin only
 */
export const createDistrictHead = async (req, res, next) => {
  try {
    const result = await createDistrictHeadService(req.body);
    return sendSuccess(res, 201, "District Head created successfully", result);
  } catch (error) {
    if (
      error.message.includes("already exists") ||
      error.message.includes("already has a District Head")
    ) {
      return sendError(res, 409, error.message);
    }
    if (error.message === "Region not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Get district head by ID
 * @route GET /api/district-heads/:userId
 * @access Private - SysAdmin only
 */
export const getDistrictHeadById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const districtHead = await getDistrictHeadByIdService(userId);
    return sendSuccess(
      res,
      200,
      "District Head retrieved successfully",
      districtHead
    );
  } catch (error) {
    if (error.message === "District Head not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Get all district heads
 * @route GET /api/district-heads
 * @access Private - SysAdmin only
 */
export const getAllDistrictHeads = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllDistrictHeadsService(page, limit);
    return sendSuccess(
      res,
      200,
      "District Heads retrieved successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update district head
 * @route PUT /api/district-heads/:districtHeadId
 * @access Private - SysAdmin only
 */
export const updateDistrictHead = async (req, res, next) => {
  try {
    const { districtHeadId } = req.params;
    const updatedDistrictHead = await updateDistrictHeadService(
      districtHeadId,
      req.body
    );
    return sendSuccess(
      res,
      200,
      "District Head updated successfully",
      updatedDistrictHead
    );
  } catch (error) {
    if (error.message === "District Head not found") {
      return sendError(res, 404, error.message);
    }
    if (error.message === "Region not found") {
      return sendError(res, 404, error.message);
    }
    if (error.message.includes("already has a District Head")) {
      return sendError(res, 409, error.message);
    }
    next(error);
  }
};

/**
 * Get district head by region
 * @route GET /api/district-heads/region/:regionId
 * @access Private - SysAdmin only
 */
export const getDistrictHeadByRegion = async (req, res, next) => {
  try {
    const { regionId } = req.params;
    const districtHead = await getDistrictHeadByRegionService(regionId);
    return sendSuccess(
      res,
      200,
      "District Head retrieved successfully",
      districtHead
    );
  } catch (error) {
    if (
      error.message === "Region not found" ||
      error.message === "No District Head assigned to this region"
    ) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Search district heads
 * @route GET /api/district-heads/search
 * @access Private - SysAdmin only
 */
export const searchDistrictHeads = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await searchDistrictHeadsService(q, page, limit);
    return sendSuccess(
      res,
      200,
      "District Heads search completed successfully",
      result
    );
  } catch (error) {
    if (error.message === "Search query is required") {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * Reset district head password
 * @route POST /api/district-heads/:districtHeadId/reset-password
 * @access Private - SysAdmin only
 */
export const resetDistrictHeadPassword = async (req, res, next) => {
  try {
    const { districtHeadId } = req.params;
    const result = await resetDistrictHeadPasswordService(districtHeadId);
    return sendSuccess(res, 200, "Password reset successfully", result);
  } catch (error) {
    if (error.message === "District Head not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Export district heads to CSV
 * @route GET /api/district-heads/export/csv
 * @access Private - SysAdmin only
 */
export const exportDistrictHeadsToCSV = async (req, res, next) => {
  try {
    const includePassword = req.query.includePassword === "true";

    const result = await exportDistrictHeadsToCSVService(includePassword);

    // Convert to CSV format
    const csvRows = [];

    // Header row
    const headers = [
      "ID",
      "Name",
      "Email",
      "Contact Number",
      "CNIC",
      "Gender",
      "Region Name",
      "Region Code",
      "Active",
      "Created At",
    ];

    if (includePassword) {
      headers.push("Password");
    }

    csvRows.push(headers.join(","));

    // Data rows
    result.csvData.forEach((row) => {
      const values = [
        row.id,
        `"${row.name}"`,
        row.email,
        `"${row.contactNumber}"`,
        row.cnic,
        row.gender,
        `"${row.regionName}"`,
        row.regionCode,
        row.isActive,
        new Date(row.createdAt).toISOString(),
      ];

      if (includePassword && row.password) {
        values.push(row.password);
      }

      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");

    // Set headers for file download
    const filename = includePassword
      ? `district-heads-with-passwords-${Date.now()}.csv`
      : `district-heads-${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.status(200).send(csvContent);
  } catch (error) {
    if (error.message === "No district heads found to export") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};
