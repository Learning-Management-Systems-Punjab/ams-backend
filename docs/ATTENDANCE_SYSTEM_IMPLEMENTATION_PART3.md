# Part 3: Remaining Validators and All Routes

## Remaining Validators

#### `/src/validators/college-admin-teacherAssignment.validator.js`

```javascript
import { body, param, query } from "express-validator";

export const createAssignmentValidation = [
  body("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid Teacher ID"),

  body("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  body("academicYear")
    .trim()
    .notEmpty()
    .withMessage("Academic year is required")
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in format YYYY-YYYY (e.g., 2025-2026)"),

  body("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isIn(["Fall", "Spring", "Summer"])
    .withMessage("Semester must be Fall, Spring, or Summer"),
];

export const updateAssignmentValidation = [
  param("assignmentId")
    .notEmpty()
    .withMessage("Assignment ID is required")
    .isMongoId()
    .withMessage("Invalid Assignment ID"),

  body("academicYear")
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in format YYYY-YYYY"),

  body("semester")
    .optional()
    .isIn(["Fall", "Spring", "Summer"])
    .withMessage("Semester must be Fall, Spring, or Summer"),
];

export const assignmentIdValidation = [
  param("assignmentId")
    .notEmpty()
    .withMessage("Assignment ID is required")
    .isMongoId()
    .withMessage("Invalid Assignment ID"),
];

export const teacherIdValidation = [
  param("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required")
    .isMongoId()
    .withMessage("Invalid Teacher ID"),
];

export const assignmentPaginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("academicYear")
    .optional()
    .trim()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage("Academic year must be in format YYYY-YYYY"),

  query("semester")
    .optional()
    .isIn(["Fall", "Spring", "Summer"])
    .withMessage("Semester must be Fall, Spring, or Summer"),

  query("programId").optional().isMongoId().withMessage("Invalid Program ID"),
];
```

#### `/src/validators/college-admin-attendance.validator.js`

```javascript
import { body, param, query } from "express-validator";

export const markAttendanceValidation = [
  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  body("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),

  body("period")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Period must be between 1 and 10"),

  body("attendanceRecords")
    .notEmpty()
    .withMessage("Attendance records are required")
    .isArray({ min: 1 })
    .withMessage(
      "Attendance records must be an array with at least one record"
    ),

  body("attendanceRecords.*.studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  body("attendanceRecords.*.status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Present", "Absent", "Late", "Leave", "Excused"])
    .withMessage("Status must be Present, Absent, Late, Leave, or Excused"),

  body("attendanceRecords.*.remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks must not exceed 500 characters"),
];

export const getAttendanceByDateValidation = [
  query("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  query("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO 8601 date"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Limit must be between 1 and 500"),
];

export const getStudentAttendanceValidation = [
  param("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),

  query("subjectId").optional().isMongoId().withMessage("Invalid Subject ID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Limit must be between 1 and 200"),
];

export const updateAttendanceValidation = [
  param("attendanceId")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isMongoId()
    .withMessage("Invalid Attendance ID"),

  body("status")
    .optional()
    .isIn(["Present", "Absent", "Late", "Leave", "Excused"])
    .withMessage("Status must be Present, Absent, Late, Leave, or Excused"),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks must not exceed 500 characters"),
];

export const attendanceIdValidation = [
  param("attendanceId")
    .notEmpty()
    .withMessage("Attendance ID is required")
    .isMongoId()
    .withMessage("Invalid Attendance ID"),
];

export const studentStatsValidation = [
  param("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  query("subjectId").optional().isMongoId().withMessage("Invalid Subject ID"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];

export const sectionStatsValidation = [
  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  query("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  query("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
];
```

## Routes

#### `/src/routes/college-admin-subject.routes.js`

```javascript
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
```

#### `/src/routes/college-admin-section.routes.js`

```javascript
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
```

#### `/src/routes/college-admin-teacherAssignment.routes.js`

```javascript
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
```

#### `/src/routes/college-admin-attendance.routes.js`

```javascript
import express from "express";
import {
  markAttendance,
  getAttendanceBySectionDate,
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceStats,
  getSectionAttendanceStats,
  generateAttendanceSheet,
} from "../controllers/college-admin-attendance.controller.js";
import {
  markAttendanceValidation,
  getAttendanceByDateValidation,
  getStudentAttendanceValidation,
  updateAttendanceValidation,
  attendanceIdValidation,
  studentStatsValidation,
  sectionStatsValidation,
} from "../validators/college-admin-attendance.validator.js";
import { sectionIdValidation } from "../validators/college-admin-section.validator.js";
import { validate } from "../middlewares/validate.js";
import { isCollegeAdmin } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/college-admin/attendance/mark - Mark attendance
router.post(
  "/mark",
  ...isCollegeAdmin,
  markAttendanceValidation,
  validate,
  markAttendance
);

// GET /api/college-admin/attendance - Get attendance by section and date
router.get(
  "/",
  ...isCollegeAdmin,
  getAttendanceByDateValidation,
  validate,
  getAttendanceBySectionDate
);

// GET /api/college-admin/attendance/student/:studentId - Get student attendance
router.get(
  "/student/:studentId",
  ...isCollegeAdmin,
  getStudentAttendanceValidation,
  validate,
  getAttendanceByStudent
);

// GET /api/college-admin/attendance/stats/student/:studentId - Student stats
router.get(
  "/stats/student/:studentId",
  ...isCollegeAdmin,
  studentStatsValidation,
  validate,
  getStudentAttendanceStats
);

// GET /api/college-admin/attendance/stats/section/:sectionId - Section stats
router.get(
  "/stats/section/:sectionId",
  ...isCollegeAdmin,
  sectionStatsValidation,
  validate,
  getSectionAttendanceStats
);

// GET /api/college-admin/attendance/sheet/:sectionId - Generate attendance sheet
router.get(
  "/sheet/:sectionId",
  ...isCollegeAdmin,
  sectionIdValidation,
  validate,
  generateAttendanceSheet
);

// PUT /api/college-admin/attendance/:attendanceId - Update attendance
router.put(
  "/:attendanceId",
  ...isCollegeAdmin,
  updateAttendanceValidation,
  validate,
  updateAttendance
);

// DELETE /api/college-admin/attendance/:attendanceId - Delete attendance
router.delete(
  "/:attendanceId",
  ...isCollegeAdmin,
  attendanceIdValidation,
  validate,
  deleteAttendance
);

export default router;
```

## Register Routes in Main Router

Update `/src/routes/index.js`:

```javascript
import subjectRoutes from "./college-admin-subject.routes.js";
import sectionRoutes from "./college-admin-section.routes.js";
import teacherAssignmentRoutes from "./college-admin-teacherAssignment.routes.js";
import attendanceRoutes from "./college-admin-attendance.routes.js";

// Register new routes
router.use("/college-admin/subjects", subjectRoutes);
router.use("/college-admin/sections", sectionRoutes);
router.use("/college-admin/teacher-assignments", teacherAssignmentRoutes);
router.use("/college-admin/attendance", attendanceRoutes);
```

## Testing Checklist

1. **Subjects** ✅

   - Create subject
   - List subjects with pagination
   - Get subject by ID
   - Update subject
   - Delete subject

2. **Sections** ✅

   - Create section
   - List sections (filter by program/year)
   - Get section by ID
   - Update section (including roll ranges)
   - Delete section
   - Split sections by roll number ranges
   - Assign single student to section
   - Bulk assign students to sections

3. **Teacher Assignments** ✅

   - Create assignment
   - List all assignments (filter by year/semester/program)
   - Get assignments by teacher
   - Get assignments by section
   - Update assignment
   - Delete assignment

4. **Attendance** ✅
   - Mark attendance for section
   - Get attendance by section and date
   - Get attendance by student
   - Update attendance record
   - Delete attendance record
   - Get student attendance statistics
   - Get section attendance statistics
   - Generate attendance sheet

All operations are **college-scoped** and properly validated!
