// backend/utils/sendMail.js
import nodemailer from "nodemailer";
import axios from "axios";

const sendViaBrevo = async (email, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");

  const payload = {
    sender: { name: "Coding Test", email: process.env.SMTP_USER || "no-reply@example.com" },
    to: [{ email }],
    subject,
    htmlContent: html,
  };

  const res = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  return res.data;
};

const sendViaSmtp = async (email, subject, html) => {
  // parse port as number and decide secure based on port
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = port === 465; // true for 465, false for 587

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // do not fail on invalid certs in some environments (optional)
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    },
    connectionTimeout: 10000,
  });

  const info = await transporter.sendMail({
    from: `"Coding Test" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });

  return info;
};

const sendMail = async (email, subject, html) => {
  try {
    if (process.env.BREVO_API_KEY) {
      const result = await sendViaBrevo(email, subject, html);
      console.log("📧 Brevo Email Sent To:", email, result?.messageId || "(no id)");
      return result;
    }

    // Fallback to SMTP
    const info = await sendViaSmtp(email, subject, html);
    console.log("📧 SMTP Email Sent To:", email, info?.messageId || info);
    return info;
  } catch (error) {
    console.log("❌ Email Error:", error?.message || error);
    throw error; // rethrow so callers can handle/report failures
  }
};

export { sendMail };
