const mongoose = require('mongoose');

const solvedProblemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  company: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  leetcodeLink: {
    type: String
  },
  notes: {
    type: String,
    default: ''
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  isBookmarked: {
    type: Boolean,
    default: false
  },
  solvedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries
solvedProblemSchema.index({ userId: 1, problemId: 1 }, { unique: true });

// Index for faster queries
solvedProblemSchema.index({ userId: 1, solvedAt: -1 });
solvedProblemSchema.index({ userId: 1, company: 1 });
solvedProblemSchema.index({ userId: 1, difficulty: 1 });

module.exports = mongoose.model('SolvedProblem', solvedProblemSchema);
