const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const SolvedProblem = require('../models/SolvedProblem');
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

// ============= NEW ANALYTICS ROUTES =============

// @route   POST /api/progress/mark-solved
// @desc    Mark a problem as solved
// @access  Private
router.post('/mark-solved', auth, async (req, res) => {
  try {
    const { problemId, title, difficulty, company, duration, leetcodeLink, notes, timeSpent } = req.body;

    // Check if already solved
    const existing = await SolvedProblem.findOne({
      userId: req.userId,
      problemId
    });

    if (existing) {
      // Update existing entry
      existing.notes = notes || existing.notes;
      existing.timeSpent = timeSpent || existing.timeSpent;
      existing.solvedAt = new Date();
      await existing.save();

      return res.json({
        success: true,
        message: 'Problem updated successfully',
        problem: existing
      });
    }

    // Create new solved problem entry
    const solvedProblem = new SolvedProblem({
      userId: req.userId,
      problemId,
      title,
      difficulty,
      company,
      duration,
      leetcodeLink,
      notes,
      timeSpent
    });

    await solvedProblem.save();

    res.json({
      success: true,
      message: 'Problem marked as solved!',
      problem: solvedProblem
    });
  } catch (error) {
    console.error('Mark solved error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/progress/unmark-solved/:problemId
// @desc    Remove a problem from solved list
// @access  Private
router.delete('/unmark-solved/:problemId', auth, async (req, res) => {
  try {
    const problem = await SolvedProblem.findOneAndDelete({
      userId: req.userId,
      problemId: req.params.problemId
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found in your solved list'
      });
    }

    res.json({
      success: true,
      message: 'Problem unmarked successfully'
    });
  } catch (error) {
    console.error('Unmark solved error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/solved-problems
// @desc    Get all solved problems for user
// @access  Private
router.get('/solved-problems', auth, async (req, res) => {
  try {
    const problems = await SolvedProblem.find({ userId: req.userId })
      .sort({ solvedAt: -1 });

    res.json({
      success: true,
      problems
    });
  } catch (error) {
    console.error('Get solved problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/check-solved/:problemId
// @desc    Check if a problem is solved
// @access  Private
router.get('/check-solved/:problemId', auth, async (req, res) => {
  try {
    const problem = await SolvedProblem.findOne({
      userId: req.userId,
      problemId: req.params.problemId
    });

    res.json({
      success: true,
      isSolved: !!problem,
      problem: problem || null
    });
  } catch (error) {
    console.error('Check solved error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/analytics
// @desc    Get comprehensive analytics for dashboard
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const problems = await SolvedProblem.find({ userId: req.userId });

    // Total count
    const totalSolved = problems.length;

    // Difficulty breakdown
    const difficultyStats = {
      Easy: problems.filter(p => p.difficulty === 'Easy').length,
      Medium: problems.filter(p => p.difficulty === 'Medium').length,
      Hard: problems.filter(p => p.difficulty === 'Hard').length
    };

    // Company breakdown (top 10)
    const companyStats = {};
    problems.forEach(p => {
      companyStats[p.company] = (companyStats[p.company] || 0) + 1;
    });
    const topCompanies = Object.entries(companyStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([company, count]) => ({ company, count }));

    // Progress over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProblems = problems.filter(p => 
      new Date(p.solvedAt) >= thirtyDaysAgo
    );

    // Group by date
    const progressByDate = {};
    recentProblems.forEach(p => {
      const date = new Date(p.solvedAt).toISOString().split('T')[0];
      progressByDate[date] = (progressByDate[date] || 0) + 1;
    });

    // Fill in missing dates with 0 and calculate cumulative
    const progressTimeline = [];
    let cumulative = totalSolved - recentProblems.length;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dailyCount = progressByDate[dateStr] || 0;
      cumulative += dailyCount;
      
      progressTimeline.push({
        date: dateStr,
        count: dailyCount,
        cumulative: cumulative
      });
    }

    // Current streak
    let currentStreak = 0;
    const sortedDates = [...new Set(problems.map(p => 
      new Date(p.solvedAt).toISOString().split('T')[0]
    ))].sort().reverse();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (sortedDates.length > 0) {
      if (sortedDates[0] === today || sortedDates[0] === yesterdayStr) {
        currentStreak = 1;
        let checkDate = new Date(sortedDates[0]);
        
        for (let i = 1; i < sortedDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const expectedDate = checkDate.toISOString().split('T')[0];
          
          if (sortedDates[i] === expectedDate) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    sortedDates.reverse().forEach(dateStr => {
      const currentDate = new Date(dateStr);
      
      if (prevDate) {
        const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      prevDate = currentDate;
    });
    longestStreak = Math.max(longestStreak, tempStreak);

    res.json({
      success: true,
      analytics: {
        totalSolved,
        difficultyStats,
        topCompanies,
        progressTimeline,
        currentStreak,
        longestStreak,
        bookmarkedCount: problems.filter(p => p.isBookmarked).length,
        totalTimeSpent: problems.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        recentlySolved: problems.slice(0, 5).map(p => ({
          title: p.title,
          difficulty: p.difficulty,
          company: p.company,
          solvedAt: p.solvedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
