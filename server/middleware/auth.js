const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token');
    }
    
    // Verify token - use 'secret' as default to match auth.js
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Find user - use decoded.userId to match how token is created
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Attach user to request with correct id field
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'אנא התחבר למערכת' });
  }
};

module.exports = auth; 