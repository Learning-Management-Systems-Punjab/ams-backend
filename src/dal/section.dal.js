import Section from "../models/section.js";

/**
 * Find section by ID
 * @param {String} sectionId
 * @returns {Promise<Object|null>}
 */
export const findSectionById = async (sectionId) => {
  return await Section.findOne({ _id: sectionId, isActive: true })
    .populate("collegeId")
    .populate("programId")
    .populate("subjects");
};

/**
 * Find sections by college ID
 * @param {String} collegeId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findSectionsByCollegeId = async (collegeId, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return await Section.find({ collegeId, isActive: true })
    .populate("programId")
    .populate("subjects")
    .skip(skip)
    .limit(limit)
    .sort({ year: 1, name: 1 });
};

/**
 * Find sections by program ID
 * @param {String} programId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findSectionsByProgramId = async (programId, options = {}) => {
  const { skip = 0, limit = 50 } = options;
  return await Section.find({ programId, isActive: true })
    .populate("collegeId")
    .populate("subjects")
    .skip(skip)
    .limit(limit)
    .sort({ year: 1, name: 1 });
};

/**
 * Find section by roll number
 * @param {String} collegeId
 * @param {String} programId
 * @param {Number} rollNumber
 * @returns {Promise<Object|null>}
 */
export const findSectionByRollNumber = async (
  collegeId,
  programId,
  rollNumber
) => {
  return await Section.findOne({
    collegeId,
    programId,
    "rollNumberRange.start": { $lte: rollNumber },
    "rollNumberRange.end": { $gte: rollNumber },
    isActive: true,
  })
    .populate("collegeId")
    .populate("programId")
    .populate("subjects");
};

/**
 * Create new section
 * @param {Object} sectionData
 * @returns {Promise<Object>}
 */
export const createSection = async (sectionData) => {
  return await Section.create(sectionData);
};

/**
 * Update section by ID
 * @param {String} sectionId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateSection = async (sectionId, updateData) => {
  return await Section.findByIdAndUpdate(sectionId, updateData, { new: true })
    .populate("collegeId")
    .populate("programId")
    .populate("subjects");
};

/**
 * Increment section strength
 * @param {String} sectionId
 * @returns {Promise<Object|null>}
 */
export const incrementSectionStrength = async (sectionId) => {
  return await Section.findByIdAndUpdate(
    sectionId,
    { $inc: { currentStrength: 1 } },
    { new: true }
  );
};

/**
 * Decrement section strength
 * @param {String} sectionId
 * @returns {Promise<Object|null>}
 */
export const decrementSectionStrength = async (sectionId) => {
  return await Section.findByIdAndUpdate(
    sectionId,
    { $inc: { currentStrength: -1 } },
    { new: true }
  );
};

/**
 * Count sections by college ID
 * @param {String} collegeId
 * @returns {Promise<Number>}
 */
export const countSectionsByCollegeId = async (collegeId) => {
  return await Section.countDocuments({ collegeId, isActive: true });
};

/**
 * Add subject to section
 * @param {String} sectionId
 * @param {String} subjectId
 * @returns {Promise<Object|null>}
 */
export const addSubjectToSection = async (sectionId, subjectId) => {
  return await Section.findByIdAndUpdate(
    sectionId,
    { $addToSet: { subjects: subjectId } },
    { new: true }
  ).populate("subjects");
};
