import express from "express";
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  searchTeachers,
  resetTeacherPassword,
  bulkImportTeachers,
} from "../controllers/college-admin-teacher.controller.js";
import {
  createTeacherValidation,
  updateTeacherValidation,
  teacherIdValidation,
  paginationValidation,
  searchValidation,
  bulkImportValidation,
} from "../validators/college-admin-teacher.validator.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/college-admin/teachers/bulk-import
 * @desc    Bulk import teachers
 * @access  Private (College Admin)
 */
router.post(
  "/bulk-import",
  isCollegeAdmin,
  bulkImportValidation,
  bulkImportTeachers
);

/**
 * @route   GET /api/college-admin/teachers/search
 * @desc    Search teachers (fuzzy search)
 * @access  Private (College Admin)
 */
router.get("/search", isCollegeAdmin, searchValidation, searchTeachers);

/**
 * @route   POST /api/college-admin/teachers
 * @desc    Create new teacher
 * @access  Private (College Admin)
 */
router.post("/", isCollegeAdmin, createTeacherValidation, createTeacher);

/**
 * @route   GET /api/college-admin/teachers
 * @desc    Get all teachers with pagination
 * @access  Private (College Admin)
 */
router.get("/", isCollegeAdmin, paginationValidation, getAllTeachers);

/**
 * @route   GET /api/college-admin/teachers/:teacherId
 * @desc    Get teacher by ID
 * @access  Private (College Admin)
 */
router.get("/:teacherId", isCollegeAdmin, teacherIdValidation, getTeacherById);

/**
 * @route   PUT /api/college-admin/teachers/:teacherId
 * @desc    Update teacher
 * @access  Private (College Admin)
 */
router.put(
  "/:teacherId",
  isCollegeAdmin,
  updateTeacherValidation,
  updateTeacher
);

/**
 * @route   DELETE /api/college-admin/teachers/:teacherId
 * @desc    Delete teacher (soft delete)
 * @access  Private (College Admin)
 */
router.delete(
  "/:teacherId",
  isCollegeAdmin,
  teacherIdValidation,
  deleteTeacher
);

/**
 * @route   POST /api/college-admin/teachers/:teacherId/reset-password
 * @desc    Reset teacher password
 * @access  Private (College Admin)
 */
router.post(
  "/:teacherId/reset-password",
  isCollegeAdmin,
  teacherIdValidation,
  resetTeacherPassword
);

export default router;
