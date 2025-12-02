// backend/middlewares/attemptCheck.js

import User from "../models/users.model.js";

const attemptCheck = async (req, res, next) => {
  try {
    // Support both flows: registration (body.email) and protected routes (req.userId)
    const email = req?.body?.email;
    let user = null;

    if (req.userId) {
      user = await User.findById(req.userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (user && user.hasAttemptedTest) {
      return res.status(403).json({
        message:
          "You have already completed the test. Multiple attempts are not allowed.",
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Middleware error", error: err.message });
  }
};

export { attemptCheck };
