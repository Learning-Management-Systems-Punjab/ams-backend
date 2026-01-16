import Region from "../models/region.js";
import College from "../models/college.js";
import DistrictHead from "../models/district-head.js";
import Teacher from "../models/teacher.js";
import Student from "../models/student.js";
import Program from "../models/program.js";
import Section from "../models/section.js";

/**
 * Get dashboard statistics for SysAdmin
 * Optimized with Promise.all for parallel execution
 * @returns {Promise<Object>}
 */
export const getDashboardStatisticsService = async () => {
  // Execute all count queries in parallel for optimal performance
  const [
    totalRegions,
    totalColleges,
    totalDistrictHeads,
    totalTeachers,
    totalStudents,
    totalPrograms,
    totalSections,
    regionsWithDistrictHeads,
    activeColleges,
    activeStudents,
  ] = await Promise.all([
    // Total counts
    Region.countDocuments({ isActive: true }),
    College.countDocuments({ isActive: true }),
    DistrictHead.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    Student.countDocuments({ isActive: true }),
    Program.countDocuments({ isActive: true }),
    Section.countDocuments({ isActive: true }),

    // Advanced metrics
    Region.countDocuments({ isActive: true, districtHeadId: { $ne: null } }),
    College.countDocuments({ isActive: true }),
    Student.countDocuments({ isActive: true, status: "Active" }),
  ]);

  // Calculate derived metrics
  const regionsWithoutDistrictHeads = totalRegions - regionsWithDistrictHeads;
  const assignmentRate =
    totalRegions > 0
      ? ((regionsWithDistrictHeads / totalRegions) * 100).toFixed(2)
      : 0;

  return {
    overview: {
      totalRegions,
      totalColleges,
      totalDistrictHeads,
      totalTeachers,
      totalStudents,
      totalPrograms,
      totalSections,
    },
    regions: {
      total: totalRegions,
      withDistrictHeads: regionsWithDistrictHeads,
      withoutDistrictHeads: regionsWithoutDistrictHeads,
      assignmentRate: parseFloat(assignmentRate),
    },
    colleges: {
      total: totalColleges,
      active: activeColleges,
    },
    students: {
      total: totalStudents,
      active: activeStudents,
      inactive: totalStudents - activeStudents,
    },
    personnel: {
      totalDistrictHeads,
      totalTeachers,
    },
    academics: {
      totalPrograms,
      totalSections,
    },
  };
};

/**
 * Get region-wise statistics
 * Optimized with MongoDB aggregation pipeline
 * @returns {Promise<Array>}
 */
export const getRegionWiseStatisticsService = async () => {
  const regionStats = await Region.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $lookup: {
        from: "colleges",
        localField: "_id",
        foreignField: "regionId",
        pipeline: [{ $match: { isActive: true } }],
        as: "colleges",
      },
    },
    {
      $lookup: {
        from: "districtheads",
        localField: "_id",
        foreignField: "regionId",
        pipeline: [{ $match: { isActive: true } }],
        as: "districtHead",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        totalColleges: { $size: "$colleges" },
        hasDistrictHead: {
          $cond: {
            if: { $gt: [{ $size: "$districtHead" }, 0] },
            then: true,
            else: false,
          },
        },
        districtHeadName: {
          $arrayElemAt: ["$districtHead.name", 0],
        },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]);

  return regionStats;
};

/**
 * Get college-wise statistics
 * Optimized with MongoDB aggregation pipeline
 * @param {String} regionId - Optional region filter
 * @returns {Promise<Array>}
 */
export const getCollegeWiseStatisticsService = async (regionId = null) => {
  const matchStage = regionId
    ? { isActive: true, regionId: regionId }
    : { isActive: true };

  const collegeStats = await College.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "teachers",
        localField: "_id",
        foreignField: "collegeId",
        pipeline: [{ $match: { isActive: true } }],
        as: "teachers",
      },
    },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "collegeId",
        pipeline: [{ $match: { isActive: true } }],
        as: "students",
      },
    },
    {
      $lookup: {
        from: "programs",
        localField: "_id",
        foreignField: "collegeId",
        pipeline: [{ $match: { isActive: true } }],
        as: "programs",
      },
    },
    {
      $lookup: {
        from: "sections",
        localField: "_id",
        foreignField: "collegeId",
        pipeline: [{ $match: { isActive: true } }],
        as: "sections",
      },
    },
    {
      $lookup: {
        from: "regions",
        localField: "regionId",
        foreignField: "_id",
        as: "region",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        city: 1,
        regionName: { $arrayElemAt: ["$region.name", 0] },
        regionCode: { $arrayElemAt: ["$region.code", 0] },
        totalTeachers: { $size: "$teachers" },
        totalStudents: { $size: "$students" },
        totalPrograms: { $size: "$programs" },
        totalSections: { $size: "$sections" },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]);

  return collegeStats;
};

/**
 * Get quick stats for dashboard cards
 * Ultra-optimized - only essential counts
 * @returns {Promise<Object>}
 */
export const getQuickStatsService = async () => {
  const [totalRegions, totalColleges, totalDistrictHeads, totalStudents] =
    await Promise.all([
      Region.countDocuments({ isActive: true }),
      College.countDocuments({ isActive: true }),
      DistrictHead.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true }),
    ]);

  return {
    totalRegions,
    totalColleges,
    totalDistrictHeads,
    totalStudents,
  };
};
