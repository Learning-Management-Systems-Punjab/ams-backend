import {
  createSubject,
  findSubjectById,
  findSubjectByName,
  findSubjectByCode,
  getAllSubjectsByCollege,
  countSubjectsByCollege,
  updateSubject,
} from "../dal/subject.dal.js";
import { findCollegeById } from "../dal/college.dal.js";

/**
 * Create new subject (college-scoped)
 * @param {Object} subjectData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const createSubjectService = async (subjectData, collegeId) => {
  // Validate college exists
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Check if subject code already exists
  const existingCode = await findSubjectByCode(collegeId, subjectData.code);
  if (existingCode) {
    throw new Error(`Subject code ${subjectData.code} already exists`);
  }

  // Check if subject name already exists
  const existingName = await findSubjectByName(collegeId, subjectData.name);
  if (existingName) {
    throw new Error(`Subject name ${subjectData.name} already exists`);
  }

  const subject = await createSubject({
    ...subjectData,
    collegeId,
  });

  return subject;
};

/**
 * Get all subjects for college with pagination
 * @param {String} collegeId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllSubjectsService = async (
  collegeId,
  page = 1,
  limit = 50
) => {
  const skip = (page - 1) * limit;

  const [subjects, total] = await Promise.all([
    getAllSubjectsByCollege(collegeId, { skip, limit }),
    countSubjectsByCollege(collegeId),
  ]);

  return {
    subjects,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get subject by ID (college-scoped)
 * @param {String} subjectId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const getSubjectByIdService = async (subjectId, collegeId) => {
  const subject = await findSubjectById(subjectId, collegeId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  return subject;
};

/**
 * Update subject (college-scoped)
 * @param {String} subjectId
 * @param {Object} updateData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const updateSubjectService = async (
  subjectId,
  updateData,
  collegeId
) => {
  const subject = await findSubjectById(subjectId, collegeId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  // Check if updating code and it already exists
  if (updateData.code && updateData.code !== subject.code) {
    const existingCode = await findSubjectByCode(collegeId, updateData.code);
    if (existingCode) {
      throw new Error(`Subject code ${updateData.code} already exists`);
    }
  }

  // Check if updating name and it already exists
  if (updateData.name && updateData.name !== subject.name) {
    const existingName = await findSubjectByName(collegeId, updateData.name);
    if (existingName) {
      throw new Error(`Subject name ${updateData.name} already exists`);
    }
  }

  // Prevent updating collegeId
  delete updateData.collegeId;

  const updatedSubject = await updateSubject(subjectId, collegeId, updateData);
  return updatedSubject;
};

/**
 * Delete subject (soft delete, college-scoped)
 * @param {String} subjectId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const deleteSubjectService = async (subjectId, collegeId) => {
  const subject = await findSubjectById(subjectId, collegeId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  await updateSubject(subjectId, collegeId, { isActive: false });

  return {
    message: "Subject deleted successfully",
    subjectId,
  };
};
