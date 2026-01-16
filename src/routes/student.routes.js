import express from "express";
import {
  getAllStudents,
  getStudentById,
  searchStudents,
} from "../controllers/student.controller.js";
import {
  getAllStudentsValidation,
  getStudentByIdValidation,
  searchStudentsValidation,
} from "../validators/student.validator.js";
import { validate } from "../middlewares/validate.js";
import { isSysAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/students
 * @desc    Get all students with pagination
 * @access  Private - SysAdmin only
 */
router.get("/", isSysAdmin, getAllStudentsValidation, validate, getAllStudents);

/**
 * @route   GET /api/students/search
 * @desc    Search students by name, roll number, email, or CNIC
 * @access  Private - SysAdmin only
 */
router.get(
  "/search",
  isSysAdmin,
  searchStudentsValidation,
  validate,
  searchStudents
);

/**
 * @route   GET /api/students/:studentId
 * @desc    Get student by ID
 * @access  Private - SysAdmin only
 */
router.get(
  "/:studentId",
  isSysAdmin,
  getStudentByIdValidation,
  validate,
  getStudentById
);

export default router;
