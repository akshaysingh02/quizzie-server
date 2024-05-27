const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Quiz = require("../models/quizModel");

const createQuiz = async (req, res) => {
  try {
    const { title, type, questions } = req.body;

    if (!title || !type || !questions) {
      return res.status(400).json({
        errorMessage: "please send title, type, and questions. Bad request",
      });
    }

    const uniqueLink = uuidv4();

    const newQuiz = new Quiz({
      refUser: req.currentUserId,
      title,
      type,
      questions,
      uniqueLink,
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json({
      message: "quiz created Successfully",
      quizLink: `${req.protocol}://${req.get("host")}/quiz/take/${uniqueLink}`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getQuizDetailsById = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({
        errorMessage: "quiz id not found. Bad request",
      });
    }

    const quizDetails = await Quiz.findById(quizId);
    if (!quizDetails) {
      return res.status(400).json({
        errorMessage: "Details not found with given id, Bad request",
      });
    }

    res.json({ quizDetails });
  } catch (error) {
    console.log(error);
  }
};

const getAllQuizzies = async (req,res) =>{
  try {
    const userId = req.currentUserId;
    const quizzes = await Quiz.find({refUser: userId});
    res.json({data: quizzes})
  } catch (error) {
    res.status(500).send("Server Error")
  }
}

const updateQuizDetailsById = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({
        errorMessage: "Bad request, can't get quizId",
      });
    }

    const { title, questions } = req.body;

    if (!title || !questions) {
      return res.status(400).json({
        errorMessage: "Bad request, can't get details from req body",
      });
    }

    const isQuizExist = Quiz.findOne({ _id: quizId });
    if (!isQuizExist) {
      return res.status(400).json({
        errorMessage: "Bad request, can't find the quiz by id",
      });
    }

    await Quiz.updateOne(
      { _id: quizId },
      {
        $set: {
          title,
          questions,
        },
      }
    );
    res.json({ message: "Quiz Updated Successfully" });
  } catch (error) {
    console.log(error);
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.currentUserId;
    if (!quizId) {
      return res.status(400).json({
        errorMessage: "Bad request, can't get quizId",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.refUser.toString() !== userId) {
      // Using `refUser` to check ownership
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this quiz" });
    }

    await Quiz.findByIdAndDelete(quizId);
    res.json({ message: "Quiz deleted Successfully" });
  } catch (error) {
    onsole.error("Error deleting quiz:", error);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred while deleting the quiz" });
  }
};

const getQuizForTaking = async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    const quiz = await Quiz.findOne({ uniqueLink }).populate("questions.options");
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    quiz.impressions += 1;
    await quiz.save();

    const quizData = quiz.toObject();
    quizData.questions.forEach((question)=>{
      question.options.forEach((option)=>{
        delete option.isCorrect;
      })
    })

    res.json({ quizData });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred while fetching the quiz" });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    const { answers } = req.body; //answers should be an array of { questionId, selectedOption }
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Invalid answers provided" });
    }

    const quiz = await Quiz.findOne({ uniqueLink }).populate(
      "questions.options"
    );
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    let correctAnswers = 0;

    quiz.questions.forEach((question, index) => {
      const answer = answers.find(
        (a) => a.questionId === question._id.toString()
      );
      if (
        answer &&
        question.options.some(
          (opt) => opt._id.toString() === answer.selectedOption
        )
      ) {
        question.attempts += 1;
        if (question.type === "q&a") {
          const selectedOption = question.options.find(
            (opt) => opt._id.toString() === answer.selectedOption
          );
          if (selectedOption.isCorrect) {
            correctAnswers++;
            question.correctAnswers += 1;
          } else {
            question.incorrectAnswers += 1;
          }
        } else if (question.type === "poll") {
          if (question.optionSelections.has(answer.selectedOption)) {
            question.optionSelections.set(
              answer.selectedOption,
              question.optionSelections.get(answer.selectedOption) + 1
            );
          } else {
            question.optionSelections.set(answer.selectedOption, 1);
          }
        }
      }
    });

    await quiz.save();

    const score = `${correctAnswers}/${quiz.questions.length}`;
    const resultMessage =
      quiz.type === "poll"
        ? "Thanks for taking the quiz"
        : `Your score is ${score}`;

    res.json({ message: resultMessage, score });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      error: "An unexpected error occurred while submitting the quiz",
    });
  }
};

const getAnalyticsData = async (req, res) => {
  try {
    const userId = req.currentUserId;

    //get total number of quizes by the particular user
    const totalQuizzes = await Quiz.countDocuments({ refUser: userId });

    //get total number of questions in all the quizzes created by the user
    const quizzes = await Quiz.find({ refUser: userId }).select(
      "questions impressions"
    );
    const totalQuestions = quizzes.reduce(
      (acc, quiz) => acc + quiz.questions.length,
      0
    );
    //get total impression from all the quizzes
    const totalImpressions = quizzes.reduce(
      (acc, quiz) => acc + quiz.impressions,
      0
    );

    res.json({ totalQuizzes, totalQuestions, totalImpressions });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({
      error: "An unexpected error occurred while fetching analytics data",
    });
  }
};

const getQuestionAnalysis = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const questionAnalysis = quiz.questions.map((question) => {
      if (question.type === "q&a") {
        return {
          questionText: question.questionText,
          attempts: question.attempts,
          correctAnswers: question.correctAnswers,
          incorrectAnswers: question.incorrectAnswers,
        };
      } else if (question.type === "poll") {
        return {
          questionText: question.questionText,
          attempts: question.attempts,
          optionSelections: Array.from(question.optionSelections.entries()).map(([optionId, count]) => ({ optionId, count })),
        };
      }
    });

    res.json({questionAnalysis})
  } catch (error) {
    console.error("Error fetching question analysis data:", error);
    res.status(500).json({
      error:
        "An unexpected error occurred while fetching question analysis data",
    });
  }
};

module.exports = {
  createQuiz,
  getQuizDetailsById,
  updateQuizDetailsById,
  deleteQuiz,
  getQuizForTaking,
  submitQuiz,
  getAnalyticsData,
  getQuestionAnalysis,
  getAllQuizzies
};
