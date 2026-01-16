import {
  createStudent,
  findStudentById,
  findStudentByRollNumber,
  findStudentByCnic,
  findStudentsByCollegeId,
  findStudentsByProgramId,
  findStudentsBySectionId,
  countStudentsByCollegeId,
  countStudentsByProgramId,
  countStudentsBySectionId,
  searchStudentsByCollege,
  countSearchStudentsByCollege,
  updateStudent,
  deleteStudent,
  bulkCreateStudents,
  getAllStudentsForExport,
  isRollNumberExists,
} from "../dal/student.dal.js";
import { findCollegeById } from "../dal/college.dal.js";
import { findProgramById } from "../dal/program.dal.js";
import { findSectionById } from "../dal/section.dal.js";
import { createUser, findUserByEmail } from "../dal/user.dal.js";
import { hashPassword, generateRandomString } from "../utils/helpers.js";

/**
 * Generate unique email for student
 * Format: rollnumber@college-code.edu.pk
 * @param {String} rollNumber
 * @param {String} collegeCode
 * @returns {Promise<String>}
 */
const generateStudentEmail = async (rollNumber, collegeCode) => {
  // Normalize: lowercase, remove special characters
  const normalizedRollNumber = rollNumber
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const normalizedCollegeCode = collegeCode
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  let email = `${normalizedRollNumber}@${normalizedCollegeCode}.edu.pk`;

  // Check if email exists
  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    return email;
  }

  // If exists, add random suffix
  for (let i = 1; i <= 99; i++) {
    email = `${normalizedRollNumber}${i}@${normalizedCollegeCode}.edu.pk`;
    const existingNumbered = await findUserByEmail(email);
    if (!existingNumbered) {
      return email;
    }
  }

  // Last resort: random string
  const randomStr = Math.random().toString(36).substring(2, 6);
  email = `${normalizedRollNumber}.${randomStr}@${normalizedCollegeCode}.edu.pk`;
  return email;
};

/**
 * Create new student
 * @param {Object} studentData
 * @param {String} collegeId
 * @param {Boolean} createLoginAccount - Whether to create user account
 * @returns {Promise<Object>}
 */
export const createStudentService = async (
  studentData,
  collegeId,
  createLoginAccount = false
) => {
  const {
    name,
    rollNumber,
    fatherName,
    contactNumber,
    cnic,
    email,
    dateOfBirth,
    gender,
    address,
    programId,
    sectionId,
    enrollmentDate,
    status,
  } = studentData;

  // Validate college exists
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Validate program exists and belongs to college
  const program = await findProgramById(programId);
  if (!program) {
    throw new Error("Program not found");
  }
  if (program.collegeId.toString() !== collegeId.toString()) {
    throw new Error("Program does not belong to your college");
  }

  // Validate section exists and belongs to college
  const section = await findSectionById(sectionId);
  if (!section) {
    throw new Error("Section not found");
  }
  if (section.collegeId.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // Check if roll number already exists in college
  const existingRollNumber = await isRollNumberExists(collegeId, rollNumber);
  if (existingRollNumber) {
    throw new Error(`Roll number ${rollNumber} already exists in your college`);
  }

  let userId = null;
  let credentials = null;

  // Create user account if requested
  if (createLoginAccount) {
    const generatedEmail = await generateStudentEmail(rollNumber, college.code);
    const password = generateRandomString(12);
    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      email: generatedEmail,
      password: hashedPassword,
      role: "Student",
    });

    userId = user._id;
    credentials = {
      loginEmail: generatedEmail,
      password,
    };
  }

  // Create student
  const student = await createStudent({
    name,
    rollNumber,
    fatherName,
    contactNumber: contactNumber || undefined,
    cnic: cnic || undefined,
    email: email || undefined,
    dateOfBirth: dateOfBirth || undefined,
    gender: gender || undefined,
    address: address || undefined,
    collegeId,
    programId,
    sectionId,
    userId,
    enrollmentDate: enrollmentDate || Date.now(),
    status: status || "Active",
  });

  const populatedStudent = await findStudentById(student._id);

  return {
    student: populatedStudent,
    ...(credentials && { credentials }),
  };
};

/**
 * Get all students for a college with pagination
 * @param {String} collegeId
 * @param {Number} page
 * @param {Number} limit
 * @param {Object} filters - Optional filters (programId, sectionId, status)
 * @returns {Promise<Object>}
 */
export const getAllStudentsService = async (
  collegeId,
  page = 1,
  limit = 50,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  let query = { collegeId, isActive: true };

  // Apply filters
  if (filters.programId) {
    query.programId = filters.programId;
  }
  if (filters.sectionId) {
    query.sectionId = filters.sectionId;
  }
  if (filters.status) {
    query.status = filters.status;
  }

  const [students, total] = await Promise.all([
    filters.sectionId
      ? findStudentsBySectionId(filters.sectionId, { skip, limit })
      : filters.programId
      ? findStudentsByProgramId(collegeId, filters.programId, { skip, limit })
      : findStudentsByCollegeId(collegeId, { skip, limit }),
    filters.sectionId
      ? countStudentsBySectionId(filters.sectionId)
      : filters.programId
      ? countStudentsByProgramId(collegeId, filters.programId)
      : countStudentsByCollegeId(collegeId),
  ]);

  return {
    students,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get student by ID (college-scoped)
 * @param {String} studentId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const getStudentByIdService = async (studentId, collegeId) => {
  const student = await findStudentById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  // Verify student belongs to the college
  if (student.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Student does not belong to your college");
  }

  return student;
};

/**
 * Update student (college-scoped)
 * @param {String} studentId
 * @param {Object} updateData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const updateStudentService = async (
  studentId,
  updateData,
  collegeId
) => {
  const student = await findStudentById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  // Verify student belongs to the college
  if (student.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Student does not belong to your college");
  }

  // Check if updating roll number and it already exists
  if (updateData.rollNumber && updateData.rollNumber !== student.rollNumber) {
    const existingRollNumber = await isRollNumberExists(
      collegeId,
      updateData.rollNumber,
      studentId
    );
    if (existingRollNumber) {
      throw new Error(
        `Roll number ${updateData.rollNumber} already exists in your college`
      );
    }
  }

  // Validate program if updating
  if (updateData.programId) {
    const program = await findProgramById(updateData.programId);
    if (!program) {
      throw new Error("Program not found");
    }
    if (program.collegeId.toString() !== collegeId.toString()) {
      throw new Error("Program does not belong to your college");
    }
  }

  // Validate section if updating
  if (updateData.sectionId) {
    const section = await findSectionById(updateData.sectionId);
    if (!section) {
      throw new Error("Section not found");
    }
    if (section.collegeId.toString() !== collegeId.toString()) {
      throw new Error("Section does not belong to your college");
    }
  }

  // Prevent updating collegeId, userId
  delete updateData.collegeId;
  delete updateData.userId;

  const updatedStudent = await updateStudent(studentId, updateData);
  return updatedStudent;
};

/**
 * Delete student (college-scoped)
 * @param {String} studentId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const deleteStudentService = async (studentId, collegeId) => {
  const student = await findStudentById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  // Verify student belongs to the college
  if (student.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Student does not belong to your college");
  }

  await deleteStudent(studentId);

  return {
    message: "Student deleted successfully",
    studentId,
  };
};

/**
 * Search students (college-scoped)
 * @param {String} collegeId
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchStudentsService = async (
  collegeId,
  searchQuery,
  page = 1,
  limit = 50
) => {
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    searchStudentsByCollege(collegeId, searchQuery, { skip, limit }),
    countSearchStudentsByCollege(collegeId, searchQuery),
  ]);

  return {
    students,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Bulk import students from CSV data
 * @param {Array} studentsData - Array of student objects from CSV
 * @param {String} collegeId
 * @param {Boolean} createLoginAccounts - Whether to create user accounts
 * @returns {Promise<Object>}
 */
export const bulkImportStudentsService = async (
  studentsData,
  collegeId,
  createLoginAccounts = false
) => {
  // Validate college exists
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  const results = {
    successful: [],
    failed: [],
  };

  // Process each student
  for (let i = 0; i < studentsData.length; i++) {
    const studentData = studentsData[i];
    const rowNumber = i + 1;

    try {
      // Validate required fields
      if (
        !studentData.name ||
        !studentData.rollNumber ||
        !studentData.fatherName
      ) {
        throw new Error(
          "Missing required fields: name, rollNumber, or fatherName"
        );
      }

      if (!studentData.programId || !studentData.sectionId) {
        throw new Error("Missing required fields: programId or sectionId");
      }

      // Check if roll number already exists
      const existingRollNumber = await findStudentByRollNumber(
        collegeId,
        studentData.rollNumber
      );
      if (existingRollNumber) {
        throw new Error(`Roll number ${studentData.rollNumber} already exists`);
      }

      // Validate program
      const program = await findProgramById(studentData.programId);
      if (!program) {
        throw new Error(`Program not found: ${studentData.programId}`);
      }
      if (program.collegeId.toString() !== collegeId.toString()) {
        throw new Error("Program does not belong to your college");
      }

      // Validate section
      const section = await findSectionById(studentData.sectionId);
      if (!section) {
        throw new Error(`Section not found: ${studentData.sectionId}`);
      }
      if (section.collegeId.toString() !== collegeId.toString()) {
        throw new Error("Section does not belong to your college");
      }

      let userId = null;
      let credentials = null;

      // Create user account if requested
      if (createLoginAccounts) {
        const generatedEmail = await generateStudentEmail(
          studentData.rollNumber,
          college.code
        );
        const password = generateRandomString(12);
        const hashedPassword = await hashPassword(password);

        const user = await createUser({
          email: generatedEmail,
          password: hashedPassword,
          role: "Student",
        });

        userId = user._id;
        credentials = {
          loginEmail: generatedEmail,
          password,
        };
      }

      // Create student
      const student = await createStudent({
        ...studentData,
        collegeId,
        userId,
      });

      results.successful.push({
        row: rowNumber,
        studentId: student._id,
        name: studentData.name,
        rollNumber: studentData.rollNumber,
        ...(credentials && { credentials }),
      });
    } catch (error) {
      results.failed.push({
        row: rowNumber,
        data: studentData,
        error: error.message,
      });
    }
  }

  return {
    summary: {
      total: studentsData.length,
      successful: results.successful.length,
      failed: results.failed.length,
    },
    results,
  };
};

/**
 * Export students to CSV format
 * @param {String} collegeId
 * @param {Object} filters - Optional filters (programId, sectionId)
 * @returns {Promise<Array>}
 */
export const exportStudentsService = async (collegeId, filters = {}) => {
  const students = await getAllStudentsForExport(collegeId);

  // Apply filters if provided
  let filteredStudents = students;
  if (filters.programId) {
    filteredStudents = filteredStudents.filter(
      (s) => s.programId._id.toString() === filters.programId.toString()
    );
  }
  if (filters.sectionId) {
    filteredStudents = filteredStudents.filter(
      (s) => s.sectionId._id.toString() === filters.sectionId.toString()
    );
  }

  // Format for CSV export
  const csvData = filteredStudents.map((student) => ({
    rollNumber: student.rollNumber,
    name: student.name,
    fatherName: student.fatherName,
    contactNumber: student.contactNumber || "",
    cnic: student.cnic || "",
    email: student.email || "",
    loginEmail: student.userId?.email || "",
    program: student.programId?.name || "",
    programCode: student.programId?.code || "",
    section: student.sectionId?.name || "",
    year: student.sectionId?.year || "",
    shift: student.sectionId?.shift || "",
    status: student.status,
    enrollmentDate: student.enrollmentDate,
  }));

  return csvData;
};
