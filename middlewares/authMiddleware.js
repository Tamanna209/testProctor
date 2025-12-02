// backend/middlewares/authMiddleware.js

import TestSession from "../models/testSession.model.js";

const requireTestSession = async (req, res, next) => {
  try {
    const token = req.headers["x-session-token"];
    if (!token)
      return res.status(401).json({ message: "Session token missing" });

    const session = await TestSession.findOne({
      sessionToken: token,
      isActive: true,
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    req.userId = session.userId;
    req.session = session;
    next();
  } catch (error) {
    res.status(500).json({ message: "Auth error", error: error.message });
  }
};

export { requireTestSession };
