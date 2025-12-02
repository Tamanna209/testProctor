// backend/routes/questionRoutes.js
import express from "express";
import { addQuestion, getQuestions } from "../controllers/questionController.js";

const router = express.Router();

// Add new aptitude question
router.post("/add", addQuestion);

// Get all questions (admin)
router.get("/all", getQuestions);

export default router;
