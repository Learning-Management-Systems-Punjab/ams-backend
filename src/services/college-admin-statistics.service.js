import College from "../models/college.js";
import Teacher from "../models/teacher.js";
import Student from "../models/student.js";
import Program from "../models/program.js";
import Section from "../models/section.js";
import Subject from "../models/subject.js";

/**
 * Get dashboard statistics for College Admin
 * Scoped to specific college only
 * Optimized with Promise.all for parallel execution
 * @param {String} collegeId - College ID
 * @returns {Promise<Object>}
 */
export const getCollegeAdminDashboardStatsService = async (collegeId) => {
  // Execute all queries in parallel for optimal performance
  const [
    totalTeachers,
    totalStudents,
    totalPrograms,
    totalSections,
    totalSubjects,
    activeStudents,
    maleStudents,
    femaleStudents,
    maleTeachers,
    femaleTeachers,
    studentsByStatus,
  ] = await Promise.all([
    // Basic counts
    Teacher.countDocuments({ collegeId, isActive: true }),
    Student.countDocuments({ collegeId, isActive: true }),
    Program.countDocuments({ collegeId, isActive: true }),
    Section.countDocuments({ collegeId, isActive: true }),
    Subject.countDocuments({ collegeId, isActive: true }),

    // Student metrics
    Student.countDocuments({ collegeId, isActive: true, status: "Active" }),
    Student.countDocuments({ collegeId, isActive: true, gender: "Male" }),
    Student.countDocuments({ collegeId, isActive: true, gender: "Female" }),

    // Teacher metrics
    Teacher.countDocuments({ collegeId, isActive: true, gender: "Male" }),
    Teacher.countDocuments({ collegeId, isActive: true, gender: "Female" }),

    // Student status breakdown (aggregation)
    Student.aggregate([
      { $match: { collegeId, isActive: true } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Calculate derived metrics
  const inactiveStudents = totalStudents - activeStudents;
  const activeStudentPercentage =
    totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(2) : 0;

  const maleStudentPercentage =
    totalStudents > 0 ? ((maleStudents / totalStudents) * 100).toFixed(2) : 0;
  const femaleStudentPercentage =
    totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(2) : 0;

  // Transform status breakdown
  const statusBreakdown = studentsByStatus.reduce((acc, item) => {
    acc[item._id || "Unknown"] = item.count;
    return acc;
  }, {});

  return {
    overview: {
      totalTeachers,
      totalStudents,
      totalPrograms,
      totalSections,
      totalSubjects,
    },
    students: {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
      activePercentage: parseFloat(activeStudentPercentage),
      byGender: {
        male: maleStudents,
        female: femaleStudents,
        malePercentage: parseFloat(maleStudentPercentage),
        femalePercentage: parseFloat(femaleStudentPercentage),
      },
      byStatus: statusBreakdown,
    },
    teachers: {
      total: totalTeachers,
      byGender: {
        male: maleTeachers,
        female: femaleTeachers,
      },
    },
    academics: {
      totalPrograms,
      totalSections,
      totalSubjects,
      averageStudentsPerSection:
        totalSections > 0
          ? parseFloat((totalStudents / totalSections).toFixed(2))
          : 0,
      averageTeachersPerProgram:
        totalPrograms > 0
          ? parseFloat((totalTeachers / totalPrograms).toFixed(2))
          : 0,
    },
  };
};

/**
 * Get program-wise statistics for College Admin
 * Shows students and sections per program
 * Optimized with MongoDB aggregation pipeline
 * @param {String} collegeId - College ID
 * @returns {Promise<Array>}
 */
export const getProgramWiseStatsService = async (collegeId) => {
  const programStats = await Program.aggregate([
    {
      $match: { collegeId, isActive: true },
    },
    {
      $lookup: {
        from: "students",
        let: { programId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$programId", "$$programId"] },
                  { $eq: ["$collegeId", collegeId] },
                  { $eq: ["$isActive", true] },
                ],
              },
            },
          },
        ],
        as: "students",
      },
    },
    {
      $lookup: {
        from: "sections",
        let: { programId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$programId", "$$programId"] },
                  { $eq: ["$collegeId", collegeId] },
                  { $eq: ["$isActive", true] },
                ],
              },
            },
          },
        ],
        as: "sections",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        degree: 1,
        duration: 1,
        totalStudents: { $size: "$students" },
        totalSections: { $size: "$sections" },
        maleStudents: {
          $size: {
            $filter: {
              input: "$students",
              as: "student",
              cond: { $eq: ["$$student.gender", "Male"] },
            },
          },
        },
        femaleStudents: {
          $size: {
            $filter: {
              input: "$students",
              as: "student",
              cond: { $eq: ["$$student.gender", "Female"] },
            },
          },
        },
        activeStudents: {
          $size: {
            $filter: {
              input: "$students",
              as: "student",
              cond: { $eq: ["$$student.status", "Active"] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        averageStudentsPerSection: {
          $cond: {
            if: { $gt: ["$totalSections", 0] },
            then: {
              $round: [{ $divide: ["$totalStudents", "$totalSections"] }, 2],
            },
            else: 0,
          },
        },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]);

  return programStats;
};

/**
 * Get section-wise statistics for College Admin
 * Shows students per section with program info
 * Optimized with MongoDB aggregation pipeline
 * @param {String} collegeId - College ID
 * @param {String} programId - Optional program filter
 * @returns {Promise<Array>}
 */
export const getSectionWiseStatsService = async (
  collegeId,
  programId = null
) => {
  const matchStage = programId
    ? { collegeId, isActive: true, programId }
    : { collegeId, isActive: true };

  const sectionStats = await Section.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "students",
        let: { sectionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$sectionId", "$$sectionId"] },
                  { $eq: ["$collegeId", collegeId] },
                  { $eq: ["$isActive", true] },
                ],
              },
            },
          },
        ],
        as: "students",
      },
    },
    {
      $lookup: {
        from: "programs",
        localField: "programId",
        foreignField: "_id",
        as: "program",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        semester: 1,
        shift: 1,
        capacity: 1,
        programName: { $arrayElemAt: ["$program.name", 0] },
        programCode: { $arrayElemAt: ["$program.code", 0] },
        totalStudents: { $size: "$students" },
        maleStudents: {
          $size: {
            $filter: {
              input: "$students",
              as: "student",
              cond: { $eq: ["$$student.gender", "Male"] },
            },
          },
        },
        femaleStudents: {
          $size: {
            $filter: {
              input: "$students",
              as: "student",
              cond: { $eq: ["$$student.gender", "Female"] },
            },
          },
        },
        activeStudents: {
          $size: {
            $filter: {
              input: "$students",
              as: "student",
              cond: { $eq: ["$$student.status", "Active"] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        occupancyRate: {
          $cond: {
            if: { $gt: ["$capacity", 0] },
            then: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$totalStudents", "$capacity"] },
                    100,
                  ],
                },
                2,
              ],
            },
            else: 0,
          },
        },
        availableSeats: {
          $subtract: ["$capacity", "$totalStudents"],
        },
      },
    },
    {
      $sort: { programName: 1, semester: 1, name: 1 },
    },
  ]);

  return sectionStats;
};

/**
 * Get teacher statistics with subject assignments
 * Optimized with MongoDB aggregation pipeline
 * @param {String} collegeId - College ID
 * @returns {Promise<Object>}
 */
export const getTeacherStatsService = async (collegeId) => {
  const [teachersByGender, teachersByQualification, teachersWithSubjects] =
    await Promise.all([
      // Gender breakdown
      Teacher.aggregate([
        { $match: { collegeId, isActive: true } },
        {
          $group: {
            _id: "$gender",
            count: { $sum: 1 },
          },
        },
      ]),

      // Qualification breakdown
      Teacher.aggregate([
        { $match: { collegeId, isActive: true } },
        {
          $group: {
            _id: "$highestQualification",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Teachers with subject count
      Teacher.aggregate([
        { $match: { collegeId, isActive: true } },
        {
          $lookup: {
            from: "subjects",
            let: { teacherId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$teacherId", "$$teacherId"] },
                      { $eq: ["$collegeId", collegeId] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "subjects",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            gender: 1,
            highestQualification: 1,
            contactNumber: 1,
            subjectCount: { $size: "$subjects" },
          },
        },
        {
          $group: {
            _id: null,
            totalTeachers: { $sum: 1 },
            teachersWithSubjects: {
              $sum: { $cond: [{ $gt: ["$subjectCount", 0] }, 1, 0] },
            },
            teachersWithoutSubjects: {
              $sum: { $cond: [{ $eq: ["$subjectCount", 0] }, 1, 0] },
            },
            averageSubjectsPerTeacher: { $avg: "$subjectCount" },
          },
        },
      ]),
    ]);

  // Transform gender breakdown
  const genderBreakdown = teachersByGender.reduce((acc, item) => {
    acc[item._id || "Other"] = item.count;
    return acc;
  }, {});

  // Transform qualification breakdown
  const qualificationBreakdown = teachersByQualification.map((item) => ({
    qualification: item._id || "Not Specified",
    count: item.count,
  }));

  // Get subject assignment stats
  const subjectStats =
    teachersWithSubjects.length > 0 ? teachersWithSubjects[0] : {};

  return {
    byGender: genderBreakdown,
    byQualification: qualificationBreakdown,
    subjectAssignments: {
      totalTeachers: subjectStats.totalTeachers || 0,
      teachersWithSubjects: subjectStats.teachersWithSubjects || 0,
      teachersWithoutSubjects: subjectStats.teachersWithoutSubjects || 0,
      averageSubjectsPerTeacher: subjectStats.averageSubjectsPerTeacher
        ? parseFloat(subjectStats.averageSubjectsPerTeacher.toFixed(2))
        : 0,
    },
  };
};

/**
 * Get quick stats for College Admin dashboard cards
 * Ultra-optimized - only essential counts
 * @param {String} collegeId - College ID
 * @returns {Promise<Object>}
 */
export const getCollegeAdminQuickStatsService = async (collegeId) => {
  const [totalTeachers, totalStudents, totalPrograms, totalSections] =
    await Promise.all([
      Teacher.countDocuments({ collegeId, isActive: true }),
      Student.countDocuments({ collegeId, isActive: true }),
      Program.countDocuments({ collegeId, isActive: true }),
      Section.countDocuments({ collegeId, isActive: true }),
    ]);

  return {
    totalTeachers,
    totalStudents,
    totalPrograms,
    totalSections,
  };
};

/**
 * Get recent student enrollments
 * Shows last 10 students enrolled in the college
 * @param {String} collegeId - College ID
 * @param {Number} limit - Number of records (default 10)
 * @returns {Promise<Array>}
 */
export const getRecentEnrollmentsService = async (collegeId, limit = 10) => {
  const recentStudents = await Student.find({
    collegeId,
    isActive: true,
  })
    .select("name rollNumber programId sectionId status createdAt")
    .populate("programId", "name code")
    .populate("sectionId", "name semester")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return recentStudents;
};

/**
 * Get college capacity and utilization metrics
 * @param {String} collegeId - College ID
 * @returns {Promise<Object>}
 */
export const getCapacityUtilizationService = async (collegeId) => {
  const [totalCapacity, totalStudents, sectionUtilization] = await Promise.all([
    // Total capacity from all sections
    Section.aggregate([
      { $match: { collegeId, isActive: true } },
      { $group: { _id: null, totalCapacity: { $sum: "$capacity" } } },
    ]),

    // Total enrolled students
    Student.countDocuments({ collegeId, isActive: true }),

    // Section-level utilization
    Section.aggregate([
      { $match: { collegeId, isActive: true } },
      {
        $lookup: {
          from: "students",
          let: { sectionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sectionId", "$$sectionId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "studentCount",
        },
      },
      {
        $project: {
          capacity: 1,
          enrolled: { $arrayElemAt: ["$studentCount.count", 0] },
        },
      },
      {
        $addFields: {
          enrolled: { $ifNull: ["$enrolled", 0] },
          utilization: {
            $cond: {
              if: { $gt: ["$capacity", 0] },
              then: {
                $multiply: [{ $divide: ["$enrolled", "$capacity"] }, 100],
              },
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSections: { $sum: 1 },
          fullSections: {
            $sum: { $cond: [{ $gte: ["$utilization", 100] }, 1, 0] },
          },
          nearFullSections: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$utilization", 80] },
                    { $lt: ["$utilization", 100] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          underutilizedSections: {
            $sum: { $cond: [{ $lt: ["$utilization", 50] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const capacity =
    totalCapacity.length > 0 ? totalCapacity[0].totalCapacity : 0;
  const utilizationRate =
    capacity > 0 ? ((totalStudents / capacity) * 100).toFixed(2) : 0;
  const availableSeats = capacity - totalStudents;

  const sectionStats =
    sectionUtilization.length > 0 ? sectionUtilization[0] : {};

  return {
    totalCapacity: capacity,
    totalEnrolled: totalStudents,
    availableSeats: Math.max(0, availableSeats),
    utilizationRate: parseFloat(utilizationRate),
    sections: {
      total: sectionStats.totalSections || 0,
      full: sectionStats.fullSections || 0,
      nearFull: sectionStats.nearFullSections || 0,
      underutilized: sectionStats.underutilizedSections || 0,
    },
  };
};
