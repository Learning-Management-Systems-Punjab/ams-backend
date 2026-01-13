import Region from "../models/region.js";

/**
 * Find Region by ID
 * @param {String} regionId
 * @returns {Promise<Object|null>}
 */
export const findRegionById = async (regionId) => {
  return await Region.findOne({ _id: regionId, isActive: true }).populate(
    "districtHeadId"
  );
};

/**
 * Find Region by code
 * @param {String} code
 * @returns {Promise<Object|null>}
 */
export const findRegionByCode = async (code) => {
  return await Region.findOne({ code, isActive: true }).populate(
    "districtHeadId"
  );
};

/**
 * Create new Region
 * @param {Object} regionData
 * @returns {Promise<Object>}
 */
export const createRegion = async (regionData) => {
  return await Region.create(regionData);
};

/**
 * Update Region by ID
 * @param {String} regionId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateRegion = async (regionId, updateData) => {
  return await Region.findByIdAndUpdate(regionId, updateData, {
    new: true,
  }).populate("districtHeadId");
};

/**
 * Get all Regions with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllRegions = async (options = {}) => {
  const { skip = 0, limit = 10 } = options;
  return await Region.find({ isActive: true })
    .populate("districtHeadId")
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
};

/**
 * Count all Regions
 * @returns {Promise<Number>}
 */
export const countAllRegions = async () => {
  return await Region.countDocuments({ isActive: true });
};
