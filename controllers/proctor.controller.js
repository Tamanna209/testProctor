// backend/controllers/proctorController.js
import ProctorLog from "../models/proctorLog.js";
import User from "../models/users.model.js";
import TestSession from "../models/testSession.model.js";
import Test from "../models/test.model.js";

const proctorEvent = async (req, res) => {
  try {
    const userId = req.userId;
    const { eventType, details } = req.body;

    await ProctorLog.create({ userId, eventType, details });

    // Only block for suspicious activity if test is still active (not yet submitted)
    if (
      eventType === "TAB_SWITCH" ||
      eventType === "REFRESH" ||
      eventType === "CAMERA_MIC_OFF"
    ) {
      // Find the most recent active test (no endedAt)
      const activeTest = await Test.findOne({
        userId,
        endedAt: { $exists: false },
      });

      // Only block if there's an active test (not submitted yet)
      if (activeTest) {
        await User.findByIdAndUpdate(userId, {
          isBlocked: true,
          blockedReason: `Cheating detected: ${eventType}.`,
        });

        await TestSession.updateMany({ userId }, { isActive: false });

        return res.status(403).json({
          message: "Cheating detected. You are permanently blocked.",
        });
      }
      // If test is already submitted (endedAt exists), ignore the event
    }

    res.json({ message: "Event logged" });
  } catch (err) {
    res.status(500).json({ message: "proctor error", error: err.message });
  }
};

export { proctorEvent };
