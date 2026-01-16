import Teacher from "../models/teacher.js";

/**
 * Find Teacher by user ID
 * @param {String} userId
 * @returns {Promise<Object|null>}
 */
export const findTeacherByUserId = async (userId) => {
  return await Teacher.findOne({ userId, isActive: true })
    .populate("userId", "-password")
    .populate("collegeId");
};

/**
 * Find Teacher by email
 * @param {String} email
 * @returns {Promise<Object|null>}
 */
export const findTeacherByEmail = async (email) => {
  return await Teacher.findOne({ contactEmail: email, isActive: true })
    .populate("userId", "-password")
    .populate("collegeId");
};

/**
 * Find Teacher by CNIC
 * @param {String} cnic
 * @returns {Promise<Object|null>}
 */
export const findTeacherByCnic = async (cnic) => {
  return await Teacher.findOne({ cnic, isActive: true });
};

/**
 * Find Teachers by college ID
 * @param {String} collegeId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findTeachersByCollegeId = async (collegeId, options = {}) => {
  const { skip = 0, limit = 10 } = options;
  return await Teacher.find({ collegeId, isActive: true })
    .populate("userId", "-password")
    .populate("collegeId")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count Teachers by college ID
 * @param {String} collegeId
 * @returns {Promise<Number>}
 */
export const countTeachersByCollegeId = async (collegeId) => {
  return await Teacher.countDocuments({ collegeId, isActive: true });
};

/**
 * Create new Teacher
 * @param {Object} teacherData
 * @returns {Promise<Object>}
 */
export const createTeacher = async (teacherData) => {
  return await Teacher.create(teacherData);
};

/**
 * Update Teacher by ID
 * @param {String} teacherId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateTeacher = async (teacherId, updateData) => {
  return await Teacher.findByIdAndUpdate(teacherId, updateData, { new: true })
    .populate("userId", "-password")
    .populate("collegeId");
};

/**
 * Get all Teachers with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllTeachers = async (options = {}) => {
  const { skip = 0, limit = 10 } = options;
  return await Teacher.find({ isActive: true })
    .populate("userId", "-password")
    .populate("collegeId")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count all Teachers
 * @returns {Promise<Number>}
 */
export const countAllTeachers = async () => {
  return await Teacher.countDocuments({ isActive: true });
};

/**
 * Search teachers by name, email, CNIC, or personal number (college-scoped)
 * @param {String} collegeId
 * @param {String} searchQuery
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const searchTeachersByCollege = async (
  collegeId,
  searchQuery,
  { skip = 0, limit = 10 }
) => {
  const regex = new RegExp(searchQuery, "i");

  return await Teacher.find({
    collegeId,
    isActive: true,
    $or: [
      { name: regex },
      { contactEmail: regex },
      { cnic: regex },
      { personalNumber: regex },
      { designation: regex },
      { contactNumber: regex },
    ],
  })
    .populate("userId", "-password")
    .populate("collegeId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count search results for teachers (college-scoped)
 * @param {String} collegeId
 * @param {String} searchQuery
 * @returns {Promise<Number>}
 */
export const countSearchTeachersByCollege = async (collegeId, searchQuery) => {
  const regex = new RegExp(searchQuery, "i");

  return await Teacher.countDocuments({
    collegeId,
    isActive: true,
    $or: [
      { name: regex },
      { contactEmail: regex },
      { cnic: regex },
      { personalNumber: regex },
      { designation: regex },
      { contactNumber: regex },
    ],
  });
};

/**
 * Search teachers by name, email, or CNIC
 * @param {String} searchQuery
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const searchTeachers = async (searchQuery, { skip = 0, limit = 10 }) => {
  const regex = new RegExp(searchQuery, "i");

  return await Teacher.find({
    isActive: true,
    $or: [{ name: regex }, { contactEmail: regex }, { cnic: regex }],
  })
    .populate("userId", "-password")
    .populate("collegeId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count search results for teachers
 * @param {String} searchQuery
 * @returns {Promise<Number>}
 */
export const countSearchTeachers = async (searchQuery) => {
  const regex = new RegExp(searchQuery, "i");

  return await Teacher.countDocuments({
    isActive: true,
    $or: [{ name: regex }, { contactEmail: regex }, { cnic: regex }],
  });
};

/**
 * Find teacher by ID
 * @param {String} teacherId
 * @returns {Promise<Object|null>}
 */
export const findTeacherById = async (teacherId) => {
  return await Teacher.findOne({ _id: teacherId, isActive: true })
    .populate("userId", "-password")
    .populate("collegeId");
};

/**
 * Find teacher by personal number
 * @param {String} personalNumber
 * @returns {Promise<Object|null>}
 */
export const findTeacherByPersonalNumber = async (personalNumber) => {
  return await Teacher.findOne({ personalNumber, isActive: true });
};

/**
 * Delete teacher (soft delete)
 * @param {String} teacherId
 * @returns {Promise<Object>}
 */
export const deleteTeacher = async (teacherId) => {
  return await Teacher.findByIdAndUpdate(
    teacherId,
    { isActive: false },
    { new: true }
  );
};

/**
 * Bulk create teachers
 * @param {Array} teachersData
 * @returns {Promise<Array>}
 */
export const bulkCreateTeachers = async (teachersData) => {
  return await Teacher.insertMany(teachersData, { ordered: false });
};

/**
 * Get all teachers for export (no pagination)
 * @param {String} collegeId
 * @returns {Promise<Array>}
 */
export const getAllTeachersForExport = async (collegeId) => {
  return await Teacher.find({ collegeId, isActive: true })
    .populate("userId", "email")
    .populate("collegeId", "name code")
    .sort({ name: 1 })
    .lean();
};

/**
 * Check if email exists (case-insensitive)
 * @param {String} email
 * @param {String} excludeTeacherId - Optional teacher ID to exclude from check
 * @returns {Promise<Boolean>}
 */
export const isEmailExists = async (email, excludeTeacherId = null) => {
  const query = { contactEmail: email.toLowerCase(), isActive: true };
  if (excludeTeacherId) {
    query._id = { $ne: excludeTeacherId };
  }
  const count = await Teacher.countDocuments(query);
  return count > 0;
};

/**
 * Check if CNIC exists
 * @param {String} cnic
 * @param {String} excludeTeacherId - Optional teacher ID to exclude from check
 * @returns {Promise<Boolean>}
 */
export const isCnicExists = async (cnic, excludeTeacherId = null) => {
  const query = { cnic, isActive: true };
  if (excludeTeacherId) {
    query._id = { $ne: excludeTeacherId };
  }
  const count = await Teacher.countDocuments(query);
  return count > 0;
};

/**
 * Check if personal number exists
 * @param {String} personalNumber
 * @param {String} excludeTeacherId - Optional teacher ID to exclude from check
 * @returns {Promise<Boolean>}
 */
export const isPersonalNumberExists = async (
  personalNumber,
  excludeTeacherId = null
) => {
  const query = { personalNumber, isActive: true };
  if (excludeTeacherId) {
    query._id = { $ne: excludeTeacherId };
  }
  const count = await Teacher.countDocuments(query);
  return count > 0;
};
