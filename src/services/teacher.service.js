import {
  getAllTeachers,
  countAllTeachers,
  findTeacherById,
  searchTeachers,
  countSearchTeachers,
} from "../dal/teacher.dal.js";

/**
 * Get all teachers with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllTeachersService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [teachers, totalCount] = await Promise.all([
    getAllTeachers({ skip, limit }),
    countAllTeachers(),
  ]);

  return {
    teachers,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get teacher by ID
 * @param {String} teacherId
 * @returns {Promise<Object>}
 */
export const getTeacherByIdService = async (teacherId) => {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  return teacher;
};

/**
 * Search teachers
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchTeachersService = async (
  searchQuery,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [teachers, totalCount] = await Promise.all([
    searchTeachers(searchQuery, { skip, limit }),
    countSearchTeachers(searchQuery),
  ]);

  return {
    teachers,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
    searchQuery,
  };
};
