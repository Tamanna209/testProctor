// backend/routes/proctorRoutes.js
import express from "express";
import { proctorEvent } from "../controllers/proctor.controller.js";
import { requireTestSession } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Proctor events → tab switch, camera deny, refresh etc.
router.post("/event", requireTestSession, proctorEvent);

export default router;
