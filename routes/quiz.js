const express = require("express")
const router = express.Router()
const quizController = require("../controller/quizController")
const verifyToken = require("../middlewares/verifyAuth")
const validateQuiz = require("../middlewares/validateQuiz")


router.post("/create-quiz",verifyToken,validateQuiz,quizController.createQuiz);

module.exports = router