import mongoose from "mongoose";

/**
 * TeacherAssignment Model
 * Links teachers to subjects and sections for a specific academic period
 */
const teacherAssignmentSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      comment: "e.g., 2025-2026",
    },
    semester: {
      type: String,
      enum: ["Fall", "Spring", "Summer"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
teacherAssignmentSchema.index({ collegeId: 1, isActive: 1 });
teacherAssignmentSchema.index({ collegeId: 1, teacherId: 1, isActive: 1 });
teacherAssignmentSchema.index({ collegeId: 1, sectionId: 1, subjectId: 1 });
teacherAssignmentSchema.index(
  {
    collegeId: 1,
    teacherId: 1,
    subjectId: 1,
    sectionId: 1,
    academicYear: 1,
    semester: 1,
  },
  { unique: true }
);

const TeacherAssignment = mongoose.model(
  "TeacherAssignment",
  teacherAssignmentSchema
);

export default TeacherAssignment;
