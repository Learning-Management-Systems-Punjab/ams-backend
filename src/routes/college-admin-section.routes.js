import express from "express";
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
  splitSectionByRollRanges,
  assignStudentToSection,
  bulkAssignStudentsToSections,
} from "../controllers/college-admin-section.controller.js";
import {
  createSectionValidation,
  updateSectionValidation,
  sectionIdValidation,
  sectionPaginationValidation,
  splitSectionValidation,
  assignStudentValidation,
  bulkAssignValidation,
} from "../validators/college-admin-section.validator.js";
import { validate } from "../middlewares/validate.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/college-admin/sections/split-by-roll-ranges - Split sections by roll ranges
router.post(
  "/split-by-roll-ranges",
  ...isCollegeAdmin,
  splitSectionValidation,
  validate,
  splitSectionByRollRanges
);

// POST /api/college-admin/sections/assign-student - Assign student to section
router.post(
  "/assign-student",
  ...isCollegeAdmin,
  assignStudentValidation,
  validate,
  assignStudentToSection
);

// POST /api/college-admin/sections/bulk-assign - Bulk assign students
router.post(
  "/bulk-assign",
  ...isCollegeAdmin,
  bulkAssignValidation,
  validate,
  bulkAssignStudentsToSections
);

// POST /api/college-admin/sections - Create section
router.post(
  "/",
  ...isCollegeAdmin,
  createSectionValidation,
  validate,
  createSection
);

// GET /api/college-admin/sections - Get all sections
router.get(
  "/",
  ...isCollegeAdmin,
  sectionPaginationValidation,
  validate,
  getAllSections
);

// GET /api/college-admin/sections/:sectionId - Get section by ID
router.get(
  "/:sectionId",
  ...isCollegeAdmin,
  sectionIdValidation,
  validate,
  getSectionById
);

// PUT /api/college-admin/sections/:sectionId - Update section
router.put(
  "/:sectionId",
  ...isCollegeAdmin,
  updateSectionValidation,
  validate,
  updateSection
);

// DELETE /api/college-admin/sections/:sectionId - Delete section
router.delete(
  "/:sectionId",
  ...isCollegeAdmin,
  sectionIdValidation,
  validate,
  deleteSection
);

export default router;
