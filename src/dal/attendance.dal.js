import Attendance from "../models/attendance.js";

/**
 * Create attendance record
 * @param {Object} attendanceData
 * @returns {Promise<Object>}
 */
export const createAttendance = async (attendanceData) => {
  return await Attendance.create(attendanceData);
};

/**
 * Bulk create attendance records
 * @param {Array} attendanceArray
 * @returns {Promise<Array>}
 */
export const bulkCreateAttendance = async (attendanceArray) => {
  return await Attendance.insertMany(attendanceArray, { ordered: false });
};

/**
 * Find attendance by ID (college-scoped)
 * @param {String} attendanceId
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const findAttendanceById = async (attendanceId, collegeId) => {
  return await Attendance.findOne({
    _id: attendanceId,
    collegeId,
  })
    .populate("studentId", "name rollNumber")
    .populate("sectionId", "name year shift")
    .populate("subjectId", "name code")
    .populate("teacherId", "name designation");
};

/**
 * Find attendance for a section on a specific date
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} date
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export const findAttendanceBySectionDate = async (
  collegeId,
  sectionId,
  subjectId,
  date,
  options = {}
) => {
  const { skip = 0, limit = 200 } = options;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await Attendance.find({
    collegeId,
    sectionId,
    subjectId,
    date: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("studentId", "name rollNumber")
    .skip(skip)
    .limit(limit)
    .sort({ "studentId.rollNumber": 1 });
};

/**
 * Find attendance for a student
 * @param {String} collegeId
 * @param {String} studentId
 * @param {Object} filters - Date range, subjectId
 * @param {Object} options - Pagination
 * @returns {Promise<Array>}
 */
export const findAttendanceByStudent = async (
  collegeId,
  studentId,
  filters = {},
  options = {}
) => {
  const { skip = 0, limit = 100 } = options;
  const { startDate, endDate, subjectId } = filters;

  const query = { collegeId, studentId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (subjectId) {
    query.subjectId = subjectId;
  }

  return await Attendance.find(query)
    .populate("subjectId", "name code")
    .populate("sectionId", "name")
    .populate("teacherId", "name")
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });
};

/**
 * Count attendance records
 * @param {String} collegeId
 * @param {Object} filters
 * @returns {Promise<Number>}
 */
export const countAttendance = async (collegeId, filters = {}) => {
  const query = { collegeId };

  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.sectionId) query.sectionId = filters.sectionId;
  if (filters.subjectId) query.subjectId = filters.subjectId;

  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  return await Attendance.countDocuments(query);
};

/**
 * Update attendance record
 * @param {String} attendanceId
 * @param {String} collegeId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateAttendance = async (attendanceId, collegeId, updateData) => {
  return await Attendance.findOneAndUpdate(
    { _id: attendanceId, collegeId },
    updateData,
    { new: true }
  )
    .populate("studentId", "name rollNumber")
    .populate("subjectId", "name code");
};

/**
 * Delete attendance record
 * @param {String} attendanceId
 * @param {String} collegeId
 * @returns {Promise<Object|null>}
 */
export const deleteAttendance = async (attendanceId, collegeId) => {
  return await Attendance.findOneAndDelete({ _id: attendanceId, collegeId });
};

/**
 * Check if attendance already marked for a student on a date for subject
 * @param {String} studentId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} date
 * @param {Number} period
 * @returns {Promise<Boolean>}
 */
export const isAttendanceMarked = async (
  studentId,
  sectionId,
  subjectId,
  date,
  period
) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    studentId,
    sectionId,
    subjectId,
    date: { $gte: startOfDay, $lte: endOfDay },
  };

  if (period) {
    query.period = period;
  }

  const attendance = await Attendance.findOne(query);
  return !!attendance;
};

/**
 * Get attendance statistics for a student
 * @param {String} collegeId
 * @param {String} studentId
 * @param {String} subjectId - Optional
 * @param {Date} startDate - Optional
 * @param {Date} endDate - Optional
 * @returns {Promise<Object>}
 */
export const getAttendanceStatsByStudent = async (
  collegeId,
  studentId,
  subjectId = null,
  startDate = null,
  endDate = null
) => {
  const matchStage = { collegeId, studentId };

  if (subjectId) {
    matchStage.subjectId = subjectId;
  }

  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const stats = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    excused: 0,
    percentage: 0,
  };

  stats.forEach((stat) => {
    const status = stat._id.toLowerCase();
    result[status] = stat.count;
    result.total += stat.count;
  });

  if (result.total > 0) {
    result.percentage = parseFloat(
      ((result.present / result.total) * 100).toFixed(2)
    );
  }

  return result;
};

/**
 * Get attendance statistics for a section
 * @param {String} collegeId
 * @param {String} sectionId
 * @param {String} subjectId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array>}
 */
export const getAttendanceStatsBySection = async (
  collegeId,
  sectionId,
  subjectId,
  startDate,
  endDate
) => {
  const matchStage = { collegeId, sectionId, subjectId };

  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  return await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$studentId",
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
        },
        late: {
          $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $project: {
        studentId: "$_id",
        studentName: "$student.name",
        rollNumber: "$student.rollNumber",
        total: 1,
        present: 1,
        absent: 1,
        late: 1,
        percentage: {
          $multiply: [{ $divide: ["$present", "$total"] }, 100],
        },
      },
    },
    { $sort: { rollNumber: 1 } },
  ]);
};
