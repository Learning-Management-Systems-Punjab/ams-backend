import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/apiHelpers.js";
import { findUserById } from "../dal/user.dal.js";

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Access token is required");
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Check if user exists and is active
    const user = await findUserById(decoded.userId);
    if (!user) {
      return sendError(res, 401, "Invalid token or user not found");
    }

    // Attach user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return sendError(res, 401, error.message || "Authentication failed");
  }
};

/**
 * Check if user has required role
 * @param {Array<String>} allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        "You do not have permission to access this resource"
      );
    }

    next();
  };
};

/**
 * Middleware for SysAdmin only
 */
export const isSysAdmin = [authenticate, authorize("SysAdmin")];

/**
 * Middleware for DistrictHead only
 */
export const isDistrictHead = [authenticate, authorize("DistrictHead")];

/**
 * Middleware for Teacher only
 */
export const isTeacher = [authenticate, authorize("Teacher")];

/**
 * Middleware for Student only
 */
export const isStudent = [authenticate, authorize("Student")];

/**
 * Middleware for SysAdmin or DistrictHead
 */
export const isSysAdminOrDistrictHead = [
  authenticate,
  authorize("SysAdmin", "DistrictHead"),
];

/**
 * Middleware for any authenticated user
 */
export const isAuthenticated = authenticate;
