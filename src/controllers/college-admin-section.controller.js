import {
  createSectionService,
  getAllSectionsService,
  getSectionByIdService,
  updateSectionService,
  deleteSectionService,
  splitSectionByRollRangesService,
  assignStudentToSectionService,
  bulkAssignStudentsToSectionsService,
} from "../services/college-admin-section.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

export const createSection = async (req, res) => {
  try {
    const sectionData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const section = await createSectionService(
      sectionData,
      college._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: section,
    });
  } catch (error) {
    console.error("Error in createSection:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create section",
    });
  }
};

export const getAllSections = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const filters = {};
    if (req.query.programId) filters.programId = req.query.programId;
    if (req.query.year) filters.year = req.query.year;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAllSectionsService(
      college._id.toString(),
      page,
      limit,
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllSections:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve sections",
    });
  }
};

export const getSectionById = async (req, res) => {
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

    const section = await getSectionByIdService(
      sectionId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Section retrieved successfully",
      data: section,
    });
  } catch (error) {
    console.error("Error in getSectionById:", error);
    return res.status(404).json({
      success: false,
      message: error.message || "Section not found",
    });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const section = await updateSectionService(
      sectionId,
      updateData,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: section,
    });
  } catch (error) {
    console.error("Error in updateSection:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update section",
    });
  }
};

export const deleteSection = async (req, res) => {
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

    const result = await deleteSectionService(
      sectionId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteSection:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete section",
    });
  }
};

export const splitSectionByRollRanges = async (req, res) => {
  try {
    const { programId, year, sectionRanges } = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await splitSectionByRollRangesService(
      college._id.toString(),
      programId,
      year,
      sectionRanges
    );

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Error in splitSectionByRollRanges:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to split sections",
    });
  }
};

export const assignStudentToSection = async (req, res) => {
  try {
    const { studentId, sectionId } = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await assignStudentToSectionService(
      college._id.toString(),
      studentId,
      sectionId
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Error in assignStudentToSection:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to assign student to section",
    });
  }
};

export const bulkAssignStudentsToSections = async (req, res) => {
  try {
    const { assignments } = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await bulkAssignStudentsToSectionsService(
      college._id.toString(),
      assignments
    );

    return res.status(200).json({
      success: true,
      message: "Bulk assignment completed",
      data: result,
    });
  } catch (error) {
    console.error("Error in bulkAssignStudentsToSections:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to assign students",
    });
  }
};
