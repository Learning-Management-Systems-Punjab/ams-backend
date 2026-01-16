import {
  createStudentService,
  getAllStudentsService,
  getStudentByIdService,
  updateStudentService,
  deleteStudentService,
  searchStudentsService,
  bulkImportStudentsService,
  exportStudentsService,
} from "../services/college-admin-student.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

/**
 * Create new student
 */
export const createStudent = async (req, res) => {
  try {
    const studentData = req.body;
    const userId = req.user.userId;

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await createStudentService(
      studentData,
      college._id.toString(),
      req.body.createLoginAccount || false
    );

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in createStudent:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create student",
    });
  }
};

/**
 * Get all students with pagination and filters
 */
export const getAllStudents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    // Build filters
    const filters = {};
    if (req.query.programId) filters.programId = req.query.programId;
    if (req.query.sectionId) filters.sectionId = req.query.sectionId;
    if (req.query.status) filters.status = req.query.status;

    const result = await getAllStudentsService(
      college._id.toString(),
      page,
      limit,
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve students",
    });
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.userId;

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const student = await getStudentByIdService(
      studentId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error in getStudentById:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to retrieve student",
    });
  }
};

/**
 * Update student
 */
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const student = await updateStudentService(
      studentId,
      updateData,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error in updateStudent:", error);
    const statusCode = error.message.includes("not found") ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update student",
    });
  }
};

/**
 * Delete student (soft delete)
 */
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.userId;

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await deleteStudentService(
      studentId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: { studentId: result.studentId },
    });
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to delete student",
    });
  }
};

/**
 * Search students
 */
export const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await searchStudentsService(
      college._id.toString(),
      query,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in searchStudents:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to search students",
    });
  }
};

/**
 * Bulk import students
 */
export const bulkImportStudents = async (req, res) => {
  try {
    const { students, createLoginAccounts } = req.body;
    const userId = req.user.userId;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Students array is required and must not be empty",
      });
    }

    if (students.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Maximum 500 students can be imported at once",
      });
    }

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await bulkImportStudentsService(
      students,
      college._id.toString(),
      createLoginAccounts || false
    );

    return res.status(200).json({
      success: true,
      message: "Bulk import completed",
      data: result,
    });
  } catch (error) {
    console.error("Error in bulkImportStudents:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to import students",
    });
  }
};

/**
 * Export students to CSV format
 */
export const exportStudents = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find college for this user
    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    // Build filters
    const filters = {};
    if (req.query.programId) filters.programId = req.query.programId;
    if (req.query.sectionId) filters.sectionId = req.query.sectionId;

    const csvData = await exportStudentsService(
      college._id.toString(),
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Students exported successfully",
      data: csvData,
    });
  } catch (error) {
    console.error("Error in exportStudents:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to export students",
    });
  }
};
