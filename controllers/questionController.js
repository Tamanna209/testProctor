// backend/controllers/questionController.js
import AptitudeQuestion from "../models/aptitudeQuestions.model.js";

const addQuestion = async (req, res) => {
  try {
    const { question, options, answerIndex, tags } = req.body;

    await AptitudeQuestion.create({
      question,
      options,
      answerIndex,
      tags,
    });

    res.json({ message: "Question added" });
  } catch (err) {
    res.status(500).json({ message: "Add question error", error: err.message });
  }
};

const getQuestions = async (req, res) => {
  const questions = await AptitudeQuestion.find();
  res.json(questions);
};

export { addQuestion, getQuestions };
