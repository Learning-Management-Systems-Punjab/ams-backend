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
import { findTeacherById } from "../dal/teacher.dal.js";

/**
 * Create teacher assignment (college-scoped)
 * @param {Object} assignmentData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const createTeacherAssignmentService = async (
  assignmentData,
  collegeId,
) => {
  // Validate college
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Validate teacher belongs to this college
  const teacher = await findTeacherById(assignmentData.teacherId);
  if (!teacher) {
    throw new Error("Teacher not found");
  }
  const teacherCollegeId =
    teacher.collegeId?._id?.toString() || teacher.collegeId?.toString();
  if (teacherCollegeId !== collegeId.toString()) {
    throw new Error("Teacher does not belong to your college");
  }

  // Validate section and get program
  const section = await findSectionById(assignmentData.sectionId);
  if (!section) {
    throw new Error("Section not found");
  }

  // Handle both populated and non-populated collegeId
  const sectionCollegeId =
    section.collegeId?._id?.toString() || section.collegeId?.toString();
  if (sectionCollegeId !== collegeId.toString()) {
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
    assignmentData.semester,
  );

  if (exists) {
    throw new Error(
      "This teacher is already assigned to this section for this subject",
    );
  }

  // Handle both populated and non-populated programId
  const programId = section.programId?._id || section.programId;

  const assignment = await createTeacherAssignment({
    ...assignmentData,
    collegeId,
    programId,
  });

  // Get the created assignment with populated fields
  const createdAssignment = await findTeacherAssignmentById(
    assignment._id,
    collegeId,
  );

  // Transform to match frontend expected format
  return {
    _id: createdAssignment._id,
    teacherId:
      createdAssignment.teacherId?._id?.toString() ||
      createdAssignment.teacherId,
    teacher: createdAssignment.teacherId
      ? {
          _id: createdAssignment.teacherId._id,
          name: createdAssignment.teacherId.name,
          email: createdAssignment.teacherId.contactEmail,
          contactNumber: createdAssignment.teacherId.contactNumber,
        }
      : null,
    subjectId:
      createdAssignment.subjectId?._id?.toString() ||
      createdAssignment.subjectId,
    subject: createdAssignment.subjectId
      ? {
          _id: createdAssignment.subjectId._id,
          name: createdAssignment.subjectId.name,
          code: createdAssignment.subjectId.code,
        }
      : null,
    sectionId:
      createdAssignment.sectionId?._id?.toString() ||
      createdAssignment.sectionId,
    section: createdAssignment.sectionId
      ? {
          _id: createdAssignment.sectionId._id,
          name: createdAssignment.sectionId.name,
          year: createdAssignment.sectionId.year,
          shift: createdAssignment.sectionId.shift,
        }
      : null,
    academicYear: createdAssignment.academicYear,
    semester: createdAssignment.semester,
    collegeId:
      createdAssignment.collegeId?.toString() || createdAssignment.collegeId,
    isActive: createdAssignment.isActive,
    createdAt: createdAssignment.createdAt,
    updatedAt: createdAssignment.updatedAt,
  };
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
  filters = {},
) => {
  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    findAllAssignmentsByCollege(collegeId, { skip, limit, ...filters }),
    countAssignmentsByCollege(collegeId, filters),
  ]);

  // Transform assignments to match frontend expected format
  const transformedAssignments = assignments.map((a) => ({
    _id: a._id,
    teacherId: a.teacherId?._id?.toString() || a.teacherId,
    teacher: a.teacherId
      ? {
          _id: a.teacherId._id,
          name: a.teacherId.name,
          email: a.teacherId.contactEmail,
          contactNumber: a.teacherId.contactNumber,
        }
      : null,
    subjectId: a.subjectId?._id?.toString() || a.subjectId,
    subject: a.subjectId
      ? {
          _id: a.subjectId._id,
          name: a.subjectId.name,
          code: a.subjectId.code,
        }
      : null,
    sectionId: a.sectionId?._id?.toString() || a.sectionId,
    section: a.sectionId
      ? {
          _id: a.sectionId._id,
          name: a.sectionId.name,
          year: a.sectionId.year,
          shift: a.sectionId.shift,
        }
      : null,
    academicYear: a.academicYear,
    semester: a.semester,
    collegeId: a.collegeId?.toString() || a.collegeId,
    isActive: a.isActive,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  return {
    assignments: transformedAssignments,
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
  filters = {},
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
  limit = 50,
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
  collegeId,
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
    updateData,
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
  collegeId,
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
