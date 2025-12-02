// backend/routes/testRoutes.js
import express from "express";
import {
  startTest,
  submitTest,
  status,
} from "../controllers/test.controller.js";
import { requireTestSession } from "../middlewares/authMiddleware.js";
import { attemptCheck } from "../middlewares/attemptCheck.js";

const router = express.Router();

// Start aptitude test (protected by session; blockCheck not needed here)
router.get("/start", requireTestSession, startTest);

// Check test status (hasAttempted, isBlocked)
router.get("/status", requireTestSession, status);

// Submit test
router.post("/submit", requireTestSession, submitTest);

export default router;
