import SubjectAssignment from "../models/subjectAssignment.js";

/**
 * Find assignment by ID
 * @param {String} assignmentId
 * @returns {Promise<Object|null>}
 */
export const findAssignmentById = async (assignmentId) => {
  return await SubjectAssignment.findOne({ _id: assignmentId, isActive: true })
    .populate("teacherId")
    .populate("subjectId")
    .populate("sectionId")
    .populate("collegeId");
};

/**
 * Find assignments by teacher ID
 * @param {String} teacherId
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>}
 */
export const findAssignmentsByTeacherId = async (teacherId, filters = {}) => {
  const query = { teacherId, isActive: true, ...filters };
  return await SubjectAssignment.find(query)
    .populate("subjectId")
    .populate("sectionId")
    .populate("collegeId")
    .sort({ academicYear: -1, semester: 1 });
};

/**
 * Find assignments by section ID
 * @param {String} sectionId
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>}
 */
export const findAssignmentsBySectionId = async (sectionId, filters = {}) => {
  const query = { sectionId, isActive: true, ...filters };
  return await SubjectAssignment.find(query)
    .populate("teacherId")
    .populate("subjectId")
    .populate("collegeId")
    .sort({ createdAt: -1 });
};

/**
 * Find assignments by college ID
 * @param {String} collegeId
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>}
 */
export const findAssignmentsByCollegeId = async (collegeId, filters = {}) => {
  const query = { collegeId, isActive: true, ...filters };
  return await SubjectAssignment.find(query)
    .populate("teacherId")
    .populate("subjectId")
    .populate("sectionId")
    .sort({ academicYear: -1, semester: 1 });
};

/**
 * Find assignment by unique criteria
 * @param {String} teacherId
 * @param {String} subjectId
 * @param {String} sectionId
 * @param {String} academicYear
 * @param {String} semester
 * @returns {Promise<Object|null>}
 */
export const findAssignmentByUniqueCriteria = async (
  teacherId,
  subjectId,
  sectionId,
  academicYear,
  semester
) => {
  return await SubjectAssignment.findOne({
    teacherId,
    subjectId,
    sectionId,
    academicYear,
    semester,
    isActive: true,
  });
};

/**
 * Create new assignment
 * @param {Object} assignmentData
 * @returns {Promise<Object>}
 */
export const createAssignment = async (assignmentData) => {
  return await SubjectAssignment.create(assignmentData);
};

/**
 * Update assignment by ID
 * @param {String} assignmentId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateAssignment = async (assignmentId, updateData) => {
  return await SubjectAssignment.findByIdAndUpdate(assignmentId, updateData, {
    new: true,
  })
    .populate("teacherId")
    .populate("subjectId")
    .populate("sectionId")
    .populate("collegeId");
};

/**
 * Delete assignment (soft delete)
 * @param {String} assignmentId
 * @returns {Promise<Object|null>}
 */
export const deleteAssignment = async (assignmentId) => {
  return await SubjectAssignment.findByIdAndUpdate(
    assignmentId,
    { isActive: false },
    { new: true }
  );
};

/**
 * Count assignments by teacher ID
 * @param {String} teacherId
 * @returns {Promise<Number>}
 */
export const countAssignmentsByTeacherId = async (teacherId) => {
  return await SubjectAssignment.countDocuments({ teacherId, isActive: true });
};

/**
 * Get teacher workload (count of sections)
 * @param {String} teacherId
 * @param {String} academicYear
 * @param {String} semester
 * @returns {Promise<Number>}
 */
export const getTeacherWorkload = async (teacherId, academicYear, semester) => {
  const assignments = await SubjectAssignment.find({
    teacherId,
    academicYear,
    semester,
    isActive: true,
  }).distinct("sectionId");
  return assignments.length;
};
