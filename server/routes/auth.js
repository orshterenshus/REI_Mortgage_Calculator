const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Register
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username required'),
  body('password').isLength({ min: 5 }).withMessage('Password min 5 chars'),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password, firstName, lastName, email } = req.body;
  try {
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash, firstName, lastName, email });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '2h' });
    res.json({ token, user: { username: user.username, role: user.role, firstName: user.firstName, lastName: user.lastName, email: user.email } });
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

module.exports = router; 