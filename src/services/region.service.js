import {
  findRegionById,
  findRegionByCode,
  createRegion,
  updateRegion,
  getAllRegions,
  countAllRegions,
} from "../dal/region.dal.js";
import { findDistrictHeadByUserId } from "../dal/districtHead.dal.js";

/**
 * Create new region
 * @param {Object} regionData
 * @returns {Promise<Object>}
 */
export const createRegionService = async (regionData) => {
  const { name, code, description, districtHeadId } = regionData;

  // Check if region with same code already exists
  const existingRegion = await findRegionByCode(code);
  if (existingRegion) {
    throw new Error("Region with this code already exists");
  }

  // Validate district head if provided
  if (districtHeadId) {
    const districtHead = await findDistrictHeadByUserId(districtHeadId);
    if (!districtHead) {
      throw new Error("District Head not found");
    }
  }

  const region = await createRegion({
    name,
    code: code.toUpperCase(),
    description: description || null,
    districtHeadId: districtHeadId || null,
    isActive: true,
  });

  return region;
};

/**
 * Get region by ID
 * @param {String} regionId
 * @returns {Promise<Object>}
 */
export const getRegionByIdService = async (regionId) => {
  const region = await findRegionById(regionId);
  if (!region) {
    throw new Error("Region not found");
  }
  return region;
};

/**
 * Get all regions with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllRegionsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const regions = await getAllRegions({ skip, limit });
  const total = await countAllRegions();

  return {
    regions,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
};

/**
 * Update region
 * @param {String} regionId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateRegionService = async (regionId, updateData) => {
  const { code, districtHeadId, ...otherData } = updateData;

  // Check if region exists
  const existingRegion = await findRegionById(regionId);
  if (!existingRegion) {
    throw new Error("Region not found");
  }

  // Check if new code already exists (if code is being changed)
  if (code && code.toUpperCase() !== existingRegion.code) {
    const regionWithCode = await findRegionByCode(code);
    if (regionWithCode) {
      throw new Error("Region with this code already exists");
    }
  }

  // Validate district head if provided
  if (districtHeadId) {
    const districtHead = await findDistrictHeadByUserId(districtHeadId);
    if (!districtHead) {
      throw new Error("District Head not found");
    }
  }

  const updatedRegion = await updateRegion(regionId, {
    ...otherData,
    code: code ? code.toUpperCase() : existingRegion.code,
    districtHeadId:
      districtHeadId !== undefined
        ? districtHeadId
        : existingRegion.districtHeadId,
  });

  return updatedRegion;
};

/**
 * Delete region (soft delete)
 * @param {String} regionId
 * @returns {Promise<Object>}
 */
export const deleteRegionService = async (regionId) => {
  const region = await findRegionById(regionId);
  if (!region) {
    throw new Error("Region not found");
  }

  const updatedRegion = await updateRegion(regionId, { isActive: false });
  return updatedRegion;
};
