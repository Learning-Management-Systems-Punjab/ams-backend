import {
  findDistrictHeadByUserId,
  findDistrictHeadByEmail,
  findDistrictHeadById,
  createDistrictHead,
  updateDistrictHead,
  getAllDistrictHeads,
  countAllDistrictHeads,
  findDistrictHeadByRegionId,
  searchDistrictHeads,
  countSearchDistrictHeads,
  getAllDistrictHeadsForExport,
} from "../dal/districtHead.dal.js";
import { createUser, findUserByEmail, updateUser } from "../dal/user.dal.js";
import { findRegionById, updateRegion } from "../dal/region.dal.js";
import { hashPassword, generateRandomString } from "../utils/helpers.js";

/**
 * Create new district head
 * @param {Object} districtHeadData
 * @returns {Promise<Object>}
 */
export const createDistrictHeadService = async (districtHeadData) => {
  const {
    email,
    password,
    name,
    contactNumber,
    cnic,
    gender,
    regionId,
    image,
  } = districtHeadData;

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Check if district head already exists with this email
  const existingDistrictHead = await findDistrictHeadByEmail(email);
  if (existingDistrictHead) {
    throw new Error("District Head with this email already exists");
  }

  // Validate region if provided
  if (regionId) {
    const region = await findRegionById(regionId);
    if (!region) {
      throw new Error("Region not found");
    }

    // Check if region already has a district head
    const existingRegionHead = await findDistrictHeadByRegionId(regionId);
    if (existingRegionHead) {
      throw new Error("This region already has a District Head assigned");
    }
  }

  // Create user account
  const hashedPassword = await hashPassword(password);
  const user = await createUser({
    email,
    password: hashedPassword,
    role: "DistrictHead",
    isActive: true,
  });

  // Create district head profile
  const districtHead = await createDistrictHead({
    name,
    contactNumber,
    email,
    cnic,
    gender,
    regionId: regionId || null,
    userId: user._id,
    image: image || null,
    isActive: true,
  });

  // Update region's districtHeadId if region is assigned
  if (regionId) {
    await updateRegion(regionId, { districtHeadId: districtHead._id });
  }

  return {
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    districtHead,
  };
};

/**
 * Get district head by ID
 * @param {String} userId
 * @returns {Promise<Object>}
 */
export const getDistrictHeadByIdService = async (userId) => {
  const districtHead = await findDistrictHeadByUserId(userId);
  if (!districtHead) {
    throw new Error("District Head not found");
  }
  return districtHead;
};

/**
 * Get all district heads with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllDistrictHeadsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const districtHeads = await getAllDistrictHeads({ skip, limit });
  const total = await countAllDistrictHeads();

  return {
    districtHeads,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  };
};

/**
 * Update district head
 * @param {String} districtHeadId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateDistrictHeadService = async (districtHeadId, updateData) => {
  const { regionId, ...otherData } = updateData;

  // Get the current district head to check for region changes
  const currentDistrictHead = await findDistrictHeadById(districtHeadId);
  if (!currentDistrictHead) {
    throw new Error("District Head not found");
  }

  const oldRegionId = currentDistrictHead.regionId
    ? currentDistrictHead.regionId.toString()
    : null;

  // Validate region if provided
  if (regionId) {
    const region = await findRegionById(regionId);
    if (!region) {
      throw new Error("Region not found");
    }

    // Check if another district head is already assigned to this region
    const existingRegionHead = await findDistrictHeadByRegionId(regionId);
    if (
      existingRegionHead &&
      existingRegionHead._id.toString() !== districtHeadId
    ) {
      throw new Error("This region already has a District Head assigned");
    }
  }

  const updatedDistrictHead = await updateDistrictHead(districtHeadId, {
    ...otherData,
    regionId: regionId || null,
  });

  if (!updatedDistrictHead) {
    throw new Error("District Head not found");
  }

  // Update region assignments
  // Remove district head from old region if it changed
  if (oldRegionId && oldRegionId !== regionId) {
    await updateRegion(oldRegionId, { districtHeadId: null });
  }

  // Assign district head to new region
  if (regionId) {
    await updateRegion(regionId, { districtHeadId: districtHeadId });
  }

  return updatedDistrictHead;
};

/**
 * Get district head by region
 * @param {String} regionId
 * @returns {Promise<Object>}
 */
export const getDistrictHeadByRegionService = async (regionId) => {
  const region = await findRegionById(regionId);
  if (!region) {
    throw new Error("Region not found");
  }

  const districtHead = await findDistrictHeadByRegionId(regionId);
  if (!districtHead) {
    throw new Error("No District Head assigned to this region");
  }

  return districtHead;
};

/**
 * Search district heads
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchDistrictHeadsService = async (
  searchQuery,
  page = 1,
  limit = 10
) => {
  if (!searchQuery || searchQuery.trim() === "") {
    throw new Error("Search query is required");
  }

  const skip = (page - 1) * limit;
  const districtHeads = await searchDistrictHeads(searchQuery, { skip, limit });
  const total = await countSearchDistrictHeads(searchQuery);

  return {
    districtHeads,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
    searchQuery,
  };
};

/**
 * Reset district head password
 * @param {String} districtHeadId
 * @returns {Promise<Object>}
 */
export const resetDistrictHeadPasswordService = async (districtHeadId) => {
  const districtHead = await findDistrictHeadById(districtHeadId);

  if (!districtHead) {
    throw new Error("District Head not found");
  }

  // Generate new random password
  const newPassword = generateRandomString(12);
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await updateUser(districtHead.userId._id, { password: hashedPassword });

  return {
    districtHeadId: districtHead._id,
    name: districtHead.name,
    email: districtHead.email,
    newPassword, // Return plain password to frontend
  };
};
/**
 * Export district heads to CSV format
 * @param {Boolean} includePassword - Whether to reset and include passwords
 * @returns {Promise<Object>}
 */
export const exportDistrictHeadsToCSVService = async (
  includePassword = false
) => {
  const districtHeads = await getAllDistrictHeadsForExport();

  if (districtHeads.length === 0) {
    throw new Error("No district heads found to export");
  }

  const csvData = [];
  const passwordResets = [];

  for (const dh of districtHeads) {
    const row = {
      id: dh._id.toString(),
      name: dh.name,
      email: dh.email,
      contactNumber: dh.contactNumber,
      cnic: dh.cnic,
      gender: dh.gender,
      regionName: dh.regionId ? dh.regionId.name : "Not Assigned",
      regionCode: dh.regionId ? dh.regionId.code : "N/A",
      isActive: dh.isActive,
      createdAt: dh.createdAt,
    };

    // If includePassword is true, reset password and add to CSV
    if (includePassword) {
      const newPassword = generateRandomString(12);
      const hashedPassword = await hashPassword(newPassword);

      // Update password in database
      await updateUser(dh.userId._id, { password: hashedPassword });

      row.password = newPassword;

      passwordResets.push({
        districtHeadId: dh._id.toString(),
        name: dh.name,
        email: dh.email,
        newPassword,
      });
    }

    csvData.push(row);
  }

  return {
    csvData,
    totalExported: csvData.length,
    passwordsReset: includePassword ? passwordResets.length : 0,
    passwordResets: includePassword ? passwordResets : [],
  };
};
