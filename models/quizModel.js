const mongoose = require("mongoose");
const questionSchema = require("./questionModel");

const quizSchema = new mongoose.Schema({
  refUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
  uniqueLink: {
    type: String,
    required: true,
    unique: true,
  },
  impressions: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Quiz", quizSchema);
