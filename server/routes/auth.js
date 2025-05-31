const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
require('dotenv').config();

// Register
router.post('/register', [
  body('password').isLength({ min: 5 }).withMessage('Password min 5 chars'),
  body('fullName').isLength({ min: 2 }).withMessage('Full name required'),
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { password, fullName, email } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ passwordHash, fullName, email });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' });
    res.json({ token, user: { email: user.email, role: user.role, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password (stub)
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  // For now, just return success (email sending to be implemented)
  res.json({ message: 'If this email exists, a reset link will be sent.' });
});

// Reset Password (stub)
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 5 })
], async (req, res) => {
  // For now, just return success (token logic to be implemented)
  res.json({ message: 'Password reset logic to be implemented.' });
});

// Get user by email (for admin users)
router.get('/users/:email', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const { email } = req.params;
    const user = await User.findOne({ email }).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router; 