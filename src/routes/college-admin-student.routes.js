import express from "express";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
  bulkImportStudents,
  exportStudents,
} from "../controllers/college-admin-student.controller.js";
import {
  createStudentValidation,
  updateStudentValidation,
  studentIdValidation,
  paginationValidation,
  searchValidation,
  bulkImportValidation,
  exportValidation,
} from "../validators/college-admin-student.validator.js";
import { validate } from "../middlewares/validate.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/college-admin/students
 * @desc    Create a new student
 * @access  CollegeAdmin
 */
router.post(
  "/",
  ...isCollegeAdmin,
  createStudentValidation,
  validate,
  createStudent
);

/**
 * @route   GET /api/college-admin/students
 * @desc    Get all students with pagination and filters
 * @access  CollegeAdmin
 */
router.get(
  "/",
  ...isCollegeAdmin,
  paginationValidation,
  validate,
  getAllStudents
);

/**
 * @route   GET /api/college-admin/students/search
 * @desc    Search students (fuzzy search)
 * @access  CollegeAdmin
 */
router.get(
  "/search",
  ...isCollegeAdmin,
  searchValidation,
  validate,
  searchStudents
);

/**
 * @route   GET /api/college-admin/students/export
 * @desc    Export students to CSV format
 * @access  CollegeAdmin
 */
router.get(
  "/export",
  ...isCollegeAdmin,
  exportValidation,
  validate,
  exportStudents
);

/**
 * @route   GET /api/college-admin/students/:studentId
 * @desc    Get student by ID
 * @access  CollegeAdmin
 */
router.get(
  "/:studentId",
  ...isCollegeAdmin,
  studentIdValidation,
  validate,
  getStudentById
);

/**
 * @route   PUT /api/college-admin/students/:studentId
 * @desc    Update student
 * @access  CollegeAdmin
 */
router.put(
  "/:studentId",
  ...isCollegeAdmin,
  updateStudentValidation,
  validate,
  updateStudent
);

/**
 * @route   DELETE /api/college-admin/students/:studentId
 * @desc    Delete student (soft delete)
 * @access  CollegeAdmin
 */
router.delete(
  "/:studentId",
  ...isCollegeAdmin,
  studentIdValidation,
  validate,
  deleteStudent
);

/**
 * @route   POST /api/college-admin/students/bulk-import
 * @desc    Bulk import students
 * @access  CollegeAdmin
 */
router.post(
  "/bulk-import",
  ...isCollegeAdmin,
  bulkImportValidation,
  validate,
  bulkImportStudents
);

export default router;
