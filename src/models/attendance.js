import mongoose from "mongoose";

/**
 * Attendance Model
 * Tracks daily attendance for students in a section for a specific subject
 */
const attendanceSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave", "Excused"],
      required: true,
      default: "Absent",
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: Number,
      min: 1,
      max: 10,
      comment: "Class period number (1-10)",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries and uniqueness
attendanceSchema.index({ collegeId: 1, date: 1, isActive: 1 });
attendanceSchema.index({ collegeId: 1, studentId: 1, date: 1 });
attendanceSchema.index({ collegeId: 1, sectionId: 1, subjectId: 1, date: 1 });
attendanceSchema.index(
  {
    studentId: 1,
    sectionId: 1,
    subjectId: 1,
    date: 1,
    period: 1,
  },
  { unique: true, sparse: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
