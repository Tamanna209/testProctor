// backend/middlewares/blockCheck.js

import User from "../models/users.model.js";

const blockCheck = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });

    if (user) {
      console.log(
        `[DEV] blockCheck found user ${email}: isBlocked=${user.isBlocked}`
      );
    }

    if (user && user.isBlocked) {
      return res.status(403).json({
        message: "Your account is permanently blocked due to cheating.",
        reason: user.blockedReason,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Middleware error", error: err.message });
  }
};

export { blockCheck };
