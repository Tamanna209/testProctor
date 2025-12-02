// backend/models/Test.js
import mongoose from "mongoose";

const TestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedIndex: Number,
        isCorrect: Boolean,
      },
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 20 },
    isCancelled: { type: Boolean, default: false },
    isCheating: { type: Boolean, default: false }, // Flag if user was caught cheating
    cheatingReason: { type: String, default: "" }, // What was the suspicious activity
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Test", TestSchema);
