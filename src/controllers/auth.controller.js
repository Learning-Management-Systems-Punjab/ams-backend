import { loginUser, getCurrentUser } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/apiHelpers.js";
import { findUserById, updateUser } from "../dal/user.dal.js";
import { comparePassword, hashPassword } from "../utils/helpers.js";

/**
 * Login controller
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    return sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    if (error.message === "Invalid email or password") {
      return sendError(res, 401, error.message);
    }
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    const result = await getCurrentUser(userId, role);

    return sendSuccess(res, 200, "Profile retrieved successfully", result);
  } catch (error) {
    if (error.message === "User not found") {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * Change password controller
 * @route PUT /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await findUserById(userId);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return sendError(res, 401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await updateUser(userId, { password: hashedPassword });

    return sendSuccess(res, 200, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Logout controller (client-side token removal)
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  return sendSuccess(res, 200, "Logout successful");
};
