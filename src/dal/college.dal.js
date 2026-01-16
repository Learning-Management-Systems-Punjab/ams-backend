import College from "../models/college.js";

/**
 * Find College by ID
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const findCollegeById = async (collegeId) => {
  return await College.findOne({ _id: collegeId, isActive: true })
    .populate("regionId")
    .populate("userId", "-password");
};

/**
 * Find College by code
 * @param {String} code
 * @returns {Promise<Object|null>}
 */
export const findCollegeByCode = async (code) => {
  return await College.findOne({ code, isActive: true })
    .populate("regionId")
    .populate("userId", "-password");
};

/**
 * Find College by user ID (College Admin)
 * @param {String} userId
 * @returns {Promise<Object|null>}
 */
export const findCollegeByUserId = async (userId) => {
  return await College.findOne({ userId, isActive: true })
    .populate("regionId")
    .populate("userId", "-password");
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
    .populate("userId", "-password")
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
  })
    .populate("regionId")
    .populate("userId", "-password");
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
    .populate("userId", "-password")
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

/**
 * Search colleges by name, code, or city
 * @param {String} searchQuery
 * @param {Object} options - Pagination options
 * @param {Number} options.skip
 * @param {Number} options.limit
 * @returns {Promise<Array>}
 */
export const searchColleges = async (searchQuery, { skip = 0, limit = 10 }) => {
  const regex = new RegExp(searchQuery, "i");

  return await College.find({
    isActive: true,
    $or: [{ name: regex }, { code: regex }, { city: regex }],
  })
    .populate("regionId", "name code")
    .populate("userId", "-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count search results for colleges
 * @param {String} searchQuery
 * @returns {Promise<Number>}
 */
export const countSearchColleges = async (searchQuery) => {
  const regex = new RegExp(searchQuery, "i");

  return await College.countDocuments({
    isActive: true,
    $or: [{ name: regex }, { code: regex }, { city: regex }],
  });
};
