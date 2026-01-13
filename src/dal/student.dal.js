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
