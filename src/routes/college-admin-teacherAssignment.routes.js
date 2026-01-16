import express from "express";
import {
  createTeacherAssignment,
  getAllAssignments,
  getAssignmentsByTeacher,
  getAssignmentsBySection,
  updateTeacherAssignment,
  deleteTeacherAssignment,
} from "../controllers/college-admin-teacherAssignment.controller.js";
import {
  createAssignmentValidation,
  updateAssignmentValidation,
  assignmentIdValidation,
  teacherIdValidation,
  assignmentPaginationValidation,
} from "../validators/college-admin-teacherAssignment.validator.js";
import { sectionIdValidation } from "../validators/college-admin-section.validator.js";
import { validate } from "../middlewares/validate.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/college-admin/teacher-assignments - Create teacher assignment
router.post(
  "/",
  ...isCollegeAdmin,
  createAssignmentValidation,
  validate,
  createTeacherAssignment
);

// GET /api/college-admin/teacher-assignments - Get all assignments
router.get(
  "/",
  ...isCollegeAdmin,
  assignmentPaginationValidation,
  validate,
  getAllAssignments
);

// GET /api/college-admin/teacher-assignments/teacher/:teacherId - Get by teacher
router.get(
  "/teacher/:teacherId",
  ...isCollegeAdmin,
  teacherIdValidation,
  validate,
  getAssignmentsByTeacher
);

// GET /api/college-admin/teacher-assignments/section/:sectionId - Get by section
router.get(
  "/section/:sectionId",
  ...isCollegeAdmin,
  sectionIdValidation,
  validate,
  getAssignmentsBySection
);

// PUT /api/college-admin/teacher-assignments/:assignmentId - Update assignment
router.put(
  "/:assignmentId",
  ...isCollegeAdmin,
  updateAssignmentValidation,
  validate,
  updateTeacherAssignment
);

// DELETE /api/college-admin/teacher-assignments/:assignmentId - Delete assignment
router.delete(
  "/:assignmentId",
  ...isCollegeAdmin,
  assignmentIdValidation,
  validate,
  deleteTeacherAssignment
);

export default router;
