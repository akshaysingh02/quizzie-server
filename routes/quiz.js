const express = require("express")
const router = express.Router()
const quizController = require("../controller/quizController")
const verifyToken = require("../middlewares/verifyAuth")
const validateQuiz = require("../middlewares/validateQuiz")


router.post("/create-quiz",verifyToken,validateQuiz,quizController.createQuiz);
router.get("/quiz-details/:quizId",verifyToken,quizController.getQuizDetailsById);
router.put("/update/:quizId",verifyToken,quizController.updateQuizDetailsById);
router.delete("/delete/:quizId",verifyToken,quizController.deleteQuiz)

//quiz taking routes
router.get("/quiz/take/:uniqueLink", quizController.getQuizForTaking);
router.post("/submit/:uniqueLink", quizController.submitQuiz);

//analytics routes
router.get("/analytics",verifyToken, quizController.getAnalyticsData)
router.get("/analytics/:quizId/questions", verifyToken, quizController.getQuestionAnalysis);



module.exports = router