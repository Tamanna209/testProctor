// backend/models/TestSession.js
import mongoose from "mongoose";

const TestSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionToken: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("TestSession", TestSessionSchema);
