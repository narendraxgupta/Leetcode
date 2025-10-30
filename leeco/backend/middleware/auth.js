const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Auth failed: No token');
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('Auth failed: User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'User not found, access denied' 
      });
    }

    // Attach user to request
    req.userId = decoded.userId;
    req.user = user;
    console.log(`Auth success: User ${req.userId} authenticated for ${req.method} ${req.path}`);
    next();
  } catch (error) {
    console.log('Auth failed: Invalid token', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Token is invalid or expired' 
    });
  }
};

module.exports = auth;
