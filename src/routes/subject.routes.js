import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  searchSubjects,
} from "../controllers/subject.controller.js";
import {
  getAllSubjectsValidation,
  getSubjectByIdValidation,
  searchSubjectsValidation,
} from "../validators/subject.validator.js";
import { validate } from "../middlewares/validate.js";
import { isSysAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   GET /api/subjects
 * @desc    Get all subjects with pagination
 * @access  Private - SysAdmin only
 */
router.get("/", isSysAdmin, getAllSubjectsValidation, validate, getAllSubjects);

/**
 * @route   GET /api/subjects/search
 * @desc    Search subjects by name or code
 * @access  Private - SysAdmin only
 */
router.get(
  "/search",
  isSysAdmin,
  searchSubjectsValidation,
  validate,
  searchSubjects
);

/**
 * @route   GET /api/subjects/:subjectId
 * @desc    Get subject by ID
 * @access  Private - SysAdmin only
 */
router.get(
  "/:subjectId",
  isSysAdmin,
  getSubjectByIdValidation,
  validate,
  getSubjectById
);

export default router;
