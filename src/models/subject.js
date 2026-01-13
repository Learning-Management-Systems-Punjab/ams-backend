import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: code should be unique per college
subjectSchema.index({ collegeId: 1, code: 1 }, { unique: true });
subjectSchema.index({ collegeId: 1, isActive: 1 });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
