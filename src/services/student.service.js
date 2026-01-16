import {
  getAllStudents,
  countAllStudents,
  findStudentById,
  searchStudents,
  countSearchStudents,
} from "../dal/student.dal.js";

/**
 * Get all students with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllStudentsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [students, totalCount] = await Promise.all([
    getAllStudents({ skip, limit }),
    countAllStudents(),
  ]);

  return {
    students,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get student by ID
 * @param {String} studentId
 * @returns {Promise<Object>}
 */
export const getStudentByIdService = async (studentId) => {
  const student = await findStudentById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
};

/**
 * Search students
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchStudentsService = async (
  searchQuery,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [students, totalCount] = await Promise.all([
    searchStudents(searchQuery, { skip, limit }),
    countSearchStudents(searchQuery),
  ]);

  return {
    students,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
    searchQuery,
  };
};
