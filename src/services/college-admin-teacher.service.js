import {
  createTeacher,
  findTeacherById,
  findTeacherByUserId,
  findTeacherByEmail,
  findTeacherByCnic,
  findTeacherByPersonalNumber,
  findTeachersByCollegeId,
  countTeachersByCollegeId,
  searchTeachersByCollege,
  countSearchTeachersByCollege,
  updateTeacher,
  deleteTeacher,
  bulkCreateTeachers,
  isEmailExists,
  isCnicExists,
  isPersonalNumberExists,
} from "../dal/teacher.dal.js";
import { createUser, findUserByEmail, updateUser } from "../dal/user.dal.js";
import { findCollegeById } from "../dal/college.dal.js";
import { hashPassword, generateRandomString } from "../utils/helpers.js";
import mongoose from "mongoose";

/**
 * Generate unique email for teacher
 * Format: firstname.lastname@decfsd.edu.pk
 * @param {String} name
 * @returns {Promise<String>}
 */
const generateTeacherEmail = async (name) => {
  // Normalize name: lowercase, remove extra spaces, replace spaces with dots
  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z.]/g, ""); // Remove special characters

  let email = `${normalizedName}@decfsd.edu.pk`;

  // Check if email exists
  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    return email;
  }

  // If exists, try variations
  // 1. Try reversing first and last name
  const nameParts = normalizedName.split(".");
  if (nameParts.length >= 2) {
    const reversedName = `${nameParts[nameParts.length - 1]}.${nameParts[0]}`;
    email = `${reversedName}@decfsd.edu.pk`;
    const existingReversed = await findUserByEmail(email);
    if (!existingReversed) {
      return email;
    }
  }

  // 2. Add numbers 1-99
  for (let i = 1; i <= 99; i++) {
    email = `${normalizedName}${i}@decfsd.edu.pk`;
    const existingNumbered = await findUserByEmail(email);
    if (!existingNumbered) {
      return email;
    }
  }

  // 3. Add random string as last resort
  const randomStr = Math.random().toString(36).substring(2, 6);
  email = `${normalizedName}.${randomStr}@decfsd.edu.pk`;
  return email;
};

/**
 * Create new teacher
 * @param {Object} teacherData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const createTeacherService = async (teacherData, collegeId) => {
  const {
    name,
    fatherName,
    gender,
    cnic,
    dateOfBirth,
    maritalStatus,
    religion,
    highestQualification,
    domicile,
    contactNumber,
    contactEmail,
    presentAddress,
    personalNumber,
    designation,
    bps,
    employmentStatus,
    superannuation,
    joinedServiceAt,
    joinedCollegeAt,
    password,
  } = teacherData;

  // Validate college exists
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Check if CNIC already exists
  const existingCnic = await findTeacherByCnic(cnic);
  if (existingCnic) {
    throw new Error("Teacher with this CNIC already exists");
  }

  // Check if personal number already exists
  const existingPersonalNumber = await findTeacherByPersonalNumber(
    personalNumber
  );
  if (existingPersonalNumber) {
    throw new Error("Teacher with this personal number already exists");
  }

  // Generate unique email for teacher
  const generatedEmail = await generateTeacherEmail(name);

  // Check if contact email exists
  const existingContactEmail = await isEmailExists(contactEmail);
  if (existingContactEmail) {
    throw new Error("Teacher with this contact email already exists");
  }

  // Generate password if not provided
  const teacherPassword = password || generateRandomString(12);
  const hashedPassword = await hashPassword(teacherPassword);

  // Create user account with auto-generated email
  const user = await createUser({
    email: generatedEmail,
    password: hashedPassword,
    role: "Teacher",
  });

  // Create teacher
  const teacher = await createTeacher({
    name,
    fatherName,
    gender,
    cnic,
    dateOfBirth,
    maritalStatus,
    religion,
    highestQualification,
    domicile,
    contactNumber,
    contactEmail,
    presentAddress,
    personalNumber,
    designation,
    bps,
    employmentStatus,
    superannuation,
    joinedServiceAt,
    joinedCollegeAt,
    collegeId,
    userId: user._id,
  });

  const populatedTeacher = await findTeacherById(teacher._id);

  return {
    teacher: populatedTeacher,
    credentials: {
      loginEmail: generatedEmail,
      password: teacherPassword, // Return plain password once
    },
  };
};

/**
 * Get all teachers for a college with pagination
 * @param {String} collegeId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllTeachersService = async (
  collegeId,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [teachers, total] = await Promise.all([
    findTeachersByCollegeId(collegeId, { skip, limit }),
    countTeachersByCollegeId(collegeId),
  ]);

  return {
    teachers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get teacher by ID (college-scoped)
 * @param {String} teacherId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const getTeacherByIdService = async (teacherId, collegeId) => {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  // Verify teacher belongs to the college
  if (teacher.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Teacher does not belong to your college");
  }

  return teacher;
};

/**
 * Update teacher (college-scoped)
 * @param {String} teacherId
 * @param {Object} updateData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const updateTeacherService = async (
  teacherId,
  updateData,
  collegeId
) => {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  // Verify teacher belongs to the college
  if (teacher.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Teacher does not belong to your college");
  }

  // Check if updating CNIC and it already exists
  if (updateData.cnic && updateData.cnic !== teacher.cnic) {
    const existingCnic = await isCnicExists(updateData.cnic, teacherId);
    if (existingCnic) {
      throw new Error("Teacher with this CNIC already exists");
    }
  }

  // Check if updating personal number and it already exists
  if (
    updateData.personalNumber &&
    updateData.personalNumber !== teacher.personalNumber
  ) {
    const existingPersonalNumber = await isPersonalNumberExists(
      updateData.personalNumber,
      teacherId
    );
    if (existingPersonalNumber) {
      throw new Error("Teacher with this personal number already exists");
    }
  }

  // Check if updating contact email and it already exists
  if (
    updateData.contactEmail &&
    updateData.contactEmail !== teacher.contactEmail
  ) {
    const existingContactEmail = await isEmailExists(
      updateData.contactEmail,
      teacherId
    );
    if (existingContactEmail) {
      throw new Error("Teacher with this contact email already exists");
    }
  }

  // Prevent updating collegeId, userId
  delete updateData.collegeId;
  delete updateData.userId;

  const updatedTeacher = await updateTeacher(teacherId, updateData);
  return updatedTeacher;
};

/**
 * Delete teacher (college-scoped)
 * @param {String} teacherId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const deleteTeacherService = async (teacherId, collegeId) => {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  // Verify teacher belongs to the college
  if (teacher.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Teacher does not belong to your college");
  }

  await deleteTeacher(teacherId);

  return {
    message: "Teacher deleted successfully",
    teacherId,
  };
};

/**
 * Search teachers (college-scoped)
 * @param {String} collegeId
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchTeachersService = async (
  collegeId,
  searchQuery,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [teachers, total] = await Promise.all([
    searchTeachersByCollege(collegeId, searchQuery, { skip, limit }),
    countSearchTeachersByCollege(collegeId, searchQuery),
  ]);

  return {
    teachers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Reset teacher password
 * @param {String} teacherId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const resetTeacherPasswordService = async (teacherId, collegeId) => {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  // Verify teacher belongs to the college
  if (teacher.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Teacher does not belong to your college");
  }

  // Generate new random password
  const newPassword = generateRandomString(12);
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await updateUser(teacher.userId._id, { password: hashedPassword });

  return {
    teacherId: teacher._id,
    name: teacher.name,
    loginEmail: teacher.userId.email,
    newPassword, // Return plain password to frontend
  };
};

/**
 * Bulk import teachers
 * @param {Array} teachersData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const bulkImportTeachersService = async (teachersData, collegeId) => {
  // Validate college exists
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  const results = {
    successful: [],
    failed: [],
  };

  // Process each teacher
  for (let i = 0; i < teachersData.length; i++) {
    const teacherData = teachersData[i];
    const rowNumber = i + 1;

    try {
      // Validate required fields
      if (
        !teacherData.name ||
        !teacherData.cnic ||
        !teacherData.personalNumber
      ) {
        throw new Error(
          "Missing required fields: name, cnic, or personalNumber"
        );
      }

      // Check if CNIC already exists
      const existingCnic = await findTeacherByCnic(teacherData.cnic);
      if (existingCnic) {
        throw new Error(`Teacher with CNIC ${teacherData.cnic} already exists`);
      }

      // Check if personal number already exists
      const existingPersonalNumber = await findTeacherByPersonalNumber(
        teacherData.personalNumber
      );
      if (existingPersonalNumber) {
        throw new Error(
          `Teacher with personal number ${teacherData.personalNumber} already exists`
        );
      }

      // Check if contact email exists
      if (teacherData.contactEmail) {
        const existingContactEmail = await isEmailExists(
          teacherData.contactEmail
        );
        if (existingContactEmail) {
          throw new Error(
            `Teacher with contact email ${teacherData.contactEmail} already exists`
          );
        }
      }

      // Generate unique login email
      const generatedEmail = await generateTeacherEmail(teacherData.name);

      // Generate password
      const password = generateRandomString(12);
      const hashedPassword = await hashPassword(password);

      // Create user account
      const user = await createUser({
        email: generatedEmail,
        password: hashedPassword,
        role: "Teacher",
      });

      // Create teacher
      const teacher = await createTeacher({
        ...teacherData,
        collegeId,
        userId: user._id,
      });

      results.successful.push({
        row: rowNumber,
        teacherId: teacher._id,
        name: teacherData.name,
        loginEmail: generatedEmail,
        password,
      });
    } catch (error) {
      results.failed.push({
        row: rowNumber,
        data: teacherData,
        error: error.message,
      });
    }
  }

  return {
    summary: {
      total: teachersData.length,
      successful: results.successful.length,
      failed: results.failed.length,
    },
    results,
  };
};
