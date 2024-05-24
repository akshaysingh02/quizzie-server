const mongoose = require("mongoose");
const optionSchema = require("./optionModel");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [optionSchema],
    validate: {
      validator: function (val) {
        return val.length >= 2 && val.length <= 5;
      },
      message: "Each question must have between 2 and 5 options",
    },
  },
  timer: { type: Number, enum: [0, 5, 10], default: 0 },
  type: { type: String, enum: ["q&a", "poll"], required: true },

  //for analytics

  attempts: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  optionSelections: {
    // For poll type
    type: Map,
    of: Number,
    default: {},
  },
});


module.exports = questionSchema;
