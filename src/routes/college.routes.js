import express from "express";
import {
  getAllColleges,
  getCollegeById,
  searchColleges,
  createCollege,
  updateCollege,
} from "../controllers/college.controller.js";
import {
  getAllCollegesValidation,
  getCollegeByIdValidation,
  searchCollegesValidation,
  createCollegeValidation,
  updateCollegeValidation,
} from "../validators/college.validator.js";
import { validate } from "../middlewares/validate.js";
import { isSysAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/colleges
 * @desc    Create new college
 * @access  Private - SysAdmin only
 */
router.post("/", isSysAdmin, createCollegeValidation, validate, createCollege);

/**
 * @route   GET /api/colleges
 * @desc    Get all colleges with pagination
 * @access  Private - SysAdmin only
 */
router.get("/", isSysAdmin, getAllCollegesValidation, validate, getAllColleges);

/**
 * @route   GET /api/colleges/search
 * @desc    Search colleges by name, code, or city
 * @access  Private - SysAdmin only
 */
router.get(
  "/search",
  isSysAdmin,
  searchCollegesValidation,
  validate,
  searchColleges
);

/**
 * @route   GET /api/colleges/:collegeId
 * @desc    Get college by ID
 * @access  Private - SysAdmin only
 */
router.get(
  "/:collegeId",
  isSysAdmin,
  getCollegeByIdValidation,
  validate,
  getCollegeById
);

/**
 * @route   PUT /api/colleges/:collegeId
 * @desc    Update college
 * @access  Private - SysAdmin only
 */
router.put(
  "/:collegeId",
  isSysAdmin,
  updateCollegeValidation,
  validate,
  updateCollege
);

export default router;
