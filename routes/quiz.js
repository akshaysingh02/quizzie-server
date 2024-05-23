const express = require("express")
const router = express.Router()
const quizController = require("../controller/quizController")
const verifyToken = require("../middlewares/verifyAuth")
const validateQuiz = require("../middlewares/validateQuiz")


router.post("/create-quiz",verifyToken,validateQuiz,quizController.createQuiz);
router.get("/quiz-details/:quizId",verifyToken,quizController.getQuizDetailsById);
router.put("/update/:quizId",verifyToken,quizController.updateQuizDetailsById);
router.delete("/delete/:quizId",verifyToken,quizController.deleteQuiz)

module.exports = router