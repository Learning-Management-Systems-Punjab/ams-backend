import express from "express";
import {
  getAllTeachers,
  getTeacherById,
  searchTeachers,
} from "../controllers/teacher.controller.js";
import {
  getAllTeachersValidation,
  getTeacherByIdValidation,
  searchTeachersValidation,
} from "../validators/teacher.validator.js";
import { validate } from "../middlewares/validate.js";
import { isSysAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/teachers
 * @desc    Get all teachers with pagination
 * @access  Private - SysAdmin only
 */
router.get("/", isSysAdmin, getAllTeachersValidation, validate, getAllTeachers);

/**
 * @route   GET /api/teachers/search
 * @desc    Search teachers by name, email, or CNIC
 * @access  Private - SysAdmin only
 */
router.get(
  "/search",
  isSysAdmin,
  searchTeachersValidation,
  validate,
  searchTeachers
);

/**
 * @route   GET /api/teachers/:teacherId
 * @desc    Get teacher by ID
 * @access  Private - SysAdmin only
 */
router.get(
  "/:teacherId",
  isSysAdmin,
  getTeacherByIdValidation,
  validate,
  getTeacherById
);

export default router;
