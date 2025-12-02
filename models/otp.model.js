// backend/models/OTP.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expireAt: { type: Date, required: true, expires: 300 } // TTL: 5 minutes
}, { timestamps: true });

export default mongoose.model("OTP", otpSchema);
