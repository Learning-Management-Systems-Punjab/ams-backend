import College from "../models/college.js";

/**
 * Find College by ID
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const findCollegeById = async (collegeId) => {
  return await College.findOne({ _id: collegeId, isActive: true }).populate(
    "regionId"
  );
};

/**
 * Find College by code
 * @param {String} code
 * @returns {Promise<Object|null>}
 */
export const findCollegeByCode = async (code) => {
  return await College.findOne({ code, isActive: true }).populate("regionId");
};

/**
 * Find Colleges by region ID
 * @param {String} regionId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findCollegesByRegionId = async (regionId, options = {}) => {
  const { skip = 0, limit = 10 } = options;
  return await College.find({ regionId, isActive: true })
    .populate("regionId")
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
};

/**
 * Count Colleges by region ID
 * @param {String} regionId
 * @returns {Promise<Number>}
 */
export const countCollegesByRegionId = async (regionId) => {
  return await College.countDocuments({ regionId, isActive: true });
};

/**
 * Create new College
 * @param {Object} collegeData
 * @returns {Promise<Object>}
 */
export const createCollege = async (collegeData) => {
  return await College.create(collegeData);
};

/**
 * Update College by ID
 * @param {String} collegeId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateCollege = async (collegeId, updateData) => {
  return await College.findByIdAndUpdate(collegeId, updateData, {
    new: true,
  }).populate("regionId");
};

/**
 * Get all Colleges with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllColleges = async (options = {}) => {
  const { skip = 0, limit = 10 } = options;
  return await College.find({ isActive: true })
    .populate("regionId")
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
};

/**
 * Count all Colleges
 * @returns {Promise<Number>}
 */
export const countAllColleges = async () => {
  return await College.countDocuments({ isActive: true });
};
