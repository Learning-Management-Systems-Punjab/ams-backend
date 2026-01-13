import express from "express";
import {
  login,
  getMe,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";
import {
  loginValidation,
  changePasswordValidation,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginValidation, validate, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", isAuthenticated, getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  "/change-password",
  isAuthenticated,
  changePasswordValidation,
  validate,
  changePassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", isAuthenticated, logout);

export default router;
