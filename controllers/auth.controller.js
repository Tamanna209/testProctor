// backend/controllers/authController.js

import User from "../models/users.model.js";
import OTP from "../models/otp.model.js";
import TestSession from "../models/testSession.model.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendMail } from "../utils/sendMail.js";
import { generateSessionToken } from "../utils/generateToken.js";
// ===============================
//  REGISTER USER + SEND OTP
// ===============================
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, college, technology } = req.body;

    // Basic backend validation (allow a whitelist of domains)
    const emailLower = (email || "").toLowerCase().trim();
    const domain = (emailLower.split("@")[1] || "").toLowerCase();
    const allowedDomains = [
      "service.com",
      "gmail.com",
      "outlook.com",
      "yahoo.com",
    ];
    if (!domain || !allowedDomains.includes(domain)) {
      return res
        .status(400)
        .json({
          message: `Email domain must be one of: ${allowedDomains.join(", ")}`,
        });
    }

    const phoneClean = (phone || "").toString().replace(/\D/g, "");
    if (!/^\d{10}$/.test(phoneClean)) {
      return res
        .status(400)
        .json({ message: "Phone number must be exactly 10 digits" });
    }

    // Check if user exists (use cleaned email/phone)
    let user = await User.findOne({ email: emailLower });

    // If blocked, reject immediately
    if (user && user.isBlocked) {
      return res.status(403).json({
        message:
          "Your account is blocked due to suspicious activity. Contact admin.",
      });
    }

    // If email exists but NOT blocked, allow re-registration (reset for new attempt)
    if (user) {
      // Update existing user with new details and reset attempt status
      user = await User.findByIdAndUpdate(
        user._id,
        {
          name,
          phone: phoneClean,
          college,
          technology,
          hasAttemptedTest: false,
        },
        { new: true }
      );
    } else {
      // Check phone uniqueness for new registrations
      const existingByPhone = await User.findOne({ phone: phoneClean });
      if (existingByPhone) {
        return res.status(400).json({
          message:
            "Phone number already in use. Please use a different number.",
        });
      }

      // Create new user (store normalized values)
      user = await User.create({
        name,
        email: emailLower,
        phone: phoneClean,
        college,
        technology,
      });
    }

    // Dev-log: incoming register
    console.log(`[DEV] Register request for email=${email}, phone=${phone}`);

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    await OTP.create({
      email: emailLower,
      otp,
      expireAt: new Date(expiry),
    });

    // Dev-log: print OTP to console (developer convenience only)
    console.log(`[DEV] OTP for ${emailLower}: ${otp} (expires in 5 minutes)`);

    await sendMail(
      emailLower,
      "Your OTP for Coding Test",
      `<h2>Your OTP is: <b>${otp}</b></h2><p>This OTP will expire in 5 minutes.</p>`
    );

    res.json({
      message: "OTP sent to email.",
      email: emailLower,
    });
  } catch (error) {
    console.error("[DEV] Register error:", error);
    res.status(500).json({ message: "Register Error", error: error.message });
  }
};

// ===============================
//  VERIFY OTP → LOGIN SUCCESS
// ===============================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log(`[AUTH] Verifying OTP for email: ${email}`);

    const storedOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!storedOtp) {
      console.warn(`[AUTH] OTP not found for email: ${email}`);
      return res.status(400).json({ message: "OTP not found. Try again." });
    }

    if (storedOtp.otp !== otp) {
      console.warn(`[AUTH] Invalid OTP for email: ${email}`);
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (storedOtp.expireAt < new Date()) {
      console.warn(`[AUTH] OTP expired for email: ${email}`);
      return res.status(400).json({ message: "OTP expired." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`[AUTH] User not found for email: ${email}`);
      return res.status(404).json({ message: "User not found." });
    }

    // delete otp after successful verification
    await OTP.deleteMany({ email });

    console.log(
      `[AUTH] OTP verified successfully for email: ${email}, userId: ${user._id}`
    );

    res.json({
      message: "Login successful",
      userId: user._id,
    });
  } catch (error) {
    console.error(`[AUTH] OTP verification error:`, error);
    res.status(500).json({ message: "OTP Verify Error", error: error.message });
  }
};

// ===============================
//  CREATE TEST SESSION
// ===============================
const createSession = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log(`[AUTH] Creating session for userId: ${userId}`);

    if (!userId) {
      console.error(`[AUTH] No userId provided in createSession request`);
      return res.status(400).json({ message: "userId required" });
    }

    const sessionToken = generateSessionToken();
    const expiry = Date.now() + 40 * 60 * 1000; // 40 min

    const sessionRecord = await TestSession.create({
      userId,
      sessionToken,
      expiresAt: new Date(expiry),
    });

    console.log(`[AUTH] Session created successfully:`, {
      sessionId: sessionRecord._id,
      userId,
      sessionToken,
      expiresAt: new Date(expiry),
    });

    res.json({
      message: "Session created",
      token: sessionToken,
    });
  } catch (error) {
    console.error(`[AUTH] Session creation error:`, error);
    res
      .status(500)
      .json({ message: "Session create error", error: error.message });
  }
};

export { registerUser, verifyOtp, createSession };
