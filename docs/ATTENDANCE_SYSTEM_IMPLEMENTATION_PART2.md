# Part 2: Attendance Controllers, Validators, and Routes

## Attendance Controller

#### `/src/controllers/college-admin-attendance.controller.js`

```javascript
import {
  markAttendanceService,
  getAttendanceBySectionDateService,
  getAttendanceByStudentService,
  updateAttendanceService,
  deleteAttendanceService,
  getStudentAttendanceStatsService,
  getSectionAttendanceStatsService,
  generateAttendanceSheetService,
} from "../services/college-admin-attendance.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

export const markAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await markAttendanceService(
      attendanceData,
      college._id.toString(),
      userId
    );

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Error in markAttendance:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to mark attendance",
    });
  }
};

export const getAttendanceBySectionDate = async (req, res) => {
  try {
    const { sectionId, subjectId, date } = req.query;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 200;

    if (!sectionId || !subjectId || !date) {
      return res.status(400).json({
        success: false,
        message: "sectionId, subjectId, and date are required",
      });
    }

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAttendanceBySectionDateService(
      college._id.toString(),
      sectionId,
      subjectId,
      date,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Attendance retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAttendanceBySectionDate:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve attendance",
    });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const filters = {};
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;
    if (req.query.subjectId) filters.subjectId = req.query.subjectId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAttendanceByStudentService(
      college._id.toString(),
      studentId,
      filters,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Student attendance retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAttendanceByStudent:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve student attendance",
    });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const attendance = await updateAttendanceService(
      attendanceId,
      updateData,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update attendance",
    });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await deleteAttendanceService(
      attendanceId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteAttendance:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete attendance",
    });
  }
};

export const getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId, startDate, endDate } = req.query;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getStudentAttendanceStatsService(
      college._id.toString(),
      studentId,
      subjectId || null,
      startDate || null,
      endDate || null
    );

    return res.status(200).json({
      success: true,
      message: "Student attendance statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getStudentAttendanceStats:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve attendance statistics",
    });
  }
};

export const getSectionAttendanceStats = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { subjectId, startDate, endDate } = req.query;
    const userId = req.user.userId;

    if (!subjectId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "subjectId, startDate, and endDate are required",
      });
    }

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const stats = await getSectionAttendanceStatsService(
      college._id.toString(),
      sectionId,
      subjectId,
      startDate,
      endDate
    );

    return res.status(200).json({
      success: true,
      message: "Section attendance statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error in getSectionAttendanceStats:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve section statistics",
    });
  }
};

export const generateAttendanceSheet = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const sheet = await generateAttendanceSheetService(
      college._id.toString(),
      sectionId
    );

    return res.status(200).json({
      success: true,
      message: "Attendance sheet generated successfully",
      data: sheet,
    });
  } catch (error) {
    console.error("Error in generateAttendanceSheet:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate attendance sheet",
    });
  }
};
```

## Validators

Create these validator files to ensure data integrity:

#### `/src/validators/college-admin-subject.validator.js`

```javascript
import { body, param, query } from "express-validator";

export const createSubjectValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Subject name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Subject code is required")
    .isLength({ min: 2, max: 20 })
    .withMessage("Code must be between 2 and 20 characters")
    .toUpperCase(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

export const updateSubjectValidation = [
  param("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("code")
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage("Code must be between 2 and 20 characters")
    .toUpperCase(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

export const subjectIdValidation = [
  param("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required")
    .isMongoId()
    .withMessage("Invalid Subject ID"),
];

export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
```

#### `/src/validators/college-admin-section.validator.js`

```javascript
import { body, param, query } from "express-validator";

export const createSectionValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Section name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("programId")
    .notEmpty()
    .withMessage("Program ID is required")
    .isMongoId()
    .withMessage("Invalid Program ID"),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),

  body("shift")
    .notEmpty()
    .withMessage("Shift is required")
    .isIn(["1st Shift", "2nd Shift", "Morning", "Evening"])
    .withMessage("Invalid shift"),

  body("rollNumberRange.start")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range start must be a positive integer"),

  body("rollNumberRange.end")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range end must be a positive integer"),

  body("subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array"),

  body("subjects.*").optional().isMongoId().withMessage("Invalid Subject ID"),

  body("capacity")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Capacity must be between 1 and 500"),
];

export const updateSectionValidation = [
  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("year")
    .optional()
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),

  body("shift")
    .optional()
    .isIn(["1st Shift", "2nd Shift", "Morning", "Evening"])
    .withMessage("Invalid shift"),

  body("rollNumberRange.start")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range start must be a positive integer"),

  body("rollNumberRange.end")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Roll number range end must be a positive integer"),

  body("capacity")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Capacity must be between 1 and 500"),
];

export const splitSectionValidation = [
  body("programId")
    .notEmpty()
    .withMessage("Program ID is required")
    .isMongoId()
    .withMessage("Invalid Program ID"),

  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),

  body("sectionRanges")
    .notEmpty()
    .withMessage("Section ranges are required")
    .isArray({ min: 1 })
    .withMessage("Section ranges must be an array with at least one item"),

  body("sectionRanges.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each section must have a name"),

  body("sectionRanges.*.start")
    .isInt({ min: 1 })
    .withMessage("Start roll number must be a positive integer"),

  body("sectionRanges.*.end")
    .isInt({ min: 1 })
    .withMessage("End roll number must be a positive integer"),

  body("sectionRanges.*.shift")
    .optional()
    .isIn(["1st Shift", "2nd Shift", "Morning", "Evening"])
    .withMessage("Invalid shift"),
];

export const assignStudentValidation = [
  body("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  body("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),
];

export const bulkAssignValidation = [
  body("assignments")
    .notEmpty()
    .withMessage("Assignments array is required")
    .isArray({ min: 1 })
    .withMessage("Assignments must be an array with at least one item"),

  body("assignments.*.studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID"),

  body("assignments.*.sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),
];

export const sectionIdValidation = [
  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID"),
];

export const sectionPaginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("programId").optional().isMongoId().withMessage("Invalid Program ID"),

  query("year")
    .optional()
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),
];
```

## CONTINUE TO PART 3...
