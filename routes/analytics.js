const express = require("express")
const router = express.Router()
const quizController = require("../controller/quizController")
const verifyToken = require("../middlewares/verifyAuth")


// router.get("/analytics",verifyToken, quizController)