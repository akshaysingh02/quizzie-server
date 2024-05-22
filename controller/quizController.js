const express = require("express");
const Quiz = require("../models/quizModel")

const createQuiz = async (req, res) => {
  try {
    const { title, type, questions } = req.body;

    if(!title || !type || !questions){
      return res.status(400).json({
        errorMessage: "please enter title type and questions, Bad request"
      })
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

module.exports = {
  createQuiz,
};
