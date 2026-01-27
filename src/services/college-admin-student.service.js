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
  findStudentsWithoutSection,
  countStudentsWithoutSection,
} from "../dal/student.dal.js";
import { findCollegeById } from "../dal/college.dal.js";
import {
  findProgramById,
  findProgramByName,
  createProgram,
} from "../dal/program.dal.js";
import {
  findSectionById,
  createSection,
  incrementSectionStrength,
  decrementSectionStrength,
} from "../dal/section.dal.js";
import { findSubjectByName, createSubject } from "../dal/subject.dal.js";
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
  createLoginAccount = false,
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
  const program = await findProgramById(programId, collegeId);
  if (!program) {
    throw new Error("Program not found");
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
 * @param {Object} filters - Optional filters (programId, sectionId, status, noSection)
 * @returns {Promise<Object>}
 */
export const getAllStudentsService = async (
  collegeId,
  page = 1,
  limit = 50,
  filters = {},
) => {
  const skip = (page - 1) * limit;

  let students, total;

  // If noSection filter is true, get students without section assignment
  if (filters.noSection) {
    [students, total] = await Promise.all([
      findStudentsWithoutSection(collegeId, filters.programId || null, {
        skip,
        limit,
      }),
      countStudentsWithoutSection(collegeId, filters.programId || null),
    ]);
  } else if (filters.sectionId) {
    [students, total] = await Promise.all([
      findStudentsBySectionId(filters.sectionId, { skip, limit }),
      countStudentsBySectionId(filters.sectionId),
    ]);
  } else if (filters.programId) {
    [students, total] = await Promise.all([
      findStudentsByProgramId(collegeId, filters.programId, { skip, limit }),
      countStudentsByProgramId(collegeId, filters.programId),
    ]);
  } else {
    [students, total] = await Promise.all([
      findStudentsByCollegeId(collegeId, { skip, limit }),
      countStudentsByCollegeId(collegeId),
    ]);
  }

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
  collegeId,
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
      studentId,
    );
    if (existingRollNumber) {
      throw new Error(
        `Roll number ${updateData.rollNumber} already exists in your college`,
      );
    }
  }

  // Validate program if updating
  if (updateData.programId) {
    const program = await findProgramById(updateData.programId, collegeId);
    if (!program) {
      throw new Error("Program not found");
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
  limit = 50,
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
  createLoginAccounts = false,
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
          "Missing required fields: name, rollNumber, or fatherName",
        );
      }

      if (!studentData.programId || !studentData.sectionId) {
        throw new Error("Missing required fields: programId or sectionId");
      }

      // Check if roll number already exists
      const existingRollNumber = await findStudentByRollNumber(
        collegeId,
        studentData.rollNumber,
      );
      if (existingRollNumber) {
        throw new Error(`Roll number ${studentData.rollNumber} already exists`);
      }

      // Validate program
      const program = await findProgramById(studentData.programId, collegeId);
      if (!program) {
        throw new Error(`Program not found: ${studentData.programId}`);
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
          college.code,
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
      (s) => s.programId._id.toString() === filters.programId.toString(),
    );
  }
  if (filters.sectionId) {
    filteredStudents = filteredStudents.filter(
      (s) => s.sectionId._id.toString() === filters.sectionId.toString(),
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

/**
 * Parse program name from CSV format
 * Example: "F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics"
 * Returns: { name: "F.Sc. (Pre-Engineering)", code: "FSC-PE", subjects: ["Mathematics", "Chemistry", "Physics"] }
 */
const parseProgramFromCSV = (programString) => {
  // Split by hyphen to separate program name from subjects
  const parts = programString.split("-");
  const programName = parts[0].trim();
  const subjectsString = parts.slice(1).join("-").trim();

  // Extract subjects
  const subjects = subjectsString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);

  // Generate code from program name
  // "F.Sc. (Pre-Engineering)" -> "FSC-PE"
  let code = programName
    .replace(/[()]/g, "")
    .split(/[\s.]+/)
    .filter((word) => word && word.length > 1)
    .map((word) => word.substring(0, 2).toUpperCase())
    .join("-");

  return {
    name: programName,
    code: code,
    subjects: subjects,
  };
};

/**
 * Find or create program
 * @param {String} collegeId
 * @param {String} programString - Raw program string from CSV
 * @returns {Promise<Object>} - Returns { program, wasCreated }
 */
const findOrCreateProgram = async (collegeId, programString) => {
  const parsed = parseProgramFromCSV(programString);

  // Try to find existing program by name (case-insensitive)
  let program = await findProgramByName(collegeId, parsed.name);

  if (program) {
    // Found existing program
    return { program, wasCreated: false };
  }

  // Program doesn't exist, create new one
  program = await createProgram({
    name: parsed.name,
    code: parsed.code,
    collegeId: collegeId,
    description: `${parsed.name} - ${parsed.subjects.join(", ")}`,
    duration: 2, // Default to 2 years for F.Sc
    subjects: [], // We'll handle subject creation later
  });

  return { program, wasCreated: true };
};

/**
 * Generate subject code from subject name
 * Example: "Mathematics" -> "MATH", "Chemistry" -> "CHEM"
 */
const generateSubjectCode = (subjectName) => {
  return subjectName
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter((word) => word && word.length > 0)
    .map((word) => word.substring(0, 4).toUpperCase())
    .join("-");
};

/**
 * Find or create subject
 * @param {String} collegeId
 * @param {String} subjectName - Subject name from CSV
 * @param {Map} subjectCache - Cache to avoid repeated queries
 * @param {Object} results - Results object to track created/found subjects
 * @param {Set} createdSubjectIds - Set to track unique created subject IDs
 * @returns {Promise<Object>} - Returns { subject, wasCreated }
 */
const findOrCreateSubject = async (
  collegeId,
  subjectName,
  subjectCache,
  results,
  createdSubjectIds,
) => {
  // Check cache first
  if (subjectCache.has(subjectName)) {
    return { subject: subjectCache.get(subjectName), wasCreated: false };
  }

  // Try to find existing subject by name (case-insensitive)
  let subject = await findSubjectByName(collegeId, subjectName);

  if (subject) {
    // Found existing subject
    subjectCache.set(subjectName, subject);

    // Track in results (only once per unique subject)
    if (
      !results.subjectsFound.find(
        (s) => s._id.toString() === subject._id.toString(),
      )
    ) {
      results.subjectsFound.push({
        _id: subject._id,
        name: subject.name,
        code: subject.code,
      });
    }

    return { subject, wasCreated: false };
  }

  // Subject doesn't exist, create new one
  const code = generateSubjectCode(subjectName);

  subject = await createSubject({
    name: subjectName,
    code: code,
    collegeId: collegeId,
    description: `${subjectName}`,
  });

  subjectCache.set(subjectName, subject);

  // Track in results (only once per unique subject)
  if (!createdSubjectIds.has(subject._id.toString())) {
    createdSubjectIds.add(subject._id.toString());
    results.subjectsCreated.push({
      _id: subject._id,
      name: subject.name,
      code: subject.code,
    });
  }

  return { subject, wasCreated: true };
};

/**
 * Find or create default section for a program
 * Since we don't have section details in CSV, create a default placeholder section
 * Later, proper sections will be created based on roll number ranges
 * @param {String} collegeId
 * @param {String} programId
 * @param {String} year - e.g., "1st Year"
 * @param {String} shiftInfo - e.g., "1st Shift - Mathematics, Chemistry, Physics"
 * @param {Map} subjectCache - Cache to avoid repeated subject queries
 * @param {Object} results - Results object to track created/found subjects
 * @param {Set} createdSubjectIds - Set to track unique created subject IDs
 * @returns {Promise<Object>} - Returns { section, wasCreated }
 */
const findOrCreateDefaultSection = async (
  collegeId,
  programId,
  year,
  shiftInfo,
  subjectCache,
  results,
  createdSubjectIds,
) => {
  // Parse shift from shiftInfo
  const shiftMatch = shiftInfo.match(/(\d+(?:st|nd|rd|th)\s+Shift)/i);
  const shift = shiftMatch ? shiftMatch[1] : "1st Shift";

  // Parse subject combination from shiftInfo
  // "1st Shift - Mathematics, Chemistry, Physics" -> ["Mathematics", "Chemistry", "Physics"]
  const subjectsPart = shiftInfo.split("-").slice(1).join("-").trim();
  const subjectNames = subjectsPart
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);

  // Try to find existing section with same program, year, shift, and subject combination
  const Section = (await import("../models/section.js")).default;
  let section = await Section.findOne({
    collegeId,
    programId,
    year,
    shift,
    isActive: true,
  }).lean();

  if (section) {
    // Found existing section
    return { section, wasCreated: false };
  }

  // Section doesn't exist, create placeholder section
  // First, create/find subjects mentioned in the subject combination
  const subjectIds = [];
  for (const subjectName of subjectNames) {
    if (subjectName) {
      const { subject } = await findOrCreateSubject(
        collegeId,
        subjectName,
        subjectCache,
        results,
        createdSubjectIds,
      );
      subjectIds.push(subject._id);
    }
  }

  // Note: This is a temporary section. Proper sections based on roll number ranges
  // will be created later through dedicated section management APIs
  const sectionName = `${year} - ${shift} - ${subjectNames.join(", ")}`;

  section = await createSection({
    name: sectionName,
    collegeId,
    programId,
    year,
    shift,
    subjects: subjectIds, // Link the auto-created subjects
    capacity: 100, // Default capacity, can be updated later
    // Note: rollNumberRange will be set later when creating proper sections
  });

  return { section, wasCreated: true };
};

/**
 * Bulk import students from raw CSV data
 * This accepts the CSV format directly and auto-creates programs and subjects
 * NOTE: Sections are NOT created - students will be imported without section assignment
 *       Sections should be created separately, then students can be assigned to sections
 * @param {Array} csvData - Array of objects with CSV column names
 * @param {String} collegeId
 * @param {Boolean} createLoginAccounts
 * @returns {Promise<Object>}
 */
export const bulkImportStudentsFromCSVService = async (
  csvData,
  collegeId,
  createLoginAccounts = false,
) => {
  // Validate college exists
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  const results = {
    successful: [],
    failed: [],
    programsCreated: [],
    programsFound: [],
    subjectsCreated: [],
    subjectsFound: [],
  };

  // Cache for programs and subjects to avoid repeated queries
  const programCache = new Map();
  const subjectCache = new Map();
  const createdProgramIds = new Set();
  const createdSubjectIds = new Set();

  // Pre-fetch all existing roll numbers for this college to avoid N+1 queries
  const Student = (await import("../models/student.js")).default;
  const existingStudents = await Student.find(
    { collegeId, isActive: true },
    { rollNumber: 1 },
  ).lean();
  const existingRollNumbers = new Set(
    existingStudents.map((s) => s.rollNumber),
  );

  // Process each student
  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNumber = i + 1;

    try {
      // Validate required CSV fields
      if (!row["Student Name"] || !row["Roll No"] || !row["Father Name"]) {
        throw new Error(
          "Missing required fields: Student Name, Roll No, or Father Name",
        );
      }

      if (!row["Program"]) {
        throw new Error("Missing required field: Program");
      }

      // Check if roll number already exists (using pre-fetched set)
      const rollNumber = String(row["Roll No"]).trim();
      if (existingRollNumbers.has(rollNumber)) {
        throw new Error(`Roll number ${rollNumber} already exists`);
      }

      // Get or create program
      const programString = row["Program"];
      let program;
      let programWasCreated = false;

      if (programCache.has(programString)) {
        program = programCache.get(programString);
      } else {
        const result = await findOrCreateProgram(collegeId, programString);
        program = result.program;
        programWasCreated = result.wasCreated;
        programCache.set(programString, program);

        // Track programs (only once per unique program)
        if (
          programWasCreated &&
          !createdProgramIds.has(program._id.toString())
        ) {
          createdProgramIds.add(program._id.toString());
          results.programsCreated.push({
            _id: program._id,
            name: program.name,
            code: program.code,
          });
        } else if (
          !programWasCreated &&
          !results.programsFound.find(
            (p) => p._id.toString() === program._id.toString(),
          )
        ) {
          results.programsFound.push({
            _id: program._id,
            name: program.name,
            code: program.code,
          });
        }
      }

      // Parse and create subjects from Subject-Combination field
      // "1st Shift - Mathematics, Chemistry, Physics" -> ["Mathematics", "Chemistry", "Physics"]
      const shiftInfo = row["Subject-Combination"] || "";
      const subjectsPart = shiftInfo.split("-").slice(1).join("-").trim();
      const subjectNames = subjectsPart
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      // Create/find subjects mentioned in the subject combination
      for (const subjectName of subjectNames) {
        if (subjectName) {
          await findOrCreateSubject(
            collegeId,
            subjectName,
            subjectCache,
            results,
            createdSubjectIds,
          );
        }
      }

      // Prepare student data - NOTE: sectionId is NOT set
      // Students will be assigned to sections later through the Sections management page
      const studentData = {
        name: row["Student Name"].trim(),
        rollNumber: rollNumber,
        fatherName: row["Father Name"].trim(),
        collegeId,
        programId: program._id,
        sectionId: null, // No section assigned - will be done later
        status: "Active",
      };

      // Add optional fields
      if (row["Student Phone"]) {
        studentData.contactNumber = String(row["Student Phone"]).trim();
      }

      if (row["Student CNIC/FORM-B"]) {
        studentData.cnic = String(row["Student CNIC/FORM-B"]).trim();
      }

      // Store year and shift info in a temporary field for later section assignment reference
      // This helps when creating sections later
      const year = row["Class"] || "1st Year";
      const shiftMatch = shiftInfo.match(/(\d+(?:st|nd|rd|th)\s+Shift)/i);
      const shift = shiftMatch ? shiftMatch[1] : "1st Shift";

      let userId = null;
      let credentials = null;

      // Create user account if requested
      if (createLoginAccounts) {
        const generatedEmail = await generateStudentEmail(
          rollNumber,
          college.code,
        );
        const password = generateRandomString(12);
        const hashedPassword = await hashPassword(password);

        const user = await createUser({
          email: generatedEmail,
          password: hashedPassword,
          role: "Student",
        });

        userId = user._id;
        studentData.userId = userId;
        credentials = {
          loginEmail: generatedEmail,
          password,
        };
      }

      // Create student
      const student = await createStudent(studentData);

      // Add to existing roll numbers set to prevent duplicates within same import
      existingRollNumbers.add(rollNumber);

      results.successful.push({
        row: rowNumber,
        studentId: student._id,
        name: studentData.name,
        rollNumber: studentData.rollNumber,
        program: program.name,
        year: year,
        shift: shift,
        sectionAssigned: false, // Indicate no section assigned yet
        ...(credentials && { credentials }),
      });
    } catch (error) {
      results.failed.push({
        row: rowNumber,
        data: {
          name: row["Student Name"],
          rollNumber: row["Roll No"],
          program: row["Program"],
        },
        error: error.message,
      });
    }
  }

  return {
    summary: {
      total: csvData.length,
      successful: results.successful.length,
      failed: results.failed.length,
      programsCreated: results.programsCreated.length,
      programsFound: results.programsFound.length,
      subjectsCreated: results.subjectsCreated.length,
      subjectsFound: results.subjectsFound.length,
      note: "Students imported without section assignment. Create sections and assign students through the Sections management page.",
    },
    programs: {
      created: results.programsCreated,
      found: results.programsFound,
    },
    subjects: {
      created: results.subjectsCreated,
      found: results.subjectsFound,
    },
    results: {
      successful: results.successful,
      failed: results.failed,
    },
  };
};

/**
 * Move students to another section
 * @param {Array<String>} studentIds - Array of student IDs to move
 * @param {String} targetSectionId - Target section ID
 * @param {String} collegeId - College ID for verification
 * @returns {Promise<Object>} - Result with updated count
 */
export const moveStudentsToSectionService = async (
  studentIds,
  targetSectionId,
  collegeId,
) => {
  // Verify target section exists and belongs to college
  const targetSection = await findSectionById(targetSectionId);
  if (!targetSection) {
    throw new Error("Target section not found");
  }

  // Handle both populated and non-populated collegeId
  const sectionCollegeId =
    targetSection.collegeId?._id || targetSection.collegeId;
  if (sectionCollegeId.toString() !== collegeId.toString()) {
    throw new Error("Target section does not belong to your college");
  }

  // Update all students and track section strength changes
  let updatedCount = 0;
  const errors = [];
  const oldSectionsToDecrement = new Map(); // Track old sections to decrement their strength

  for (const studentId of studentIds) {
    try {
      const student = await findStudentById(studentId);

      if (!student) {
        errors.push({ studentId, error: "Student not found" });
        continue;
      }

      // Handle both populated and non-populated collegeId
      const studentCollegeId = student.collegeId?._id || student.collegeId;
      if (studentCollegeId.toString() !== collegeId.toString()) {
        errors.push({
          studentId,
          error: "Student does not belong to your college",
        });
        continue;
      }

      // Track old section for strength decrement (if student was in a section)
      const oldSectionId = student.sectionId?._id || student.sectionId;
      if (
        oldSectionId &&
        oldSectionId.toString() !== targetSectionId.toString()
      ) {
        const oldSectionKey = oldSectionId.toString();
        oldSectionsToDecrement.set(
          oldSectionKey,
          (oldSectionsToDecrement.get(oldSectionKey) || 0) + 1,
        );
      }

      await updateStudent(studentId, { sectionId: targetSectionId });
      updatedCount++;
    } catch (err) {
      errors.push({ studentId, error: err.message });
    }
  }

  // Update section strengths
  if (updatedCount > 0) {
    // Increment target section strength by the number of students moved
    const Section = (await import("../models/section.js")).default;
    await Section.findByIdAndUpdate(targetSectionId, {
      $inc: { currentStrength: updatedCount },
    });

    // Decrement old sections' strength
    for (const [oldSectionId, count] of oldSectionsToDecrement) {
      await Section.findByIdAndUpdate(oldSectionId, {
        $inc: { currentStrength: -count },
      });
    }
  }

  return {
    updatedCount,
    totalRequested: studentIds.length,
    errors: errors.length > 0 ? errors : undefined,
  };
};
