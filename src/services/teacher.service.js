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
  isAttendanceMarkedForSection,
  findAttendanceBySectionDate,
  getAttendanceStatsByStudent,
  getAttendanceStatsBySection,
} from "../dal/attendance.dal.js";
import Attendance from "../models/attendance.js";

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
  limit = 10,
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
  limit = 50,
) => {
  const skip = (page - 1) * limit;

  const [assignments, totalCount] = await Promise.all([
    findAssignmentsByTeacher(collegeId, teacherId, { skip, limit }),
    countAssignmentsByTeacher(collegeId, teacherId),
  ]);

  // Transform assignments to match frontend expected format
  const transformedAssignments = assignments.map((a) => ({
    _id: a._id,
    teacher: a.teacherId
      ? {
          _id: a.teacherId._id,
          name: a.teacherId.name,
          email: a.teacherId.contactEmail,
          employeeId: a.teacherId.cnic,
        }
      : null,
    section: a.sectionId
      ? {
          _id: a.sectionId._id,
          name: a.sectionId.name,
          year: a.sectionId.year,
          shift: a.sectionId.shift,
          program: a.sectionId.programId
            ? {
                _id: a.sectionId.programId._id,
                name: a.sectionId.programId.name,
                code: a.sectionId.programId.code,
              }
            : null,
        }
      : null,
    subject: a.subjectId
      ? {
          _id: a.subjectId._id,
          name: a.subjectId.name,
          code: a.subjectId.code,
          creditHours: a.subjectId.creditHours,
        }
      : null,
    academicYear: a.academicYear,
    semester: a.semester,
    schedule: a.schedule || [],
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  return {
    assignments: transformedAssignments,
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
      // Transform to match frontend expected format
      const section = {
        _id: a.sectionId._id,
        name: a.sectionId.name,
        year: a.sectionId.year,
        shift: a.sectionId.shift,
        program: a.sectionId.programId
          ? {
              _id: a.sectionId.programId._id,
              name: a.sectionId.programId.name,
              code: a.sectionId.programId.code,
            }
          : null,
      };
      uniqueSections.set(a.sectionId._id.toString(), section);
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
      // Transform to match frontend expected format
      const subject = {
        _id: a.subjectId._id,
        name: a.subjectId.name,
        code: a.subjectId.code,
        creditHours: a.subjectId.creditHours || 3,
      };
      uniqueSubjects.set(a.subjectId._id.toString(), subject);
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
  sectionId,
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
    (a) => a.sectionId._id.toString() === sectionId,
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
 * @param {String} userId - The user account ID for markedBy
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
  userId,
  sectionId,
  subjectId,
  date,
  period,
  attendanceRecords,
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
    teacherId,
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section",
    );
  }

  // Check if attendance already marked for this section/subject/date/period
  const alreadyMarked = await isAttendanceMarkedForSection(
    sectionId,
    subjectId,
    date,
    period,
  );

  if (alreadyMarked) {
    throw new Error(
      "Attendance has already been marked for this section, subject, date, and period",
    );
  }

  // Prepare attendance records with proper field names matching model
  const attendanceData = attendanceRecords.map((record) => ({
    collegeId,
    studentId: record.studentId,
    sectionId,
    subjectId,
    teacherId,
    date,
    period,
    status: record.status,
    remarks: record.remarks || "",
    markedBy: userId, // Use the User ID for markedBy
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
  period,
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
    teacherId,
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section",
    );
  }

  // Get attendance
  const attendance = await findAttendanceBySectionDate(
    collegeId,
    sectionId,
    subjectId,
    date,
  );

  return attendance;
};

/**
 * Get attendance records for teacher with flexible filtering
 * @param {String} teacherId
 * @param {String} collegeId
 * @param {Object} filters - sectionId, subjectId, date, startDate, endDate, period
 * @param {Object} options - page, limit
 * @returns {Promise<Object>}
 */
export const getMyAttendanceRecordsService = async (
  teacherId,
  collegeId,
  filters = {},
  options = {},
) => {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  // Get teacher's assignments to filter only their sections/subjects
  const assignments = await findAssignmentsByTeacher(collegeId, teacherId, {
    skip: 0,
    limit: 1000,
  });

  if (!assignments || assignments.length === 0) {
    return {
      attendance: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // Build match stage based on teacher's assignments
  const assignmentConditions = assignments.map((a) => ({
    sectionId: a.sectionId?._id || a.sectionId,
    subjectId: a.subjectId?._id || a.subjectId,
  }));

  const matchStage = {
    collegeId,
    teacherId,
    $or: assignmentConditions,
  };

  // Apply optional filters
  if (filters.sectionId) {
    matchStage.sectionId = filters.sectionId;
  }
  if (filters.subjectId) {
    matchStage.subjectId = filters.subjectId;
  }
  if (filters.period) {
    matchStage.period = parseInt(filters.period);
  }

  // Date filtering
  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    matchStage.date = { $gte: startOfDay, $lte: endOfDay };
  } else if (filters.startDate || filters.endDate) {
    matchStage.date = {};
    if (filters.startDate) {
      matchStage.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      matchStage.date.$lte = endOfDay;
    }
  }

  // Use aggregation to group by section/subject/date/period
  const aggregationPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          sectionId: "$sectionId",
          subjectId: "$subjectId",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          period: "$period",
        },
        totalStudents: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
        },
        lateCount: {
          $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
        },
        leaveCount: {
          $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] },
        },
        markedAt: { $first: "$createdAt" },
        teacherId: { $first: "$teacherId" },
      },
    },
    { $sort: { "_id.date": -1, "_id.period": 1 } },
    {
      $facet: {
        records: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Attendance.aggregate(aggregationPipeline);
  const groupedRecords = result[0]?.records || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  // Populate section, subject, and teacher details
  const populatedRecords = await Promise.all(
    groupedRecords.map(async (record) => {
      const [section, subject] = await Promise.all([
        findSectionById(record._id.sectionId, collegeId),
        Attendance.findOne({ subjectId: record._id.subjectId })
          .populate("subjectId", "name code")
          .then((a) => a?.subjectId),
      ]);

      return {
        _id: `${record._id.sectionId}-${record._id.subjectId}-${record._id.date}-${record._id.period}`,
        section: section
          ? {
              _id: section._id,
              name: section.name,
              year: section.year,
              shift: section.shift,
            }
          : null,
        subject: subject
          ? { _id: subject._id, name: subject.name, code: subject.code }
          : null,
        date: record._id.date,
        period: record._id.period,
        totalStudents: record.totalStudents,
        presentCount: record.presentCount,
        absentCount: record.absentCount,
        lateCount: record.lateCount,
        leaveCount: record.leaveCount,
        attendancePercentage: Math.round(
          ((record.presentCount + record.lateCount) / record.totalStudents) *
            100,
        ),
        markedAt: record.markedAt,
      };
    }),
  );

  return {
    attendance: populatedRecords,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
  endDate,
) => {
  // Validate teacher is assigned to teach this subject
  const assignments = await findAssignmentsByTeacher(collegeId, teacherId, {
    skip: 0,
    limit: 1000,
  });

  const isAssignedToSubject = assignments.some(
    (a) => a.subjectId._id.toString() === subjectId,
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
    endDate,
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
  endDate,
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
    teacherId,
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section",
    );
  }

  // Get stats
  const stats = await getAttendanceStatsBySection(
    collegeId,
    sectionId,
    subjectId,
    startDate,
    endDate,
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
  subjectId,
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
    teacherId,
  );

  if (!assignment) {
    throw new Error(
      "You are not assigned to teach this subject for this section",
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
    subject: assignment.subjectId
      ? {
          _id: assignment.subjectId._id,
          name: assignment.subjectId.name,
          code: assignment.subjectId.code,
        }
      : null,
    students: students.map((student) => ({
      _id: student._id,
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
    })),
    alreadyMarked: false, // Frontend expects this field
  };
};
