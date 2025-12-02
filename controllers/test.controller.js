// backend/controllers/testController.js
import Test from "../models/test.model.js";
import User from "../models/users.model.js";
import AptitudeQuestion from "../models/aptitudeQuestions.model.js";

const startTest = async (req, res) => {
  try {
    const userId = req.userId;

    // Get total number of questions in DB
    const totalQuestionsInDB = await AptitudeQuestion.countDocuments();
    const sampleSize = Math.min(20, totalQuestionsInDB);

    const questions = await AptitudeQuestion.aggregate([
      { $sample: { size: sampleSize } },
    ]);

    const test = await Test.create({
      userId,
      answers: [],
      totalQuestions: sampleSize,
      startedAt: new Date(),
    });

    await User.findByIdAndUpdate(userId, { hasAttemptedTest: true });

    res.json({
      message: "Test started",
      testId: test._id,
      questions,
    });
  } catch (err) {
    res.status(500).json({ message: "startTest error", error: err.message });
  }
};

const submitTest = async (req, res) => {
  try {
    const { answers, wasCheating, cheatingReason } = req.body;
    const userId = req.userId;

    let score = 0;

    // Calculate score by checking against correct answers from DB
    for (const ans of answers) {
      const question = await AptitudeQuestion.findById(ans.questionId);
      if (question && ans.selectedIndex === question.answerIndex) {
        score++;
      }
    }

    // Find the latest test for this user that hasn't been submitted yet
    const test = await Test.findOne({
      userId,
      endedAt: { $exists: false },
    }).sort({ createdAt: -1 });

    if (!test) {
      return res
        .status(404)
        .json({ message: "No active test found for this user" });
    }

    // IMPORTANT: Keep the original totalQuestions from startTest, don't overwrite with answers.length
    // This ensures correct count of unanswered questions in admin panel
    const updateData = {
      answers,
      score,
      // DON'T change totalQuestions - keep the original value set in startTest
      endedAt: new Date(),
      isCheating: wasCheating || false,
      cheatingReason: cheatingReason || "",
    };

    await Test.findByIdAndUpdate(test._id, updateData);

    res.json({
      message: "Test submitted",
      score,
      isCheating: wasCheating || false,
    });
  } catch (err) {
    res.status(500).json({ message: "submit error", error: err.message });
  }
};

const status = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select(
      "hasAttemptedTest isBlocked"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      hasAttempted: !!user.hasAttemptedTest,
      isBlocked: !!user.isBlocked,
    });
  } catch (err) {
    res.status(500).json({ message: "status error", error: err.message });
  }
};

export { startTest, submitTest, status };
