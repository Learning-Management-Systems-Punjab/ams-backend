import {
  markAttendanceService,
  getAttendanceBySectionDateService,
  getAttendanceByStudentService,
  updateAttendanceService,
  deleteAttendanceService,
  getStudentAttendanceStatsService,
  getSectionAttendanceStatsService,
  generateAttendanceSheetService,
} from "../services/college-admin-attendance.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

export const markAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await markAttendanceService(
      attendanceData,
      college._id.toString(),
      userId
    );

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Error in markAttendance:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
  }
};

export const getAttendanceBySectionDate = async (req, res) => {
  try {
    const { sectionId, subjectId, date } = req.query;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 200;

    if (!sectionId || !subjectId || !date) {
      return res.status(400).json({
        success: false,
        message: "sectionId, subjectId, and date are required",
      });
    }

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAttendanceBySectionDateService(
      college._id.toString(),
      sectionId,
      subjectId,
      date,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Attendance retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAttendanceBySectionDate:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve attendance",
    });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const filters = {};
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;
    if (req.query.subjectId) filters.subjectId = req.query.subjectId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAttendanceByStudentService(
      college._id.toString(),
      studentId,
      filters,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Student attendance retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAttendanceByStudent:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve student attendance",
    });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const attendance = await updateAttendanceService(
      attendanceId,
      updateData,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update attendance",
    });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await deleteAttendanceService(
      attendanceId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteAttendance:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete attendance",
    });
  }
};

export const getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, startDate, endDate } = req.query;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getStudentAttendanceStatsService(
      college._id.toString(),
      studentId,
      subjectId || null,
      startDate || null,
      endDate || null
    );

    return res.status(200).json({
      success: true,
      message: "Student attendance statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getStudentAttendanceStats:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve attendance statistics",
    });
  }
};

export const getSectionAttendanceStats = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { subjectId, startDate, endDate } = req.query;
    const userId = req.user.userId;

    if (!subjectId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "subjectId, startDate, and endDate are required",
      });
    }

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getSectionAttendanceStatsService(
      college._id.toString(),
      sectionId,
      subjectId,
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      message: "Section attendance statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getSectionAttendanceStats:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve section statistics",
    });
  }
};

export const generateAttendanceSheet = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const sheet = await generateAttendanceSheetService(
      college._id.toString(),
      sectionId
    );

    return res.status(200).json({
      success: true,
      message: "Attendance sheet generated successfully",
      data: sheet,
    });
  } catch (error) {
    console.error("Error in generateAttendanceSheet:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate attendance sheet",
    });
  }
};
