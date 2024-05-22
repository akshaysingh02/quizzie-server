const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: function() { return this.optionType === 'text' || this.optionType === 'text-image'; } 
  },
  imageUrl: { 
    type: String, 
    required: function() { return this.optionType === 'image' || this.optionType === 'text-image'; } 
  },
  isCorrect: { type: Boolean, default: false },
  optionType: { type: String, enum: ['text', 'image', 'text-image'], required: true }
});

module.exports = optionSchema;