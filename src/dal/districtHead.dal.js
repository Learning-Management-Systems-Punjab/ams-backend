import DistrictHead from "../models/district-head.js";

/**
 * Find DistrictHead by user ID
 * @param {String} userId
 * @returns {Promise<Object|null>}
 */
export const findDistrictHeadByUserId = async (userId) => {
  return await DistrictHead.findOne({ userId, isActive: true })
    .populate("userId", "-password")
    .populate("regionId");
};

/**
 * Find DistrictHead by email
 * @param {String} email
 * @returns {Promise<Object|null>}
 */
export const findDistrictHeadByEmail = async (email) => {
  return await DistrictHead.findOne({ email, isActive: true })
    .populate("userId", "-password")
    .populate("regionId");
};

/**
 * Find DistrictHead by ID
 * @param {String} districtHeadId
 * @returns {Promise<Object|null>}
 */
export const findDistrictHeadById = async (districtHeadId) => {
  return await DistrictHead.findById(districtHeadId)
    .populate("userId", "-password")
    .populate("regionId");
};

/**
 * Find DistrictHead by region ID
 * @param {String} regionId
 * @returns {Promise<Object|null>}
 */
export const findDistrictHeadByRegionId = async (regionId) => {
  return await DistrictHead.findOne({ regionId, isActive: true })
    .populate("userId", "-password")
    .populate("regionId");
};

/**
 * Create new DistrictHead
 * @param {Object} districtHeadData
 * @returns {Promise<Object>}
 */
export const createDistrictHead = async (districtHeadData) => {
  return await DistrictHead.create(districtHeadData);
};

/**
 * Update DistrictHead by ID
 * @param {String} districtHeadId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateDistrictHead = async (districtHeadId, updateData) => {
  return await DistrictHead.findByIdAndUpdate(districtHeadId, updateData, {
    new: true,
  })
    .populate("userId", "-password")
    .populate("regionId");
};

/**
 * Get all DistrictHeads with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllDistrictHeads = async (options = {}) => {
  const { skip = 0, limit = 10 } = options;
  return await DistrictHead.find({ isActive: true })
    .populate("userId", "-password")
    .populate("regionId")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count all DistrictHeads
 * @returns {Promise<Number>}
 */
export const countAllDistrictHeads = async () => {
  return await DistrictHead.countDocuments({ isActive: true });
};

/**
 * Search district heads by name, email, or CNIC
 * @param {String} searchQuery
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const searchDistrictHeads = async (searchQuery, options = {}) => {
  const { skip = 0, limit = 10 } = options;

  const searchRegex = new RegExp(searchQuery, "i");

  return await DistrictHead.find({
    isActive: true,
    $or: [{ name: searchRegex }, { email: searchRegex }, { cnic: searchRegex }],
  })
    .populate("userId", "-password")
    .populate("regionId")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count search results
 * @param {String} searchQuery
 * @returns {Promise<Number>}
 */
export const countSearchDistrictHeads = async (searchQuery) => {
  const searchRegex = new RegExp(searchQuery, "i");

  return await DistrictHead.countDocuments({
    isActive: true,
    $or: [{ name: searchRegex }, { email: searchRegex }, { cnic: searchRegex }],
  });
};

/**
 * Get all district heads for export (no pagination)
 * @returns {Promise<Array>}
 */
export const getAllDistrictHeadsForExport = async () => {
  return await DistrictHead.find({ isActive: true })
    .populate("userId", "-password")
    .populate("regionId")
    .sort({ name: 1 });
};
