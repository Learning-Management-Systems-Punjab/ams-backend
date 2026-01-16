import {
  createSubjectService,
  getAllSubjectsService,
  getSubjectByIdService,
  updateSubjectService,
  deleteSubjectService,
} from "../services/college-admin-subject.service.js";
import { findCollegeByUserId } from "../dal/college.dal.js";

export const createSubject = async (req, res) => {
  try {
    const subjectData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const subject = await createSubjectService(
      subjectData,
      college._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Error in createSubject:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create subject",
    });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await getAllSubjectsService(
      college._id.toString(),
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Subjects retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getAllSubjects:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve subjects",
    });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const subject = await getSubjectByIdService(
      subjectId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Subject retrieved successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Error in getSubjectById:", error);
    return res.status(404).json({
      success: false,
      message: error.message || "Subject not found",
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const subject = await updateSubjectService(
      subjectId,
      updateData,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Error in updateSubject:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update subject",
    });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.userId;

    const college = await findCollegeByUserId(userId);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found for this admin",
      });
    }

    const result = await deleteSubjectService(
      subjectId,
      college._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteSubject:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete subject",
    });
  }
};
