import {
  getAllColleges,
  countAllColleges,
  findCollegeById,
  findCollegeByCode,
  findCollegeByUserId,
  searchColleges,
  countSearchColleges,
  createCollege,
  updateCollege,
} from "../dal/college.dal.js";
import { findRegionById } from "../dal/region.dal.js";
import { createUser, findUserByEmail } from "../dal/user.dal.js";
import { hashPassword, generateRandomString } from "../utils/helpers.js";

/**
 * Get all colleges with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllCollegesService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [colleges, totalCount] = await Promise.all([
    getAllColleges({ skip, limit }),
    countAllColleges(),
  ]);

  return {
    colleges,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get college by ID
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const getCollegeByIdService = async (collegeId) => {
  const college = await findCollegeById(collegeId);

  if (!college) {
    throw new Error("College not found");
  }

  return college;
};

/**
 * Search colleges
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchCollegesService = async (
  searchQuery,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [colleges, totalCount] = await Promise.all([
    searchColleges(searchQuery, { skip, limit }),
    countSearchColleges(searchQuery),
  ]);

  return {
    colleges,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
    searchQuery,
  };
};

/**
 * Create new college
 * @param {Object} collegeData
 * @returns {Promise<Object>}
 */
export const createCollegeService = async (collegeData) => {
  const {
    name,
    code,
    regionId,
    address,
    city,
    establishedYear,
    email,
    password,
  } = collegeData;

  // Check if region exists
  const region = await findRegionById(regionId);
  if (!region) {
    throw new Error("Region not found");
  }

  // Check if college code already exists
  const existingCollege = await findCollegeByCode(code);
  if (existingCollege) {
    throw new Error("College code already exists");
  }

  // Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user account for College Admin
  const user = await createUser({
    email,
    password: hashedPassword,
    role: "CollegeAdmin",
  });

  // Create college with user reference
  const college = await createCollege({
    name,
    code: code.toUpperCase(),
    regionId,
    address,
    city,
    establishedYear,
    userId: user._id,
  });

  // Populate region and user data
  const populatedCollege = await findCollegeById(college._id);

  // Return college data with plain text password (for initial setup only)
  return {
    college: populatedCollege,
    credentials: {
      email,
      password, // Plain text password for first-time setup
    },
  };
};

/**
 * Update college
 * @param {String} collegeId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateCollegeService = async (collegeId, updateData) => {
  const { name, code, regionId, address, city, establishedYear } = updateData;

  // Check if college exists
  const existingCollege = await findCollegeById(collegeId);
  if (!existingCollege) {
    throw new Error("College not found");
  }

  // If regionId is being updated, verify it exists
  if (regionId && regionId !== existingCollege.regionId._id.toString()) {
    const region = await findRegionById(regionId);
    if (!region) {
      throw new Error("Region not found");
    }
  }

  // If code is being updated, check for duplicates
  if (code && code.toUpperCase() !== existingCollege.code) {
    const collegeWithCode = await findCollegeByCode(code);
    if (collegeWithCode) {
      throw new Error("College code already exists");
    }
  }

  // Update college
  const updatedCollege = await updateCollege(collegeId, {
    ...(name && { name }),
    ...(code && { code: code.toUpperCase() }),
    ...(regionId && { regionId }),
    ...(address && { address }),
    ...(city && { city }),
    ...(establishedYear && { establishedYear }),
  });

  return updatedCollege;
};
