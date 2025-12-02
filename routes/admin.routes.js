// backend/routes/admin.routes.js
import express from "express";
import {
  verifyAdminPasskey,
  getAllResults,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Admin passkey verification
router.post("/verify-passkey", verifyAdminPasskey);

// Get all test results (with admin token)
router.get("/results", getAllResults);

export default router;
