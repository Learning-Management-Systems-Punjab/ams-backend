import express from "express";
import {
  createDistrictHead,
  getDistrictHeadById,
  getAllDistrictHeads,
  updateDistrictHead,
  getDistrictHeadByRegion,
  searchDistrictHeads,
  resetDistrictHeadPassword,
  exportDistrictHeadsToCSV,
} from "../controllers/districtHead.controller.js";
import {
  createDistrictHeadValidation,
  updateDistrictHeadValidation,
  getDistrictHeadByIdValidation,
  getDistrictHeadByRegionValidation,
  getAllDistrictHeadsValidation,
  searchDistrictHeadsValidation,
  resetDistrictHeadPasswordValidation,
  exportDistrictHeadsValidation,
} from "../validators/districtHead.validator.js";
import { validate } from "../middlewares/validate.js";
import { isSysAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/district-heads
 * @desc    Create new district head
 * @access  Private - SysAdmin only
 */
router.post(
  "/",
  isSysAdmin,
  createDistrictHeadValidation,
  validate,
  createDistrictHead
);

/**
 * @route   GET /api/district-heads
 * @desc    Get all district heads with pagination
 * @access  Private - SysAdmin only
 */
router.get(
  "/",
  isSysAdmin,
  getAllDistrictHeadsValidation,
  validate,
  getAllDistrictHeads
);

/**
 * @route   GET /api/district-heads/search
 * @desc    Search district heads by name, email, or CNIC
 * @access  Private - SysAdmin only
 */
router.get(
  "/search",
  isSysAdmin,
  searchDistrictHeadsValidation,
  validate,
  searchDistrictHeads
);

/**
 * @route   GET /api/district-heads/export/csv
 * @desc    Export all district heads to CSV (with optional password reset)
 * @access  Private - SysAdmin only
 */
router.get(
  "/export/csv",
  isSysAdmin,
  exportDistrictHeadsValidation,
  validate,
  exportDistrictHeadsToCSV
);

/**
 * @route   GET /api/district-heads/region/:regionId
 * @desc    Get district head by region
 * @access  Private - SysAdmin only
 */
router.get(
  "/region/:regionId",
  isSysAdmin,
  getDistrictHeadByRegionValidation,
  validate,
  getDistrictHeadByRegion
);

/**
 * @route   POST /api/district-heads/:districtHeadId/reset-password
 * @desc    Reset district head password
 * @access  Private - SysAdmin only
 */
router.post(
  "/:districtHeadId/reset-password",
  isSysAdmin,
  resetDistrictHeadPasswordValidation,
  validate,
  resetDistrictHeadPassword
);

/**
 * @route   GET /api/district-heads/:userId
 * @desc    Get district head by user ID
 * @access  Private - SysAdmin only
 */
router.get(
  "/:userId",
  isSysAdmin,
  getDistrictHeadByIdValidation,
  validate,
  getDistrictHeadById
);

/**
 * @route   PUT /api/district-heads/:districtHeadId
 * @desc    Update district head
 * @access  Private - SysAdmin only
 */
router.put(
  "/:districtHeadId",
  isSysAdmin,
  updateDistrictHeadValidation,
  validate,
  updateDistrictHead
);

export default router;
