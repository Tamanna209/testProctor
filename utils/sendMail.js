// backend/utils/sendMail.js
import nodemailer from "nodemailer";

const sendMail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Coding Test" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log("📧 Email Sent To: ", email);
  } catch (error) {
    console.log("❌ Email Error:", error);
  }
};

export { sendMail };
