import {
  createTeacherService,
  getAllTeachersService,
  getTeacherByIdService,
  updateTeacherService,
  deleteTeacherService,
  searchTeachersService,
  resetTeacherPasswordService,
  bulkImportTeachersService,
} from "../services/college-admin-teacher.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

/**
 * Create new teacher
 * @route POST /api/college-admin/teachers
 * @access Private (College Admin)
 */
export const createTeacher = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await createTeacherService(req.body, college._id);

    res.status(201).json({
      success: true,
      message:
        "Teacher created successfully. Login credentials have been generated.",
      data: result,
    });
  } catch (error) {
    console.error("Error in createTeacher:", error);

    if (
      error.message.includes("already exists") ||
      error.message.includes("not found")
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create teacher",
      error: error.message,
    });
  }
};

/**
 * Get all teachers with pagination
 * @route GET /api/college-admin/teachers
 * @access Private (College Admin)
 */
export const getAllTeachers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAllTeachersService(college._id, page, limit);

    res.status(200).json({
      success: true,
      message: "Teachers retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllTeachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve teachers",
      error: error.message,
    });
  }
};

/**
 * Get teacher by ID
 * @route GET /api/college-admin/teachers/:teacherId
 * @access Private (College Admin)
 */
export const getTeacherById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { teacherId } = req.params;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const teacher = await getTeacherByIdService(teacherId, college._id);

    res.status(200).json({
      success: true,
      message: "Teacher retrieved successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Error in getTeacherById:", error);

    if (
      error.message === "Teacher not found" ||
      error.message.includes("does not belong")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to retrieve teacher",
      error: error.message,
    });
  }
};

/**
 * Update teacher
 * @route PUT /api/college-admin/teachers/:teacherId
 * @access Private (College Admin)
 */
export const updateTeacher = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { teacherId } = req.params;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const teacher = await updateTeacherService(
      teacherId,
      req.body,
      college._id
    );

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Error in updateTeacher:", error);

    if (
      error.message === "Teacher not found" ||
      error.message.includes("does not belong")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update teacher",
      error: error.message,
    });
  }
};

/**
 * Delete teacher
 * @route DELETE /api/college-admin/teachers/:teacherId
 * @access Private (College Admin)
 */
export const deleteTeacher = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { teacherId } = req.params;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await deleteTeacherService(teacherId, college._id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { teacherId: result.teacherId },
    });
  } catch (error) {
    console.error("Error in deleteTeacher:", error);

    if (
      error.message === "Teacher not found" ||
      error.message.includes("does not belong")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete teacher",
      error: error.message,
    });
  }
};

/**
 * Search teachers
 * @route GET /api/college-admin/teachers/search
 * @access Private (College Admin)
 */
export const searchTeachers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await searchTeachersService(
      college._id,
      q.trim(),
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in searchTeachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search teachers",
      error: error.message,
    });
  }
};

/**
 * Reset teacher password
 * @route POST /api/college-admin/teachers/:teacherId/reset-password
 * @access Private (College Admin)
 */
export const resetTeacherPassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { teacherId } = req.params;

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await resetTeacherPasswordService(teacherId, college._id);

    res.status(200).json({
      success: true,
      message: "Teacher password reset successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in resetTeacherPassword:", error);

    if (
      error.message === "Teacher not found" ||
      error.message.includes("does not belong")
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to reset teacher password",
      error: error.message,
    });
  }
};

/**
 * Bulk import teachers
 * @route POST /api/college-admin/teachers/bulk-import
 * @access Private (College Admin)
 */
export const bulkImportTeachers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { teachers } = req.body;

    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Teachers array is required and must not be empty",
      });
    }

    // Get college for this admin
    const college = await findCollegeByUserId(userId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await bulkImportTeachersService(teachers, college._id);

    res.status(200).json({
      success: true,
      message: `Bulk import completed. ${result.summary.successful} successful, ${result.summary.failed} failed.`,
      data: result,
    });
  } catch (error) {
    console.error("Error in bulkImportTeachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import teachers",
      error: error.message,
    });
  }
};
