const express = require("express");
const Quiz = require("../models/quizModel");

const createQuiz = async (req, res) => {
  try {
    const { title, type, questions } = req.body;

    if (!title || !type || !questions) {
      return res.status(400).json({
        errorMessage: "please enter title type and questions, Bad request",
      });
    }

    const newQuiz = new Quiz({
      refUser: req.currentUserId,
      title,
      type,
      questions,
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json({ message: "quiz created Successfully" });
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

module.exports = {
  createQuiz,
  getQuizDetailsById,
  updateQuizDetailsById,
  deleteQuiz,
};
