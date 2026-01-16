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

/**
 * Get all subjects with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllSubjects = async ({ skip = 0, limit = 10 }) => {
  return await Subject.find({ isActive: true })
    .populate("collegeId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count all subjects
 * @returns {Promise<Number>}
 */
export const countAllSubjects = async () => {
  return await Subject.countDocuments({ isActive: true });
};

/**
 * Search subjects by name or code
 * @param {String} searchQuery
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const searchSubjects = async (searchQuery, { skip = 0, limit = 10 }) => {
  const regex = new RegExp(searchQuery, "i");

  return await Subject.find({
    isActive: true,
    $or: [{ name: regex }, { code: regex }],
  })
    .populate("collegeId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count search results for subjects
 * @param {String} searchQuery
 * @returns {Promise<Number>}
 */
export const countSearchSubjects = async (searchQuery) => {
  const regex = new RegExp(searchQuery, "i");

  return await Subject.countDocuments({
    isActive: true,
    $or: [{ name: regex }, { code: regex }],
  });
};

/**
 * Find subject by ID (global)
 * @param {String} subjectId
 * @returns {Promise<Object|null>}
 */
export const findSubjectByIdGlobal = async (subjectId) => {
  return await Subject.findOne({ _id: subjectId, isActive: true }).populate(
    "collegeId",
    "name code"
  );
};
