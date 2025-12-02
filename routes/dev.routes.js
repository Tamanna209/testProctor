// DEV-ONLY ROUTES (for local testing/debugging)
import express from "express";
import User from "../models/users.model.js";

const router = express.Router();

// List all users with their flags (dev only)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(
      {},
      "email phone name isBlocked hasAttemptedTest blockedReason"
    );
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// Unblock a user by email (dev only)
router.post("/unblock/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updated = await User.findOneAndUpdate(
      { email },
      { isBlocked: false, blockedReason: "" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User unblocked", user: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error unblocking user", error: err.message });
  }
});

// Reset a user's attempt flag (dev only)
router.post("/reset-attempt/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const updated = await User.findOneAndUpdate(
      { email },
      { hasAttemptedTest: false },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Attempt flag reset", user: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error resetting attempt", error: err.message });
  }
});

// Delete a user by email (dev only)
router.delete("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const deleted = await User.findOneAndDelete({ email });
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted", user: deleted });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
});

export default router;
