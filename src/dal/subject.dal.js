import Subject from "../models/subject.js";

/**
 * Find subject by ID and college
 * @param {String} subjectId
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const findSubjectById = async (subjectId, collegeId) => {
  return await Subject.findOne({ _id: subjectId, collegeId, isActive: true });
};

/**
 * Find subject by code and college
 * @param {String} collegeId
 * @param {String} code
 * @returns {Promise<Object|null>}
 */
export const findSubjectByCode = async (collegeId, code) => {
  return await Subject.findOne({
    collegeId,
    code: code.toUpperCase(),
    isActive: true,
  });
};

/**
 * Find subject by name and college
 * @param {String} collegeId
 * @param {String} name
 * @returns {Promise<Object|null>}
 */
export const findSubjectByName = async (collegeId, name) => {
  return await Subject.findOne({
    collegeId,
    name: new RegExp(`^${name}$`, "i"),
    isActive: true,
  });
};

/**
 * Create new subject
 * @param {Object} subjectData
 * @returns {Promise<Object>}
 */
export const createSubject = async (subjectData) => {
  return await Subject.create(subjectData);
};

/**
 * Update subject by ID
 * @param {String} subjectId
 * @param {String} collegeId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateSubject = async (subjectId, collegeId, updateData) => {
  return await Subject.findOneAndUpdate(
    { _id: subjectId, collegeId },
    updateData,
    { new: true }
  );
};

/**
 * Get all subjects by college with pagination
 * @param {String} collegeId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllSubjectsByCollege = async (collegeId, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return await Subject.find({ collegeId, isActive: true })
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
};

/**
 * Count subjects by college
 * @param {String} collegeId
 * @returns {Promise<Number>}
 */
export const countSubjectsByCollege = async (collegeId) => {
  return await Subject.countDocuments({ collegeId, isActive: true });
};

/**
 * Find subjects by IDs and college
 * @param {String} collegeId
 * @param {Array<String>} subjectIds
 * @returns {Promise<Array>}
 */
export const findSubjectsByIds = async (collegeId, subjectIds) => {
  return await Subject.find({
    _id: { $in: subjectIds },
    collegeId,
    isActive: true,
  });
};

/**
 * Find or create subject by name
 * @param {String} collegeId
 * @param {String} name
 * @param {String} code
 * @returns {Promise<Object>}
 */
export const findOrCreateSubject = async (collegeId, name, code) => {
  let subject = await findSubjectByName(collegeId, name);
  if (!subject) {
    subject = await createSubject({ collegeId, name, code });
  }
  return subject;
};
