const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

// @route   GET /api/progress
// @desc    Get all progress for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId });
    
    res.json({
      success: true,
      count: progress.length,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/progress/:company/:duration
// @desc    Get progress for specific company and duration
// @access  Private
router.get('/:company/:duration', auth, async (req, res) => {
  try {
    const { company, duration } = req.params;
    
    const progress = await Progress.find({ 
      userId: req.userId,
      company,
      duration
    });
    
    res.json({
      success: true,
      count: progress.length,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/progress
// @desc    Add or update progress
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { problemId, problemTitle, company, duration, difficulty, attempted, dateSolved } = req.body;

    // Check if progress already exists
    let progress = await Progress.findOne({ 
      userId: req.userId, 
      problemId 
    });

    if (progress) {
      // Update existing progress
      progress.attempted = attempted;
      progress.dateSolved = dateSolved || new Date();
      progress.company = company;
      progress.duration = duration;
      progress.difficulty = difficulty;
      progress.problemTitle = problemTitle;
      await progress.save();
    } else {
      // Create new progress
      progress = new Progress({
        userId: req.userId,
        problemId,
        problemTitle,
        company,
        duration,
        difficulty,
        attempted,
        dateSolved: dateSolved || new Date()
      });
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Progress saved',
      progress
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/progress/:problemId
// @desc    Delete progress
// @access  Private
router.delete('/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;

    const progress = await Progress.findOneAndDelete({ 
      userId: req.userId, 
      problemId 
    });

    if (!progress) {
      return res.status(404).json({ 
        success: false, 
        message: 'Progress not found' 
      });
    }

    res.json({
      success: true,
      message: 'Progress deleted'
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/progress/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats/all', auth, async (req, res) => {
  try {
    const totalSolved = await Progress.countDocuments({ userId: req.userId });
    
    const byDifficulty = await Progress.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const byCompany = await Progress.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalSolved,
        byDifficulty,
        byCompany
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
