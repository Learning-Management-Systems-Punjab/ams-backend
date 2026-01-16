import {
  createTeacherAssignmentService,
  getAllAssignmentsService,
  getAssignmentsByTeacherService,
  getAssignmentsBySectionService,
  updateTeacherAssignmentService,
  deleteTeacherAssignmentService,
} from "../services/college-admin-teacherAssignment.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

export const createTeacherAssignment = async (req, res) => {
  try {
    const assignmentData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const assignment = await createTeacherAssignmentService(
      assignmentData,
      college._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Teacher assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error in createTeacherAssignment:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create teacher assignment",
    });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const filters = {};
    if (req.query.academicYear) filters.academicYear = req.query.academicYear;
    if (req.query.semester) filters.semester = req.query.semester;
    if (req.query.programId) filters.programId = req.query.programId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAllAssignmentsService(
      college._id.toString(),
      page,
      limit,
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Assignments retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllAssignments:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve assignments",
    });
  }
};

export const getAssignmentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAssignmentsByTeacherService(
      college._id.toString(),
      teacherId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Teacher assignments retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAssignmentsByTeacher:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve teacher assignments",
    });
  }
};

export const getAssignmentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAssignmentsBySectionService(
      college._id.toString(),
      sectionId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Section assignments retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAssignmentsBySection:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve section assignments",
    });
  }
};

export const updateTeacherAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const assignment = await updateTeacherAssignmentService(
      assignmentId,
      updateData,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Teacher assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error in updateTeacherAssignment:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update teacher assignment",
    });
  }
};

export const deleteTeacherAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await deleteTeacherAssignmentService(
      assignmentId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteTeacherAssignment:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete teacher assignment",
    });
  }
};
