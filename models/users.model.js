// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /@(service\.com|gmail\.com|outlook\.com|yahoo\.com)$/i,
        "Email domain must be one of service.com, gmail.com, outlook.com, yahoo.com",
      ],
    },
    phone: {
      type: String,
      unique: true,
      required: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    college: { type: String, required: true },
    technology: { type: String },

    // flags
    hasAttemptedTest: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
