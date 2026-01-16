import {
  getAllStudents,
  countAllStudents,
  findStudentById,
  searchStudents,
  countSearchStudents,
  findStudentByUserId,
  findStudentsBySectionId,
} from "../dal/student.dal.js";
import { findSectionById } from "../dal/section.dal.js";
import { findSubjectsByIds } from "../dal/subject.dal.js";
import { findAssignmentsBySection } from "../dal/teacherAssignment.dal.js";
import {
  findAttendanceByStudent,
  countAttendance,
  getAttendanceStatsByStudent,
} from "../dal/attendance.dal.js";

/**
 * Get all students with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllStudentsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [students, totalCount] = await Promise.all([
    getAllStudents({ skip, limit }),
    countAllStudents(),
  ]);

  return {
    students,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get student by ID
 * @param {String} studentId
 * @returns {Promise<Object>}
 */
export const getStudentByIdService = async (studentId) => {
  const student = await findStudentById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
};

/**
 * Search students
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchStudentsService = async (
  searchQuery,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [students, totalCount] = await Promise.all([
    searchStudents(searchQuery, { skip, limit }),
    countSearchStudents(searchQuery),
  ]);

  return {
    students,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
    searchQuery,
  };
};

// ============================================
// STUDENT-SPECIFIC OPERATIONS (STUDENT PORTAL)
// ============================================

/**
 * Get student's profile information
 * @param {String} userId - User ID from JWT token
 * @returns {Promise<Object>}
 */
export const getMyProfileService = async (userId) => {
  const student = await findStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  return student;
};

/**
 * Get student's section details with subjects and teachers
 * @param {String} userId - User ID from JWT token
 * @returns {Promise<Object>}
 */
export const getMySectionDetailsService = async (userId) => {
  const student = await findStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  if (!student.section) {
    throw new Error("You are not assigned to any section yet");
  }

  const collegeId = student.college._id || student.college;
  const sectionId = student.section._id || student.section;

  // Get section details
  const section = await findSectionById(sectionId, collegeId);

  if (!section) {
    throw new Error("Section not found");
  }

  // Get teacher assignments for this section
  const assignments = await findAssignmentsBySection(collegeId, sectionId);

  // Extract unique subject IDs
  const subjectIds = [
    ...new Set(
      assignments.map((a) =>
        typeof a.subject === "object" ? a.subject._id : a.subject
      )
    ),
  ];

  // Get subject details
  const subjects = await findSubjectsByIds(subjectIds, collegeId);

  // Map subjects with their teachers
  const subjectsWithTeachers = subjects.map((subject) => {
    const subjectAssignments = assignments.filter((a) => {
      const subjectIdFromAssignment =
        typeof a.subject === "object" ? a.subject._id : a.subject;
      return subjectIdFromAssignment.toString() === subject._id.toString();
    });

    return {
      ...subject.toObject(),
      teachers: subjectAssignments.map((a) => ({
        _id: a.teacher._id,
        firstName: a.teacher.firstName,
        lastName: a.teacher.lastName,
        email: a.teacher.email,
      })),
    };
  });

  return {
    section: {
      _id: section._id,
      name: section.name,
      semester: section.semester,
      year: section.year,
      program: section.program,
    },
    subjects: subjectsWithTeachers,
    totalSubjects: subjectsWithTeachers.length,
  };
};

/**
 * Get student's attendance records with pagination
 * @param {String} userId - User ID from JWT token
 * @param {Number} page
 * @param {Number} limit
 * @param {String} subjectId - Optional filter by subject
 * @param {Date} startDate - Optional filter by start date
 * @param {Date} endDate - Optional filter by end date
 * @returns {Promise<Object>}
 */
export const getMyAttendanceService = async (
  userId,
  page = 1,
  limit = 50,
  subjectId = null,
  startDate = null,
  endDate = null
) => {
  const student = await findStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  const collegeId = student.college._id || student.college;
  const skip = (page - 1) * limit;

  // Build filters
  const filters = {};
  if (subjectId) {
    filters.subjectId = subjectId;
  }
  if (startDate) {
    filters.startDate = startDate;
  }
  if (endDate) {
    filters.endDate = endDate;
  }

  const [attendance, totalCount] = await Promise.all([
    findAttendanceByStudent(collegeId, student._id, filters, { skip, limit }),
    countAttendance(collegeId, { studentId: student._id, ...filters }),
  ]);

  return {
    attendance,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get student's attendance statistics
 * @param {String} userId - User ID from JWT token
 * @param {String} subjectId - Optional filter by subject
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 * @returns {Promise<Object>}
 */
export const getMyAttendanceStatsService = async (
  userId,
  subjectId = null,
  startDate = null,
  endDate = null
) => {
  const student = await findStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  const stats = await getAttendanceStatsByStudent(
    student.collegeId,
    student._id,
    subjectId,
    startDate,
    endDate
  );

  return stats;
};

/**
 * Get student's attendance for a specific subject
 * @param {String} userId - User ID from JWT token
 * @param {String} subjectId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getMyAttendanceBySubjectService = async (
  userId,
  subjectId,
  page = 1,
  limit = 50
) => {
  const student = await findStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  const collegeId = student.college._id || student.college;
  const skip = (page - 1) * limit;

  const filters = { subjectId };

  const [attendance, totalCount] = await Promise.all([
    findAttendanceByStudent(collegeId, student._id, filters, { skip, limit }),
    countAttendance(collegeId, { studentId: student._id, subjectId }),
  ]);

  return {
    attendance,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get student's overall attendance summary
 * @param {String} userId - User ID from JWT token
 * @returns {Promise<Object>}
 */
export const getMyAttendanceSummaryService = async (userId) => {
  const student = await findStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  if (!student.section) {
    return {
      message: "Not assigned to any section",
      totalSubjects: 0,
      subjects: [],
    };
  }

  // Get section details with subjects
  const sectionDetails = await getMySectionDetailsService(userId);

  // Get stats for each subject
  const subjectStats = await Promise.all(
    sectionDetails.subjects.map(async (subject) => {
      const stats = await getAttendanceStatsByStudent(
        student.collegeId,
        student._id,
        subject._id,
        null,
        null
      );

      return {
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code,
        },
        teachers: subject.teachers,
        ...stats,
      };
    })
  );

  // Calculate overall stats
  const totalClasses = subjectStats.reduce((sum, s) => sum + s.totalClasses, 0);
  const totalPresent = subjectStats.reduce((sum, s) => sum + s.present, 0);
  const totalAbsent = subjectStats.reduce((sum, s) => sum + s.absent, 0);
  const totalLate = subjectStats.reduce((sum, s) => sum + s.late, 0);
  const totalExcused = subjectStats.reduce((sum, s) => sum + s.excused, 0);

  const overallPercentage =
    totalClasses > 0 ? ((totalPresent + totalLate) / totalClasses) * 100 : 0;

  return {
    overall: {
      totalClasses,
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      excused: totalExcused,
      attendancePercentage: parseFloat(overallPercentage.toFixed(2)),
    },
    subjects: subjectStats,
    section: sectionDetails.section,
  };
};

/**
 * Get student's classmates (students in same section)
 * @param {String} userId - User ID from JWT token
 * @returns {Promise<Array>}
 */
export const getMyClassmatesService = async (userId) => {
  const student = await findStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  if (!student.section) {
    throw new Error("You are not assigned to any section yet");
  }

  const sectionId = student.section._id || student.section;
  const classmates = await findStudentsBySectionId(sectionId);

  // Filter out the current student
  return classmates.filter((c) => c._id.toString() !== student._id.toString());
};
