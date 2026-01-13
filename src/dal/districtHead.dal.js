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
 * Get all DistrictHeads
 * @returns {Promise<Array>}
 */
export const getAllDistrictHeads = async () => {
  return await DistrictHead.find({ isActive: true })
    .populate("userId", "-password")
    .populate("regionId");
};
