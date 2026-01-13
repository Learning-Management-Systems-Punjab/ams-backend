import Program from "../models/program.js";

/**
 * Find program by ID and college
 * @param {String} programId
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const findProgramById = async (programId, collegeId) => {
  return await Program.findOne({ _id: programId, collegeId, isActive: true }).populate("subjects");
};

/**
 * Find program by code and college
 * @param {String} collegeId
 * @param {String} code
 * @returns {Promise<Object|null>}
 */
export const findProgramByCode = async (collegeId, code) => {
  return await Program.findOne({ collegeId, code: code.toUpperCase(), isActive: true }).populate("subjects");
};

/**
 * Find program by name and college
 * @param {String} collegeId
 * @param {String} name
 * @returns {Promise<Object|null>}
 */
export const findProgramByName = async (collegeId, name) => {
  return await Program.findOne({ collegeId, name: new RegExp(`^${name}$`, 'i'), isActive: true }).populate("subjects");
};

/**
 * Create new program
 * @param {Object} programData
 * @returns {Promise<Object>}
 */
export const createProgram = async (programData) => {
  return await Program.create(programData);
};

/**
 * Update program by ID
 * @param {String} programId
 * @param {String} collegeId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateProgram = async (programId, collegeId, updateData) => {
  return await Program.findOneAndUpdate(
    { _id: programId, collegeId },
    updateData,
    { new: true }
  ).populate("subjects");
};

/**
 * Get all programs by college with pagination
 * @param {String} collegeId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllProgramsByCollege = async (collegeId, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return await Program.find({ collegeId, isActive: true })
    .populate("subjects")
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });
};

/**
 * Count programs by college
 * @param {String} collegeId
 * @returns {Promise<Number>}
 */
export const countProgramsByCollege = async (collegeId) => {
  return await Program.countDocuments({ collegeId, isActive: true });
};

/**
 * Add subject to program
 * @param {String} programId
 * @param {String} collegeId
 * @param {String} subjectId
 * @returns {Promise<Object|null>}
 */
export const addSubjectToProgram = async (programId, collegeId, subjectId) => {
  return await Program.findOneAndUpdate(
    { _id: programId, collegeId },
    { $addToSet: { subjects: subjectId } },
    { new: true }
  ).populate("subjects");
};

/**
 * Remove subject from program
 * @param {String} programId
 * @param {String} collegeId
 * @param {String} subjectId
 * @returns {Promise<Object|null>}
 */
export const removeSubjectFromProgram = async (programId, collegeId, subjectId) => {
  return await Program.findOneAndUpdate(
    { _id: programId, collegeId },
    { $pull: { subjects: subjectId } },
    { new: true }
  ).populate("subjects");
};

/**
 * Find or create program by name
 * @param {String} collegeId
 * @param {String} name
 * @param {String} code
 * @param {Number} duration
 * @returns {Promise<Object>}
 */
export const findOrCreateProgram = async (collegeId, name, code, duration = 2) => {
  let program = await findProgramByName(collegeId, name);
  if (!program) {
    program = await createProgram({ collegeId, name, code, duration, subjects: [] });
  }
  return program;
};
