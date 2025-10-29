const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendPasswordResetLink } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', [
  auth,
  body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { username, email } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      }
      user.username = username;
    }

    // Check if email is taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile update' 
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during password change' 
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email (simplified version)
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Check if email is configured
    const isEmailConfigured = process.env.EMAIL_USER && 
                              process.env.EMAIL_PASSWORD && 
                              process.env.EMAIL_USER !== 'yourname@gmail.com';

    if (isEmailConfigured) {
      // Send reset link via email
      try {
        await sendPasswordResetLink(email, user.username, resetToken);
        console.log('Password reset link sent successfully to:', email);
        
        res.json({
          success: true,
          message: 'A password reset link has been sent to your email.'
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        console.log('Reset token for', email, ':', resetToken);
        
        res.status(500).json({
          success: false,
          message: 'Failed to send email. Please try again later.'
        });
      }
    } else {
      // Email not configured - return link directly
      const resetUrl = `http://localhost:3000/reset-password.html?token=${resetToken}`;
      console.log('Email not configured. Reset link for:', email);
      console.log('Reset URL:', resetUrl);
      
      res.json({
        success: true,
        message: 'Click the link to reset your password.',
        resetLink: resetUrl // Send link directly in response
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { token, newPassword } = req.body;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is for password reset
      if (decoded.purpose !== 'password-reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid reset token'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link'
      });
    }

    // Find user and update password
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password (plain text as per your current implementation)
    user.password = newPassword;
    await user.save();

    console.log('Password reset successful for user:', user.email);

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

module.exports = router;
