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

    // Only block for certain suspicious events. Use active session presence
    // instead of relying solely on Test. This prevents a race where the
    // client submits the test (setting endedAt) before the proctor event
    // reaches the server.
    if (
      eventType === "TAB_SWITCH" ||
      eventType === "REFRESH" ||
      eventType === "CAMERA_MIC_OFF" ||
      eventType === "FULLSCREEN_EXIT"
    ) {
      // If there's an active test session for this user, treat this as
      // cheating and block the account immediately.
      const activeSession = await TestSession.findOne({
        userId,
        isActive: true,
      });

      if (activeSession) {
        await User.findByIdAndUpdate(userId, {
          isBlocked: true,
          blockedReason: `Cheating detected: ${eventType}.`,
        });

        // Deactivate any live sessions so further requests are rejected
        await TestSession.updateMany({ userId }, { isActive: false });

        // Mark any still-open tests as cheating (best-effort)
        await Test.updateMany(
          { userId, endedAt: { $exists: false } },
          {
            isCheating: true,
            cheatingReason: `Cheating detected: ${eventType}.`,
          }
        );

        return res.status(403).json({
          message: "Cheating detected. You are permanently blocked.",
        });
      }
      // If no active session found, ignore the event
    }

    res.json({ message: "Event logged" });
  } catch (err) {
    res.status(500).json({ message: "proctor error", error: err.message });
  }
};

export { proctorEvent };
