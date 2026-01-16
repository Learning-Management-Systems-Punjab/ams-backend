import express from "express";
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/college-admin-subject.controller.js";
import {
  createSubjectValidation,
  updateSubjectValidation,
  subjectIdValidation,
  paginationValidation,
} from "../validators/college-admin-subject.validator.js";
import { validate } from "../middlewares/validate.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/college-admin/subjects - Create subject
router.post(
  "/",
  ...isCollegeAdmin,
  createSubjectValidation,
  validate,
  createSubject
);

// GET /api/college-admin/subjects - Get all subjects
router.get(
  "/",
  ...isCollegeAdmin,
  paginationValidation,
  validate,
  getAllSubjects
);

// GET /api/college-admin/subjects/:subjectId - Get subject by ID
router.get(
  "/:subjectId",
  ...isCollegeAdmin,
  subjectIdValidation,
  validate,
  getSubjectById
);

// PUT /api/college-admin/subjects/:subjectId - Update subject
router.put(
  "/:subjectId",
  ...isCollegeAdmin,
  updateSubjectValidation,
  validate,
  updateSubject
);

// DELETE /api/college-admin/subjects/:subjectId - Delete subject
router.delete(
  "/:subjectId",
  ...isCollegeAdmin,
  subjectIdValidation,
  validate,
  deleteSubject
);

export default router;
