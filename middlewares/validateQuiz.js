module.exports = function(req, res, next) {
    const { type, questions } = req.body;
  
    if (type === 'poll') {
      for (const question of questions) {
        if (question.type !== 'poll') {
          return res.status(400).json({ error: 'All questions must be of type "poll" for a poll quiz' });
        }
        question.options.forEach(option => {
          option.isCorrect = false; // No correct answers for polls
        });
        question.timer = 0; // No timer for polls
      }
    } else if (type === 'q&a') {
      for (const question of questions) {
        if (question.type !== 'q&a') {
          return res.status(400).json({ error: 'All questions must be of type "q&a" for a Q&A quiz' });
        }
        const hasCorrectAnswer = question.options.some(option => option.isCorrect);
        if (!hasCorrectAnswer) {
          return res.status(400).json({ error: 'Each Q&A question must have at least one correct answer' });
        }
      }
    }
  
    for (const question of questions) {
      for (const option of question.options) {
        if (option.optionType === 'text' && !option.text) {
          return res.status(400).json({ error: 'Text option type must have a text field' });
        }
        if (option.optionType === 'image' && !option.imageUrl) {
          return res.status(400).json({ error: 'Image option type must have an imageUrl field' });
        }
        if (option.optionType === 'text-image' && (!option.text || !option.imageUrl)) {
          return res.status(400).json({ error: 'Text & Image option type must have both text and imageUrl fields' });
        }
      }
    }
  
    next();
  };
  