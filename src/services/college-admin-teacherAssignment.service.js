import {
  createTeacherAssignment,
  findTeacherAssignmentById,
  findAssignmentsByTeacher,
  findAssignmentsBySection,
  findAllAssignmentsByCollege,
  countAssignmentsByCollege,
  isAssignmentExists,
  updateTeacherAssignment,
  deleteTeacherAssignment,
} from "../dal/teacherAssignment.dal.js";
import { findCollegeById } from "../dal/college.dal.js";
import { findSubjectById } from "../dal/subject.dal.js";
import { findSectionById } from "../dal/section.dal.js";

/**
 * Create teacher assignment (college-scoped)
 * @param {Object} assignmentData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const createTeacherAssignmentService = async (
  assignmentData,
  collegeId
) => {
  // Validate college
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Validate section and get program
  const section = await findSectionById(assignmentData.sectionId);
  if (!section) {
    throw new Error("Section not found");
  }
  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // Validate subject
  const subject = await findSubjectById(assignmentData.subjectId, collegeId);
  if (!subject) {
    throw new Error("Subject not found");
  }

  // Check if assignment already exists
  const exists = await isAssignmentExists(
    collegeId,
    assignmentData.teacherId,
    assignmentData.subjectId,
    assignmentData.sectionId,
    assignmentData.academicYear,
    assignmentData.semester
  );

  if (exists) {
    throw new Error(
      "This teacher is already assigned to this section for this subject"
    );
  }

  const assignment = await createTeacherAssignment({
    ...assignmentData,
    collegeId,
    programId: section.programId._id,
  });

  return await findTeacherAssignmentById(assignment._id, collegeId);
};

/**
 * Get all assignments for college with pagination
 * @param {String} collegeId
 * @param {Number} page
 * @param {Number} limit
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export const getAllAssignmentsService = async (
  collegeId,
  page = 1,
  limit = 50,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    findAllAssignmentsByCollege(collegeId, { skip, limit, ...filters }),
    countAssignmentsByCollege(collegeId, filters),
  ]);

  return {
    assignments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get assignments by teacher (college-scoped)
 * @param {String} collegeId
 * @param {String} teacherId
 * @param {Number} page
 * @param {Number} limit
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export const getAssignmentsByTeacherService = async (
  collegeId,
  teacherId,
  page = 1,
  limit = 50,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  const assignments = await findAssignmentsByTeacher(collegeId, teacherId, {
    skip,
    limit,
    ...filters,
  });

  return {
    assignments,
    pagination: {
      total: assignments.length,
      page,
      limit,
      pages: Math.ceil(assignments.length / limit),
    },
  };
};

/**
 * Get assignments by section (college-scoped)
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAssignmentsBySectionService = async (
  collegeId,
  sectionId,
  page = 1,
  limit = 50
) => {
  const skip = (page - 1) * limit;

  // Validate section belongs to college
  const section = await findSectionById(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }
  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  const assignments = await findAssignmentsBySection(collegeId, sectionId, {
    skip,
    limit,
  });

  return {
    assignments,
    pagination: {
      total: assignments.length,
      page,
      limit,
      pages: Math.ceil(assignments.length / limit),
    },
  };
};

/**
 * Update teacher assignment (college-scoped)
 * @param {String} assignmentId
 * @param {Object} updateData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const updateTeacherAssignmentService = async (
  assignmentId,
  updateData,
  collegeId
) => {
  const assignment = await findTeacherAssignmentById(assignmentId, collegeId);

  if (!assignment) {
    throw new Error("Teacher assignment not found");
  }

  // Prevent updating collegeId, programId
  delete updateData.collegeId;
  delete updateData.programId;

  const updatedAssignment = await updateTeacherAssignment(
    assignmentId,
    collegeId,
    updateData
  );

  return updatedAssignment;
};

/**
 * Delete teacher assignment (soft delete, college-scoped)
 * @param {String} assignmentId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const deleteTeacherAssignmentService = async (
  assignmentId,
  collegeId
) => {
  const assignment = await findTeacherAssignmentById(assignmentId, collegeId);

  if (!assignment) {
    throw new Error("Teacher assignment not found");
  }

  await deleteTeacherAssignment(assignmentId, collegeId);

  return {
    message: "Teacher assignment deleted successfully",
    assignmentId,
  };
};
