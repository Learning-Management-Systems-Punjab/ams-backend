import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      comment: "e.g., Section A, Section B",
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    year: {
      type: String,
      required: true,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    shift: {
      type: String,
      required: true,
      enum: ["1st Shift", "2nd Shift", "Morning", "Evening"],
      default: "1st Shift",
    },
    rollNumberRange: {
      start: {
        type: Number,
        required: false, // Optional - will be set when proper sections are created
      },
      end: {
        type: Number,
        required: false, // Optional - will be set when proper sections are created
      },
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    capacity: {
      type: Number,
      default: 50,
    },
    currentStrength: {
      type: Number,
      default: 0,
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

// Compound index for efficient queries
sectionSchema.index({ collegeId: 1, programId: 1, year: 1, shift: 1 });
sectionSchema.index({ collegeId: 1, isActive: 1 });

const Section = mongoose.model("Section", sectionSchema);

export default Section;
