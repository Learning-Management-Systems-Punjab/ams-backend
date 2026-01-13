import { validationResult } from "express-validator";
import { sendError } from "../utils/apiHelpers.js";

/**
 * Middleware to validate request based on validation rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
    }));

    return sendError(res, 400, "Validation failed", formattedErrors);
  }

  next();
};
