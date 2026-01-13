import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
      required: true,
    },
    religion: {
      type: String,
      required: true,
      trim: true,
    },
    highestQualification: {
      type: String,
      required: true,
      trim: true,
    },
    domicile: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    presentAddress: {
      type: String,
      required: true,
      trim: true,
    },
    personalNumber: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    bps: {
      type: Number,
      required: true,
      min: 1,
      max: 22,
    },
    employmentStatus: {
      type: String,
      enum: ["Regular", "Contract"],
      required: true,
    },
    superannuation: {
      type: Date,
      required: true,
    },
    joinedServiceAt: {
      type: Date,
      required: true,
    },
    joinedCollegeAt: {
      type: Date,
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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

teacherSchema.index({ collegeId: 1, isActive: 1 });

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
