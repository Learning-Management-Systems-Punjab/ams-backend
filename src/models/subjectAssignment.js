import mongoose from "mongoose";

const subjectAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      comment: "e.g., 2024-2025",
    },
    semester: {
      type: String,
      enum: ["Fall", "Spring", "Summer"],
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: {
          type: String,
          comment: "e.g., 08:00",
        },
        endTime: {
          type: String,
          comment: "e.g., 09:00",
        },
        room: {
          type: String,
          trim: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: One teacher can teach one subject in one section per semester
subjectAssignmentSchema.index(
  { teacherId: 1, subjectId: 1, sectionId: 1, academicYear: 1, semester: 1 },
  { unique: true }
);

// Indexes for efficient queries
subjectAssignmentSchema.index({ teacherId: 1, collegeId: 1, isActive: 1 });
subjectAssignmentSchema.index({ sectionId: 1, isActive: 1 });
subjectAssignmentSchema.index({ collegeId: 1, academicYear: 1, semester: 1 });

const SubjectAssignment = mongoose.model(
  "SubjectAssignment",
  subjectAssignmentSchema
);

export default SubjectAssignment;
