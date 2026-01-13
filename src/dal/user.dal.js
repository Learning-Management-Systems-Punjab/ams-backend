import User from "../models/user.js";

/**
 * Find user by email
 * @param {String} email
 * @returns {Promise<Object|null>}
 */
export const findUserByEmail = async (email) => {
  return await User.findOne({ email, isActive: true });
};

/**
 * Find user by ID
 * @param {String} userId
 * @returns {Promise<Object|null>}
 */
export const findUserById = async (userId) => {
  return await User.findOne({ _id: userId, isActive: true });
};

/**
 * Create new user
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  return await User.create(userData);
};

/**
 * Update user by ID
 * @param {String} userId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateUser = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

/**
 * Delete user (soft delete)
 * @param {String} userId
 * @returns {Promise<Object|null>}
 */
export const deleteUser = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );
};

/**
 * Find users by role
 * @param {String} role
 * @returns {Promise<Array>}
 */
export const findUsersByRole = async (role) => {
  return await User.find({ role, isActive: true });
};
