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
