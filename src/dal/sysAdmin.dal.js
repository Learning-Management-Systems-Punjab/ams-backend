import SysAdmin from "../models/sys-admin.js";

/**
 * Find SysAdmin by user ID
 * @param {String} userId
 * @returns {Promise<Object|null>}
 */
export const findSysAdminByUserId = async (userId) => {
  return await SysAdmin.findOne({ userId, isActive: true }).populate(
    "userId",
    "-password"
  );
};

/**
 * Find SysAdmin by email
 * @param {String} email
 * @returns {Promise<Object|null>}
 */
export const findSysAdminByEmail = async (email) => {
  return await SysAdmin.findOne({ email, isActive: true }).populate(
    "userId",
    "-password"
  );
};

/**
 * Find SysAdmin by CNIC
 * @param {String} cnic
 * @returns {Promise<Object|null>}
 */
export const findSysAdminByCnic = async (cnic) => {
  return await SysAdmin.findOne({ cnic, isActive: true });
};

/**
 * Create new SysAdmin
 * @param {Object} sysAdminData
 * @returns {Promise<Object>}
 */
export const createSysAdmin = async (sysAdminData) => {
  return await SysAdmin.create(sysAdminData);
};

/**
 * Update SysAdmin by ID
 * @param {String} sysAdminId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateSysAdmin = async (sysAdminId, updateData) => {
  return await SysAdmin.findByIdAndUpdate(sysAdminId, updateData, {
    new: true,
  });
};

/**
 * Get all SysAdmins
 * @returns {Promise<Array>}
 */
export const getAllSysAdmins = async () => {
  return await SysAdmin.find({ isActive: true }).populate(
    "userId",
    "-password"
  );
};
