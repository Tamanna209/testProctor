// backend/models/AptitudeQuestion.js
import mongoose from "mongoose";

const QSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: { type: Number, required: true },
  tags: [String]
}, { timestamps: true });

export default mongoose.model("AptitudeQuestion", QSchema);
