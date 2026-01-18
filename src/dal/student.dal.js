import Student from "../models/student.js";

/**
 * Find student by ID
 * @param {String} studentId
 * @returns {Promise<Object|null>}
 */
export const findStudentById = async (studentId) => {
  return await Student.findOne({ _id: studentId, isActive: true })
    .populate("collegeId")
    .populate("programId")
    .populate("sectionId")
    .populate("userId", "-password");
};

/**
 * Find student by roll number and college
 * @param {String} collegeId
 * @param {String} rollNumber
 * @returns {Promise<Object|null>}
 */
export const findStudentByRollNumber = async (collegeId, rollNumber) => {
  return await Student.findOne({ collegeId, rollNumber, isActive: true })
    .populate("collegeId")
    .populate("programId")
    .populate("sectionId");
};

/**
 * Find student by CNIC
 * @param {String} cnic
 * @returns {Promise<Object|null>}
 */
export const findStudentByCnic = async (cnic) => {
  return await Student.findOne({ cnic, isActive: true });
};

/**
 * Find student by user ID
 * @param {String} userId
 * @returns {Promise<Object|null>}
 */
export const findStudentByUserId = async (userId) => {
  return await Student.findOne({ userId, isActive: true })
    .populate("collegeId")
    .populate("programId")
    .populate("sectionId")
    .populate("userId", "-password");
};

/**
 * Find students by section ID
 * @param {String} sectionId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findStudentsBySectionId = async (sectionId, options = {}) => {
  const { skip = 0, limit = 100 } = options;
  return await Student.find({ sectionId, isActive: true })
    .populate("collegeId")
    .populate("programId")
    .populate("sectionId")
    .skip(skip)
    .limit(limit)
    .sort({ rollNumber: 1 });
};

/**
 * Find students by college ID
 * @param {String} collegeId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findStudentsByCollegeId = async (collegeId, options = {}) => {
  const { skip = 0, limit = 100 } = options;
  return await Student.find({ collegeId, isActive: true })
    .populate("programId")
    .populate("sectionId")
    .skip(skip)
    .limit(limit)
    .sort({ rollNumber: 1 });
};

/**
 * Create new student
 * @param {Object} studentData
 * @returns {Promise<Object>}
 */
export const createStudent = async (studentData) => {
  return await Student.create(studentData);
};

/**
 * Create multiple students (bulk)
 * @param {Array} studentsData
 * @returns {Promise<Array>}
 */
export const createManyStudents = async (studentsData) => {
  return await Student.insertMany(studentsData);
};

/**
 * Update student by ID
 * @param {String} studentId
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateStudent = async (studentId, updateData) => {
  return await Student.findByIdAndUpdate(studentId, updateData, { new: true })
    .populate("collegeId")
    .populate("programId")
    .populate("sectionId");
};

/**
 * Count students by section ID
 * @param {String} sectionId
 * @returns {Promise<Number>}
 */
export const countStudentsBySectionId = async (sectionId) => {
  return await Student.countDocuments({ sectionId, isActive: true });
};

/**
 * Count students by college ID
 * @param {String} collegeId
 * @returns {Promise<Number>}
 */
export const countStudentsByCollegeId = async (collegeId) => {
  return await Student.countDocuments({ collegeId, isActive: true });
};

/**
 * Update student status
 * @param {String} studentId
 * @param {String} status
 * @returns {Promise<Object|null>}
 */
export const updateStudentStatus = async (studentId, status) => {
  return await Student.findByIdAndUpdate(studentId, { status }, { new: true });
};

/**
 * Get all students with pagination
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const getAllStudents = async ({ skip = 0, limit = 10 }) => {
  return await Student.find({ isActive: true })
    .populate("collegeId", "name code")
    .populate("programId", "name code")
    .populate("sectionId", "name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count all students
 * @returns {Promise<Number>}
 */
export const countAllStudents = async () => {
  return await Student.countDocuments({ isActive: true });
};

/**
 * Search students by name, roll number, email, or CNIC
 * @param {String} searchQuery
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const searchStudents = async (searchQuery, { skip = 0, limit = 10 }) => {
  const regex = new RegExp(searchQuery, "i");

  return await Student.find({
    isActive: true,
    $or: [
      { name: regex },
      { rollNumber: regex },
      { email: regex },
      { cnic: regex },
    ],
  })
    .populate("collegeId", "name code")
    .populate("programId", "name code")
    .populate("sectionId", "name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Count search results for students
 * @param {String} searchQuery
 * @returns {Promise<Number>}
 */
export const countSearchStudents = async (searchQuery) => {
  const regex = new RegExp(searchQuery, "i");

  return await Student.countDocuments({
    isActive: true,
    $or: [
      { name: regex },
      { rollNumber: regex },
      { email: regex },
      { cnic: regex },
    ],
  });
};

/**
 * Search students by college (college-scoped)
 * @param {String} collegeId
 * @param {String} searchQuery
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const searchStudentsByCollege = async (
  collegeId,
  searchQuery,
  { skip = 0, limit = 10 }
) => {
  const regex = new RegExp(searchQuery, "i");

  return await Student.find({
    collegeId,
    isActive: true,
    $or: [
      { name: regex },
      { rollNumber: regex },
      { email: regex },
      { cnic: regex },
      { fatherName: regex },
      { contactNumber: regex },
    ],
  })
    .populate("programId", "name code")
    .populate("sectionId", "name year shift")
    .skip(skip)
    .limit(limit)
    .sort({ rollNumber: 1 });
};

/**
 * Count search results for students (college-scoped)
 * @param {String} collegeId
 * @param {String} searchQuery
 * @returns {Promise<Number>}
 */
export const countSearchStudentsByCollege = async (collegeId, searchQuery) => {
  const regex = new RegExp(searchQuery, "i");

  return await Student.countDocuments({
    collegeId,
    isActive: true,
    $or: [
      { name: regex },
      { rollNumber: regex },
      { email: regex },
      { cnic: regex },
      { fatherName: regex },
      { contactNumber: regex },
    ],
  });
};

/**
 * Delete student (soft delete)
 * @param {String} studentId
 * @returns {Promise<Object>}
 */
export const deleteStudent = async (studentId) => {
  return await Student.findByIdAndUpdate(
    studentId,
    { isActive: false },
    { new: true }
  );
};

/**
 * Get all students for export (no pagination)
 * @param {String} collegeId
 * @returns {Promise<Array>}
 */
export const getAllStudentsForExport = async (collegeId) => {
  return await Student.find({ collegeId, isActive: true })
    .populate("programId", "name code")
    .populate("sectionId", "name year shift")
    .populate("userId", "email")
    .sort({ rollNumber: 1 })
    .lean();
};

/**
 * Find students by program ID
 * @param {String} collegeId
 * @param {String} programId
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>}
 */
export const findStudentsByProgramId = async (
  collegeId,
  programId,
  options = {}
) => {
  const { skip = 0, limit = 100 } = options;
  return await Student.find({ collegeId, programId, isActive: true })
    .populate("programId", "name code")
    .populate("sectionId", "name year shift")
    .skip(skip)
    .limit(limit)
    .sort({ rollNumber: 1 });
};

/**
 * Count students by program ID
 * @param {String} collegeId
 * @param {String} programId
 * @returns {Promise<Number>}
 */
export const countStudentsByProgramId = async (collegeId, programId) => {
  return await Student.countDocuments({
    collegeId,
    programId,
    isActive: true,
  });
};

/**
 * Bulk create students
 * @param {Array} studentsData
 * @returns {Promise<Array>}
 */
export const bulkCreateStudents = async (studentsData) => {
  return await Student.insertMany(studentsData, { ordered: false });
};

/**
 * Check if roll number exists in college
 * @param {String} collegeId
 * @param {String} rollNumber
 * @param {String} excludeStudentId - Optional student ID to exclude from check
 * @returns {Promise<Boolean>}
 */
export const isRollNumberExists = async (
  collegeId,
  rollNumber,
  excludeStudentId = null
) => {
  const query = { collegeId, rollNumber, isActive: true };
  if (excludeStudentId) {
    query._id = { $ne: excludeStudentId };
  }
  const count = await Student.countDocuments(query);
  return count > 0;
};

/**
 * Unassign students from their section (set sectionId to null)
 * @param {String} sectionId - Section ID to unassign students from
 * @returns {Promise<Object>} - Update result with modifiedCount
 */
export const unassignStudentsFromSection = async (sectionId) => {
  return await Student.updateMany(
    { sectionId, isActive: true },
    { $set: { sectionId: null } }
  );
};

// Alias for backward compatibility
export const findStudentsBySection = findStudentsBySectionId;
