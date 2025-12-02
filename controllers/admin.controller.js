// backend/controllers/admin.controller.js
import Test from "../models/test.model.js";
import User from "../models/users.model.js";
import AptitudeQuestion from "../models/aptitudeQuestions.model.js";

const ADMIN_PASSKEY = "tamannaTheDev0911@";

// Verify admin passkey
const verifyAdminPasskey = async (req, res) => {
  try {
    const { passkey } = req.body;

    if (!passkey) {
      return res.status(400).json({ message: "Passkey required" });
    }

    if (passkey !== ADMIN_PASSKEY) {
      return res.status(401).json({ message: "Invalid passkey" });
    }

    // Generate a token for admin session (simple JWT-like token)
    const adminToken = Buffer.from(`admin:${Date.now()}`).toString("base64");

    res.json({
      message: "Admin authenticated",
      adminToken,
      expiresIn: 3600, // 1 hour
    });
  } catch (err) {
    res.status(500).json({ message: "Auth error", error: err.message });
  }
};

// Get all test results (admin only)
const getAllResults = async (req, res) => {
  try {
    const adminToken = req.headers.authorization?.split(" ")[1];

    if (!adminToken) {
      return res.status(401).json({ message: "Admin token required" });
    }

    // Verify token (simple check)
    try {
      const decoded = Buffer.from(adminToken, "base64").toString();
      if (!decoded.startsWith("admin:")) {
        return res.status(401).json({ message: "Invalid admin token" });
      }
    } catch (e) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Get all tests with user info, grouped by user (latest test per user)
    const results = await Test.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$userId",
          latestTest: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestTest" },
      },
      {
        $project: {
          _id: 1,
          studentName: "$user.name",
          email: "$user.email",
          phone: "$user.phone",
          college: "$user.college",
          technology: "$user.technology",
          score: 1,
          totalQuestions: 1,
          answers: 1,
          isCheating: 1,
          cheatingReason: 1,
          startedAt: 1,
          endedAt: 1,
          createdAt: 1,
          isBlocked: "$user.isBlocked",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Format results with correct/wrong/unanswered counts
    const formattedResults = await Promise.all(
      results.map(async (result) => {
        let correct = 0;
        let wrong = 0;
        let unanswered = result.totalQuestions - result.answers.length;

        for (const ans of result.answers) {
          const question = await AptitudeQuestion.findById(ans.questionId);
          if (question && ans.selectedIndex === question.answerIndex) {
            correct++;
          } else {
            wrong++;
          }
        }

        return {
          _id: result._id,
          studentName: result.studentName || "N/A",
          email: result.email,
          phone: result.phone,
          college: result.college || "N/A",
          score: `${result.score}/${result.totalQuestions}`,
          percentage:
            result.totalQuestions > 0
              ? Math.round((result.score / result.totalQuestions) * 100)
              : 0,
          correct,
          wrong,
          unanswered,
          isCheating: result.isBlocked ? true : result.isCheating,
          cheatingReason: result.isBlocked
            ? "User is blocked"
            : result.cheatingReason || "",
          submittedAt: result.endedAt || result.createdAt,
        };
      })
    );

    res.json({
      message: "Results fetched",
      total: formattedResults.length,
      results: formattedResults,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching results", error: err.message });
  }
};

export { verifyAdminPasskey, getAllResults };
