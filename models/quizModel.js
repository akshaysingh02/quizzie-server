const mongoose = require("mongoose");
const questionSchema = require("./questionModel")

const quizSchema = new mongoose.Schema({
  refUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // set to tue later
  },
  title: {
    type: String,
    required: true,
  },
  type: { type: String, enum: ["q&a", "poll"], required: true },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function (val) {
        return val.length >= 1 && val.length <= 5;
      },
      message: "Quiz must have between 1 and 5 questions",
    },
  },
});

module.exports = mongoose.model("Quiz", quizSchema);
