const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  problemTitle: {
    type: String,
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
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  dateSolved: {
    type: Date,
    default: Date.now
  },
  attempted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one entry per user per problem
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
