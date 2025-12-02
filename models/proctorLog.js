// backend/models/ProctorLog.js
import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventType: { type: String, required: true }, // e.g. TAB_SWITCH, CAMERA_DENIED, REFRESH
  details: { type: String, default: "" },
  time: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("ProctorLog", LogSchema);
