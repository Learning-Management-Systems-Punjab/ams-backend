import {
  getAllSubjects,
  countAllSubjects,
  findSubjectByIdGlobal,
  searchSubjects,
  countSearchSubjects,
} from "../dal/subject.dal.js";

/**
 * Get all subjects with pagination
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const getAllSubjectsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [subjects, totalCount] = await Promise.all([
    getAllSubjects({ skip, limit }),
    countAllSubjects(),
  ]);

  return {
    subjects,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
  };
};

/**
 * Get subject by ID
 * @param {String} subjectId
 * @returns {Promise<Object>}
 */
export const getSubjectByIdService = async (subjectId) => {
  const subject = await findSubjectByIdGlobal(subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  return subject;
};

/**
 * Search subjects
 * @param {String} searchQuery
 * @param {Number} page
 * @param {Number} limit
 * @returns {Promise<Object>}
 */
export const searchSubjectsService = async (
  searchQuery,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [subjects, totalCount] = await Promise.all([
    searchSubjects(searchQuery, { skip, limit }),
    countSearchSubjects(searchQuery),
  ]);

  return {
    subjects,
    pagination: {
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    },
    searchQuery,
  };
};
