import express from "express";
import {
  createRegion,
  getRegionById,
  getAllRegions,
  updateRegion,
  deleteRegion,
} from "../controllers/region.controller.js";
import {
  createRegionValidation,
  updateRegionValidation,
  getRegionByIdValidation,
  deleteRegionValidation,
  getAllRegionsValidation,
} from "../validators/region.validator.js";
import { validate } from "../middlewares/validate.js";
import { isSysAdmin } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/regions
 * @desc    Create new region
 * @access  Private - SysAdmin only
 */
router.post("/", isSysAdmin, createRegionValidation, validate, createRegion);

/**
 * @route   GET /api/regions
 * @desc    Get all regions with pagination
 * @access  Private - SysAdmin only
 */
router.get("/", isSysAdmin, getAllRegionsValidation, validate, getAllRegions);

/**
 * @route   GET /api/regions/:regionId
 * @desc    Get region by ID
 * @access  Private - SysAdmin only
 */
router.get(
  "/:regionId",
  isSysAdmin,
  getRegionByIdValidation,
  validate,
  getRegionById
);

/**
 * @route   PUT /api/regions/:regionId
 * @desc    Update region
 * @access  Private - SysAdmin only
 */
router.put(
  "/:regionId",
  isSysAdmin,
  updateRegionValidation,
  validate,
  updateRegion
);

/**
 * @route   DELETE /api/regions/:regionId
 * @desc    Delete region (soft delete)
 * @access  Private - SysAdmin only
 */
router.delete(
  "/:regionId",
  isSysAdmin,
  deleteRegionValidation,
  validate,
  deleteRegion
);

export default router;
