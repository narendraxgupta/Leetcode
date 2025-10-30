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

// IMPORTANT: All specific routes must come BEFORE the generic /:company/:duration route
// Otherwise Express will match /:company/:duration first!

// @route   GET /api/progress/check-solved/:problemId
// @desc    Check if a problem is solved (moved before /:company/:duration)
// @access  Private
router.get('/check-solved/:problemId', auth, async (req, res) => {
  try {
    console.log('=== GET /check-solved/:problemId ===');
    console.log('User ID:', req.userId);
    console.log('Problem ID:', req.params.problemId);

    const problem = await SolvedProblem.findOne({
      userId: req.userId,
      problemId: req.params.problemId
    });

    console.log('Found problem:', problem ? 'YES' : 'NO');
    if (problem) {
      console.log('Problem notes length:', problem.notes ? problem.notes.length : 0);
      console.log('Problem notes preview:', problem.notes ? problem.notes.substring(0, 50) : 'empty');
    }

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

// @route   GET /api/progress/stats/all
// @desc    Get user statistics (MUST be before /:company/:duration)
// @access  Private
router.get('/stats/all', auth, async (req, res) => {
  try {
    const solvedProblems = await SolvedProblem.find({ userId: req.userId });
    
    const stats = {
      totalSolved: solvedProblems.length,
      byDifficulty: {
        Easy: solvedProblems.filter(p => p.difficulty === 'Easy').length,
        Medium: solvedProblems.filter(p => p.difficulty === 'Medium').length,
        Hard: solvedProblems.filter(p => p.difficulty === 'Hard').length
      },
      byCompany: {},
      bookmarked: solvedProblems.filter(p => p.isBookmarked).length,
      inRevisionQueue: solvedProblems.filter(p => p.inRevisionQueue).length
    };
    
    // Group by company
    solvedProblems.forEach(p => {
      stats.byCompany[p.company] = (stats.byCompany[p.company] || 0) + 1;
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/progress/solved-problems
// @desc    Get all solved problems (MUST be before /:company/:duration)
// @access  Private
router.get('/solved-problems', auth, async (req, res) => {
  try {
    const problems = await SolvedProblem.find({ userId: req.userId })
      .select('problemId title difficulty company duration solvedAt isBookmarked inRevisionQueue notes')
      .sort({ solvedAt: -1 });
    
    res.json({ success: true, count: problems.length, problems });
  } catch (error) {
    console.error('Get solved problems error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/progress/bookmarks
// @desc    Get all bookmarked problems (MUST be before /:company/:duration)
// @access  Private
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const bookmarks = await SolvedProblem.find({ 
      userId: req.userId, 
      isBookmarked: true 
    }).select('problemId title difficulty company duration notes solvedAt');
    
    res.json({ success: true, count: bookmarks.length, bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/progress/analytics
// @desc    Get analytics data (MUST be before /:company/:duration)
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const problems = await SolvedProblem.find({ userId: req.userId }).sort({ solvedAt: -1 });
    
    const totalSolved = problems.length;
    
    // Difficulty stats
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
      p.solvedAt && new Date(p.solvedAt) >= thirtyDaysAgo
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

// @route   POST /api/progress/toggle-bookmark/:problemId
// @desc    Toggle bookmark for a solved problem (creates solved entry if missing)
// @access  Private
router.post('/toggle-bookmark/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    let problem = await SolvedProblem.findOne({ userId: req.userId, problemId });

    if (!problem) {
      // If the problem isn't present yet, create a minimal record so user can bookmark it
      problem = new SolvedProblem({
        userId: req.userId,
        problemId,
        title: req.body.title || 'Unknown',
        difficulty: req.body.difficulty || 'Easy',
        company: req.body.company || 'unknown',
        duration: req.body.duration || 'all',
        isBookmarked: true
      });
      await problem.save();
      return res.json({ success: true, isBookmarked: true, problem });
    }

    problem.isBookmarked = !problem.isBookmarked;
    await problem.save();

    res.json({ success: true, isBookmarked: problem.isBookmarked, problem });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/progress/notes/:problemId
// @desc    Update notes for a solved problem (creates entry if missing)
// @access  Private
router.put('/notes/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { notes } = req.body;

    console.log('=== PUT /notes/:problemId ===');
    console.log('User ID:', req.userId);
    console.log('Problem ID:', problemId);
    console.log('Request body:', req.body);

    let problem = await SolvedProblem.findOne({ userId: req.userId, problemId });
    console.log('Found existing problem:', problem ? 'YES' : 'NO');

    if (!problem) {
      // Create a minimal record if it doesn't exist yet
      console.log('Creating new problem record with:', {
        userId: req.userId,
        problemId,
        title: req.body.title || 'Unknown',
        difficulty: req.body.difficulty || 'Easy',
        company: req.body.company || 'unknown',
        duration: req.body.duration || 'all',
        notes: notes || ''
      });
      problem = new SolvedProblem({
        userId: req.userId,
        problemId,
        title: req.body.title || 'Unknown',
        difficulty: req.body.difficulty || 'Easy',
        company: req.body.company || 'unknown',
        duration: req.body.duration || 'all',
        notes: notes || ''
      });
      await problem.save();
      console.log('New problem saved with ID:', problem._id);
      return res.json({ success: true, message: 'Notes saved', problem });
    }

    problem.notes = typeof notes === 'string' ? notes : problem.notes;
    await problem.save();
    console.log('Updated problem, notes length:', problem.notes.length);

    res.json({ success: true, message: 'Notes updated', problem });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/progress/snippet/:problemId
// @desc    Add a code snippet for a problem (creates entry if missing)
// @access  Private
router.post('/snippet/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { title, language, code } = req.body;

    let problem = await SolvedProblem.findOne({ userId: req.userId, problemId });
    if (!problem) {
      // Create a minimal record if it doesn't exist yet
      problem = new SolvedProblem({
        userId: req.userId,
        problemId,
        title: req.body.problemTitle || 'Unknown',
        difficulty: req.body.difficulty || 'Easy',
        company: req.body.company || 'unknown',
        duration: req.body.duration || 'all',
        codeSnippets: []
      });
    }

    const snippet = { title: title || 'Solution', language: language || 'javascript', code: code || '' };
    problem.codeSnippets.push(snippet);
    await problem.save();

    res.json({ success: true, message: 'Snippet added', snippet, problem });
  } catch (error) {
    console.error('Add snippet error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/progress/snippet/:problemId/:snippetId
// @desc    Delete a code snippet
// @access  Private
router.delete('/snippet/:problemId/:snippetId', auth, async (req, res) => {
  try {
    const { problemId, snippetId } = req.params;
    console.log('=== DELETE /snippet/:problemId/:snippetId ===');
    console.log('Problem ID:', problemId);
    console.log('Snippet ID:', snippetId);

    const problem = await SolvedProblem.findOne({ userId: req.userId, problemId });
    if (!problem) {
      console.log('Problem not found');
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    console.log('Problem found, snippets count:', problem.codeSnippets.length);
    
    // Find the snippet by _id
    const snippetIndex = problem.codeSnippets.findIndex(s => s._id.toString() === snippetId);
    if (snippetIndex === -1) {
      console.log('Snippet not found in array');
      return res.status(404).json({ success: false, message: 'Snippet not found' });
    }

    console.log('Removing snippet at index:', snippetIndex);
    problem.codeSnippets.splice(snippetIndex, 1);
    await problem.save();
    console.log('Snippet removed successfully');

    res.json({ success: true, message: 'Snippet removed', problem });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/progress/revision/:problemId
// @desc    Toggle revision queue flag and optionally set nextReview
// @access  Private
router.post('/revision/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { inRevisionQueue, nextReview } = req.body;

    const problem = await SolvedProblem.findOne({ userId: req.userId, problemId });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    problem.inRevisionQueue = typeof inRevisionQueue === 'boolean' ? inRevisionQueue : !problem.inRevisionQueue;
    problem.nextReview = nextReview ? new Date(nextReview) : problem.nextReview;
    await problem.save();

    res.json({ success: true, message: 'Revision queue updated', problem });
  } catch (error) {
    console.error('Revision toggle error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/progress/:company/:duration
// @desc    Get progress for specific company and duration
// @access  Private
// IMPORTANT: This generic route MUST come AFTER all specific routes!
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

module.exports = router;
