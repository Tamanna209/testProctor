// backend/routes/authRoutes.js

import express from "express";
import {
  registerUser,
  verifyOtp,
  createSession,
} from "../controllers/auth.controller.js";
import { blockCheck } from "../middlewares/blockCheck.js";
import { attemptCheck } from "../middlewares/attemptCheck.js";

const router = express.Router();

// Register user + send OTP (no checks; allow anyone to register/re-register)
router.post("/register", registerUser);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Create test session after login
router.post("/create-session", createSession);

export default router;
