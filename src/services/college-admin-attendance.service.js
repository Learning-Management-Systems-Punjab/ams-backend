import {
  createAttendance,
  bulkCreateAttendance,
  findAttendanceById,
  findAttendanceBySectionDate,
  findAttendanceByStudent,
  countAttendance,
  updateAttendance,
  deleteAttendance,
  isAttendanceMarked,
  getAttendanceStatsByStudent,
  getAttendanceStatsBySection,
} from "../dal/attendance.dal.js";
import { findCollegeById } from "../dal/college.dal.js";
import { findSectionById } from "../dal/section.dal.js";
import { findSubjectById } from "../dal/subject.dal.js";
import { findStudentsBySection } from "../dal/student.dal.js";
import { findTeacherForSectionSubject } from "../dal/teacherAssignment.dal.js";

/**
 * Mark attendance for a section (college-scoped)
 * @param {Object} attendanceData
 * @param {String} collegeId
 * @param {String} markedByUserId
 * @returns {Promise<Object>}
 */
export const markAttendanceService = async (
  attendanceData,
  collegeId,
  markedByUserId
) => {
  const { sectionId, subjectId, date, period, attendanceRecords } =
    attendanceData;

  // Validate college
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Validate section
  const section = await findSectionById(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }
  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // Validate subject
  const subject = await findSubjectById(subjectId, collegeId);
  if (!subject) {
    throw new Error("Subject not found");
  }

  // Find teacher assigned to this section for this subject
  const assignment = await findTeacherForSectionSubject(
    collegeId,
    sectionId,
    subjectId
  );

  if (!assignment) {
    throw new Error("No teacher assigned to this section for this subject");
  }

  const teacherId = assignment.teacherId._id;

  // Check if attendance already marked for this date
  const existingAttendance = await findAttendanceBySectionDate(
    collegeId,
    sectionId,
    subjectId,
    date,
    { limit: 1 }
  );

  if (existingAttendance.length > 0 && period) {
    // Check if period already marked
    const periodMarked = existingAttendance.some(
      (att) => att.period === period
    );
    if (periodMarked) {
      throw new Error(
        `Attendance for period ${period} on this date is already marked`
      );
    }
  }

  // Prepare attendance records
  const attendanceArray = attendanceRecords.map((record) => ({
    collegeId,
    studentId: record.studentId,
    sectionId,
    subjectId,
    teacherId,
    date: new Date(date),
    status: record.status || "Absent",
    remarks: record.remarks || "",
    markedBy: markedByUserId,
    period: period || undefined,
  }));

  // Bulk insert attendance
  const createdAttendance = await bulkCreateAttendance(attendanceArray);

  return {
    message: "Attendance marked successfully",
    count: createdAttendance.length,
    date,
    section: section.name,
    subject: subject.name,
  };
};

/**
 * Get attendance for a section on a specific date (college-scoped)
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} date
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAttendanceBySectionDateService = async (
  collegeId,
  sectionId,
  subjectId,
  date,
  page = 1,
  limit = 200
) => {
  // Validate section
  const section = await findSectionById(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }
  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  const skip = (page - 1) * limit;

  const attendance = await findAttendanceBySectionDate(
    collegeId,
    sectionId,
    subjectId,
    date,
    { skip, limit }
  );

  return {
    attendance,
    section: section.name,
    date,
    count: attendance.length,
  };
};

/**
 * Get attendance for a student (college-scoped)
 * @param {String} collegeId
 * @param {String} studentId
 * @param {Object} filters
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAttendanceByStudentService = async (
  collegeId,
  studentId,
  filters = {},
  page = 1,
  limit = 100
) => {
  const skip = (page - 1) * limit;

  const [attendance, total] = await Promise.all([
    findAttendanceByStudent(collegeId, studentId, filters, { skip, limit }),
    countAttendance(collegeId, { studentId, ...filters }),
  ]);

  return {
    attendance,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update attendance record (college-scoped)
 * @param {String} attendanceId
 * @param {Object} updateData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const updateAttendanceService = async (
  attendanceId,
  updateData,
  collegeId
) => {
  const attendance = await findAttendanceById(attendanceId, collegeId);

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  // Prevent updating collegeId, studentId, sectionId, subjectId, date
  delete updateData.collegeId;
  delete updateData.studentId;
  delete updateData.sectionId;
  delete updateData.subjectId;
  delete updateData.date;

  const updatedAttendance = await updateAttendance(
    attendanceId,
    collegeId,
    updateData
  );

  return updatedAttendance;
};

/**
 * Delete attendance record (college-scoped)
 * @param {String} attendanceId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const deleteAttendanceService = async (attendanceId, collegeId) => {
  const attendance = await findAttendanceById(attendanceId, collegeId);

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  await deleteAttendance(attendanceId, collegeId);

  return {
    message: "Attendance record deleted successfully",
    attendanceId,
  };
};

/**
 * Get attendance statistics for a student (college-scoped)
 * @param {String} collegeId
 * @param {String} studentId
 * @param {String} subjectId - Optional
 * @param {Date} startDate - Optional
 * @param {Date} endDate - Optional
 * @returns {Promise<Object>}
 */
export const getStudentAttendanceStatsService = async (
  collegeId,
  studentId,
  subjectId = null,
  startDate = null,
  endDate = null
) => {
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
 * Get attendance statistics for a section (college-scoped)
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array>}
 */
export const getSectionAttendanceStatsService = async (
  collegeId,
  sectionId,
  subjectId,
  startDate,
  endDate
) => {
  // Validate section
  const section = await findSectionById(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }
  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  const stats = await getAttendanceStatsBySection(
    collegeId,
    sectionId,
    subjectId,
    startDate,
    endDate
  );

  return {
    section: section.name,
    subject: subjectId,
    dateRange: { startDate, endDate },
    students: stats,
  };
};

/**
 * Generate attendance sheet for a section (college-scoped)
 * Returns list of students for marking attendance
 * @param {String} collegeId
 * @param {String} sectionId
 * @returns {Promise<Object>}
 */
export const generateAttendanceSheetService = async (collegeId, sectionId) => {
  // Validate section
  const section = await findSectionById(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }
  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // Get all students in section
  const students = await findStudentsBySection(sectionId);

  const studentList = students.map((student) => ({
    studentId: student._id,
    rollNumber: student.rollNumber,
    name: student.name,
    status: "Present", // Default to Present
    remarks: "",
  }));

  return {
    section: section.name,
    sectionId: section._id,
    programName: section.programId.name,
    year: section.year,
    shift: section.shift,
    totalStudents: studentList.length,
    students: studentList,
  };
};
