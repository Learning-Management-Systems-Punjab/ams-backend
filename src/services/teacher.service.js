import {
  getAllTeachers,
  countAllTeachers,
  findTeacherById,
  searchTeachers,
  countSearchTeachers,
} from "../dal/teacher.dal.js";
import {
  findAssignmentsByTeacher,
  countAssignmentsByTeacher,
  findTeacherForSectionSubject,
} from "../dal/teacherAssignment.dal.js";
import { findSectionById } from "../dal/section.dal.js";
import { findStudentsBySectionId } from "../dal/student.dal.js";
import {
  bulkCreateAttendance,
  isAttendanceMarked,
  findAttendanceBySectionDate,
  getAttendanceStatsByStudent,
  getAttendanceStatsBySection,
} from "../dal/attendance.dal.js";

/**
 * Get all teachers with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllTeachersService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [teachers, totalCount] = await Promise.all([
    getAllTeachers({ skip, limit }),
    countAllTeachers(),
  ]);

  return {
    teachers,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get teacher by ID
 * @param {String} teacherId
 * @returns {Promise<Object>}
 */
export const getTeacherByIdService = async (teacherId) => {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  return teacher;
};

/**
 * Search teachers
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchTeachersService = async (
  searchQuery,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [teachers, totalCount] = await Promise.all([
    searchTeachers(searchQuery, { skip, limit }),
    countSearchTeachers(searchQuery),
  ]);

  return {
    teachers,
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
// TEACHER-SPECIFIC OPERATIONS (SCOPED TO ASSIGNMENTS)
// ============================================

/**
 * Get teacher's assignments with pagination
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getMyAssignmentsService = async (
  teacherId,
  collegeId,
  page = 1,
  limit = 50
) => {
  const skip = (page - 1) * limit;

  const [assignments, totalCount] = await Promise.all([
    findAssignmentsByTeacher(collegeId, teacherId, { skip, limit }),
    countAssignmentsByTeacher(collegeId, teacherId),
  ]);

  return {
    assignments,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get unique sections assigned to teacher
 * @param {String} teacherId
 * @param {String} collegeId
 * @returns {Promise<Array>}
 */
export const getMySectionsService = async (teacherId, collegeId) => {
  const assignments = await findAssignmentsByTeacher(collegeId, teacherId, {
    skip: 0,
    limit: 1000,
  });

  // Extract unique sections (already populated from assignments)
  const uniqueSections = new Map();
  assignments.forEach((a) => {
    if (a.sectionId && !uniqueSections.has(a.sectionId._id.toString())) {
      uniqueSections.set(a.sectionId._id.toString(), a.sectionId);
    }
  });

  return Array.from(uniqueSections.values());
};

/**
 * Get unique subjects assigned to teacher
 * @param {String} teacherId
 * @param {String} collegeId
 * @returns {Promise<Array>}
 */
export const getMySubjectsService = async (teacherId, collegeId) => {
  const assignments = await findAssignmentsByTeacher(collegeId, teacherId, {
    skip: 0,
    limit: 1000,
  });

  // Extract unique subjects (already populated from assignments)
  const uniqueSubjects = new Map();
  assignments.forEach((a) => {
    if (a.subjectId && !uniqueSubjects.has(a.subjectId._id.toString())) {
      uniqueSubjects.set(a.subjectId._id.toString(), a.subjectId);
    }
  });

  return Array.from(uniqueSubjects.values());
};

/**
 * Get students in a section (validates teacher is assigned to that section)
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {String} sectionId
 * @returns {Promise<Array>}
 */
export const getStudentsInMySectionService = async (
  teacherId,
  collegeId,
  sectionId
) => {
  // Validate section exists and belongs to college
  const section = await findSectionById(sectionId, collegeId);
  if (!section) {
    throw new Error("Section not found");
  }

  // Validate teacher is assigned to this section (for any subject)
  const assignments = await findAssignmentsByTeacher(collegeId, teacherId, {
    skip: 0,
    limit: 1000,
  });

  const isAssignedToSection = assignments.some(
    (a) => a.sectionId._id.toString() === sectionId
  );

  if (!isAssignedToSection) {
    throw new Error("You are not assigned to teach this section");
  }

  // Get students
  const students = await findStudentsBySectionId(sectionId);

  return students;
};

/**
 * Mark attendance (validates teacher is assigned to section+subject)
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} date
 * @param {Number} period
 * @param {Array} attendanceRecords
 * @returns {Promise<Array>}
 */
export const markAttendanceByTeacherService = async (
  teacherId,
  collegeId,
  sectionId,
  subjectId,
  date,
  period,
  attendanceRecords
) => {
  // Validate section exists and belongs to college
  const section = await findSectionById(sectionId, collegeId);
  if (!section) {
    throw new Error("Section not found");
  }

  // CRITICAL: Validate teacher is assigned to this section+subject combination
  const assignment = await findTeacherForSectionSubject(
    collegeId,
    sectionId,
    subjectId,
    teacherId
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section"
    );
  }

  // Check if attendance already marked for this section/subject/date/period
  const alreadyMarked = await isAttendanceMarked(
    sectionId,
    subjectId,
    date,
    period
  );

  if (alreadyMarked) {
    throw new Error(
      "Attendance has already been marked for this section, subject, date, and period"
    );
  }

  // Prepare attendance records with markedBy field
  const attendanceData = attendanceRecords.map((record) => ({
    student: record.studentId,
    section: sectionId,
    subject: subjectId,
    date,
    period,
    status: record.status,
    markedBy: teacherId,
  }));

  // Mark attendance
  const attendance = await bulkCreateAttendance(attendanceData);

  return attendance;
};

/**
 * Get attendance for a section by date (validates teacher is assigned)
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} date
 * @param {Number} period
 * @returns {Promise<Array>}
 */
export const getMyAttendanceBySectionDateService = async (
  teacherId,
  collegeId,
  sectionId,
  subjectId,
  date,
  period
) => {
  // Validate section exists
  const section = await findSectionById(sectionId, collegeId);
  if (!section) {
    throw new Error("Section not found");
  }

  // Validate teacher is assigned to this section+subject
  const assignment = await findTeacherForSectionSubject(
    collegeId,
    sectionId,
    subjectId,
    teacherId
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section"
    );
  }

  // Get attendance
  const attendance = await findAttendanceBySectionDate(
    collegeId,
    sectionId,
    subjectId,
    date
  );

  return attendance;
};

/**
 * Get student attendance stats for a subject taught by teacher
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {String} studentId
 * @param {String} subjectId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Object>}
 */
export const getStudentAttendanceStatsForTeacherService = async (
  teacherId,
  collegeId,
  studentId,
  subjectId,
  startDate,
  endDate
) => {
  // Validate teacher is assigned to teach this subject
  const assignments = await findAssignmentsByTeacher(collegeId, teacherId, {
    skip: 0,
    limit: 1000,
  });

  const isAssignedToSubject = assignments.some(
    (a) => a.subjectId._id.toString() === subjectId
  );

  if (!isAssignedToSubject) {
    throw new Error("You are not assigned to teach this subject");
  }

  // Get stats
  const stats = await getAttendanceStatsByStudent(
    collegeId,
    studentId,
    subjectId,
    startDate,
    endDate
  );

  return stats;
};

/**
 * Get section attendance stats (validates teacher is assigned to section+subject)
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Object>}
 */
export const getSectionAttendanceStatsForTeacherService = async (
  teacherId,
  collegeId,
  sectionId,
  subjectId,
  startDate,
  endDate
) => {
  // Validate section exists
  const section = await findSectionById(sectionId, collegeId);
  if (!section) {
    throw new Error("Section not found");
  }

  // Validate teacher is assigned to this section+subject
  const assignment = await findTeacherForSectionSubject(
    collegeId,
    sectionId,
    subjectId,
    teacherId
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section"
    );
  }

  // Get stats
  const stats = await getAttendanceStatsBySection(
    collegeId,
    sectionId,
    subjectId,
    startDate,
    endDate
  );

  return stats;
};

/**
 * Generate attendance sheet for marking (validates teacher is assigned)
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @returns {Promise<Object>}
 */
export const generateAttendanceSheetForTeacherService = async (
  teacherId,
  collegeId,
  sectionId,
  subjectId
) => {
  // Validate section exists
  const section = await findSectionById(sectionId, collegeId);
  if (!section) {
    throw new Error("Section not found");
  }

  // Validate teacher is assigned to this section+subject
  const assignment = await findTeacherForSectionSubject(
    collegeId,
    sectionId,
    subjectId,
    teacherId
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section"
    );
  }

  // Get students
  const students = await findStudentsBySectionId(sectionId);

  // Return formatted sheet
  return {
    section: {
      _id: section._id,
      name: section.name,
      semester: section.semester,
      year: section.year,
    },
    subject: assignment.subject,
    students: students.map((student) => ({
      _id: student._id,
      rollNumber: student.rollNumber,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
    })),
  };
};
