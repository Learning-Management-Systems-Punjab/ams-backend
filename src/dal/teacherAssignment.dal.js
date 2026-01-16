import TeacherAssignment from "../models/teacherAssignment.js";

/**
 * Create teacher assignment
 * @param {Object} assignmentData
 * @returns {Promise<Object>}
 */
export const createTeacherAssignment = async (assignmentData) => {
  return await TeacherAssignment.create(assignmentData);
};

/**
 * Find teacher assignment by ID (college-scoped)
 * @param {String} assignmentId
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const findTeacherAssignmentById = async (assignmentId, collegeId) => {
  return await TeacherAssignment.findOne({
    _id: assignmentId,
    collegeId,
    isActive: true,
  })
    .populate("teacherId", "name cnic designation")
    .populate("subjectId", "name code")
    .populate("sectionId", "name year shift")
    .populate("programId", "name code");
};

/**
 * Find all assignments for a teacher (college-scoped)
 * @param {String} collegeId
 * @param {String} teacherId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findAssignmentsByTeacher = async (
  collegeId,
  teacherId,
  options = {}
) => {
  const { skip = 0, limit = 50, academicYear, semester } = options;

  const query = { collegeId, teacherId, isActive: true };
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;

  return await TeacherAssignment.find(query)
    .populate("subjectId", "name code")
    .populate("sectionId", "name year shift")
    .populate("programId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count assignments for a teacher (college-scoped)
 * @param {String} collegeId
 * @param {String} teacherId
 * @param {Object} filters
 * @returns {Promise<Number>}
 */
export const countAssignmentsByTeacher = async (
  collegeId,
  teacherId,
  filters = {}
) => {
  const { academicYear, semester } = filters;

  const query = { collegeId, teacherId, isActive: true };
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;

  return await TeacherAssignment.countDocuments(query);
};

/**
 * Find all assignments for a section (college-scoped)
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export const findAssignmentsBySection = async (
  collegeId,
  sectionId,
  options = {}
) => {
  const { skip = 0, limit = 50 } = options;

  return await TeacherAssignment.find({
    collegeId,
    sectionId,
    isActive: true,
  })
    .populate("teacherId", "name cnic designation")
    .populate("subjectId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Find all assignments for college with pagination
 * @param {String} collegeId
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export const findAllAssignmentsByCollege = async (collegeId, options = {}) => {
  const { skip = 0, limit = 50, academicYear, semester, programId } = options;

  const query = { collegeId, isActive: true };
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;
  if (programId) query.programId = programId;

  return await TeacherAssignment.find(query)
    .populate("teacherId", "name cnic designation")
    .populate("subjectId", "name code")
    .populate("sectionId", "name year shift")
    .populate("programId", "name code")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count assignments by college
 * @param {String} collegeId
 * @param {Object} filters
 * @returns {Promise<Number>}
 */
export const countAssignmentsByCollege = async (collegeId, filters = {}) => {
  const query = { collegeId, isActive: true };
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.semester) query.semester = filters.semester;
  if (filters.programId) query.programId = filters.programId;

  return await TeacherAssignment.countDocuments(query);
};

/**
 * Check if assignment exists
 * @param {String} collegeId
 * @param {String} teacherId
 * @param {String} subjectId
 * @param {String} sectionId
 * @param {String} academicYear
 * @param {String} semester
 * @returns {Promise<Boolean>}
 */
export const isAssignmentExists = async (
  collegeId,
  teacherId,
  subjectId,
  sectionId,
  academicYear,
  semester
) => {
  const assignment = await TeacherAssignment.findOne({
    collegeId,
    teacherId,
    subjectId,
    sectionId,
    academicYear,
    semester,
    isActive: true,
  });

  return !!assignment;
};

/**
 * Update teacher assignment
 * @param {String} assignmentId
 * @param {String} collegeId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateTeacherAssignment = async (
  assignmentId,
  collegeId,
  updateData
) => {
  return await TeacherAssignment.findOneAndUpdate(
    { _id: assignmentId, collegeId },
    updateData,
    { new: true }
  )
    .populate("teacherId", "name cnic designation")
    .populate("subjectId", "name code")
    .populate("sectionId", "name year shift")
    .populate("programId", "name code");
};

/**
 * Delete (soft delete) teacher assignment
 * @param {String} assignmentId
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const deleteTeacherAssignment = async (assignmentId, collegeId) => {
  return await TeacherAssignment.findOneAndUpdate(
    { _id: assignmentId, collegeId },
    { isActive: false },
    { new: true }
  );
};

/**
 * Find teacher assigned to a section for a specific subject
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @returns {Promise<Object|null>}
 */
export const findTeacherForSectionSubject = async (
  collegeId,
  sectionId,
  subjectId
) => {
  return await TeacherAssignment.findOne({
    collegeId,
    sectionId,
    subjectId,
    isActive: true,
  }).populate("teacherId", "name cnic designation");
};
