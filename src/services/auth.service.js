import { findUserByEmail, findUserById } from "../dal/user.dal.js";
import { findSysAdminByUserId } from "../dal/sysAdmin.dal.js";
import { findDistrictHeadByUserId } from "../dal/districtHead.dal.js";
import { findCollegeByUserId } from "../dal/college.dal.js";
import { findTeacherByUserId } from "../dal/teacher.dal.js";
import { findStudentByUserId } from "../dal/student.dal.js";
import { comparePassword, sanitizeUser } from "../utils/helpers.js";
import { generateToken } from "../utils/jwt.js";

/**
 * Login user service
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  let profile = null;
  switch (user.role) {
    case "SysAdmin":
      profile = await findSysAdminByUserId(user._id);
      break;
    case "DistrictHead":
      profile = await findDistrictHeadByUserId(user._id);
      break;
    case "CollegeAdmin":
      profile = await findCollegeByUserId(user._id);
      break;
    case "Teacher":
      profile = await findTeacherByUserId(user._id);
      break;
    case "Student":
      profile = await findStudentByUserId(user._id);
      break;
    default:
      break;
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  const sanitizedUser = sanitizeUser(user);

  return {
    user: sanitizedUser,
    profile,
    token,
  };
};

/**
 * Get current user profile
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @returns {Promise<Object>} User profile
 */
export const getCurrentUser = async (userId, role) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  let profile = null;
  switch (role) {
    case "SysAdmin":
      profile = await findSysAdminByUserId(userId);
      break;
    case "DistrictHead":
      profile = await findDistrictHeadByUserId(userId);
      break;
    case "CollegeAdmin":
      profile = await findCollegeByUserId(userId);
      break;
    case "Teacher":
      profile = await findTeacherByUserId(userId);
      break;
    case "Student":
      profile = await findStudentByUserId(userId);
      break;
    default:
      break;
  }

  return {
    user: sanitizeUser(user),
    profile,
  };
};
