/**
 * ========================================
 * נתיבי אימות משתמשים (Auth Routes)
 * ========================================
 * 
 * קובץ זה מגדיר את כל נתיבי ה-API הקשורים לאימות:
 * - הרשמת משתמש חדש
 * - התחברות למערכת
 * - איפוס סיסמה
 * - ניהול משתמשים (למנהלים)
 * 
 * תלויות:
 * - express: יצירת נתיבי API
 * - express-validator: ולידציות על נתוני קלט
 * - bcrypt: הצפנת סיסמאות
 * - jsonwebtoken: יצירת ואימות טוקנים
 * - dotenv: משתני סביבה
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
require('dotenv').config();

/**
 * ========================================
 * הרשמת משתמש חדש
 * ========================================
 */

/**
 * הרשמת משתמש חדש למערכת
 * 
 * @route POST /api/auth/register
 * @access Public - פתוח לכולם
 * 
 * @body {Object} פרטי המשתמש:
 * - fullName: string - שם מלא (מינימום 2 תווים)
 * - email: string - כתובת מייל תקינה וייחודית
 * - password: string - סיסמה (מינימום 5 תווים)
 * 
 * @validation
 * - בדיקת תקינות מייל
 * - בדיקת אורך סיסמה
 * - בדיקת אורך שם מלא
 * - בדיקה שהמייל לא קיים כבר במערכת
 * 
 * @returns {Object} תגובת JSON:
 * - message: string - הודעת הצלחה
 * - errors: Array - רשימת שגיאות ולידציה (אם יש)
 * 
 * @security
 * - הסיסמה מוצפנת עם bcrypt (10 rounds)
 * - לעולם לא נשמרת הסיסמה הגולמית
 * 
 * @example בקשה:
 * {
 *   "fullName": "ישראל ישראלי",
 *   "email": "israel@example.com",
 *   "password": "12345"
 * }
 */
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

/**
 * ========================================
 * התחברות למערכת
 * ========================================
 */

/**
 * התחברות משתמש קיים למערכת
 * 
 * @route POST /api/auth/login
 * @access Public - פתוח לכולם
 * 
 * @body {Object} פרטי התחברות:
 * - email: string - כתובת מייל
 * - password: string - סיסמה
 * 
 * @validation
 * - בדיקת תקינות מייל
 * - בדיקה שהסיסמה לא ריקה
 * 
 * @returns {Object} תגובת JSON בהצלחה:
 * - token: string - JWT token לאימות בבקשות הבאות
 * - user: Object - פרטי המשתמש:
 *   - email: string
 *   - fullName: string
 *   - role: string ('user' או 'admin')
 * 
 * @security
 * - השוואת סיסמה מוצפנת עם bcrypt
 * - יצירת JWT token עם תוקף של שעתיים
 * - ה-token מכיל את ID המשתמש והתפקיד שלו
 * 
 * @errors
 * - 400: אם הולידציה נכשלה
 * - 400: אם המייל או הסיסמה לא נכונים
 * - 500: שגיאת שרת
 * 
 * @example בקשה:
 * {
 *   "email": "israel@example.com",
 *   "password": "12345"
 * }
 * 
 * @example תגובה מוצלחת:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "email": "israel@example.com",
 *     "fullName": "ישראל ישראלי",
 *     "role": "user"
 *   }
 * }
 */
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

/**
 * ========================================
 * איפוס סיסמה
 * ========================================
 */

/**
 * בקשה לאיפוס סיסמה
 * 
 * @route POST /api/auth/forgot-password
 * @access Public - פתוח לכולם
 * 
 * @body {Object}
 * - email: string - כתובת המייל של המשתמש
 * 
 * @description
 * כרגע זו פונקציה ריקה (stub) שמחזירה הודעת הצלחה
 * בעתיד תשלח מייל עם קישור לאיפוס סיסמה
 * 
 * @returns {Object}
 * - message: string - הודעה גנרית (למניעת דליפת מידע)
 * 
 * @security
 * - לא מגלה האם המייל קיים במערכת או לא
 * 
 * @todo
 * - הוספת יצירת טוקן איפוס
 * - שליחת מייל עם קישור
 * - שמירת הטוקן במסד הנתונים
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  // For now, just return success (email sending to be implemented)
  res.json({ message: 'If this email exists, a reset link will be sent.' });
});

/**
 * איפוס סיסמה עם טוקן
 * 
 * @route POST /api/auth/reset-password
 * @access Public - פתוח לכולם
 * 
 * @body {Object}
 * - token: string - טוקן איפוס שהתקבל במייל
 * - password: string - הסיסמה החדשה (מינימום 5 תווים)
 * 
 * @description
 * כרגע זו פונקציה ריקה (stub)
 * בעתיד תבדוק את תקינות הטוקן ותעדכן את הסיסמה
 * 
 * @returns {Object}
 * - message: string - הודעת סטטוס
 * 
 * @todo
 * - בדיקת תקינות הטוקן
 * - בדיקת תוקף הטוקן
 * - עדכון הסיסמה במסד הנתונים
 * - ביטול הטוקן לאחר השימוש
 */
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 5 })
], async (req, res) => {
  // For now, just return success (token logic to be implemented)
  res.json({ message: 'Password reset logic to be implemented.' });
});

/**
 * ========================================
 * ניהול משתמשים (למנהלים)
 * ========================================
 */

/**
 * קבלת פרטי משתמש לפי מייל (למנהלים בלבד)
 * 
 * @route GET /api/auth/users/:email
 * @access Private/Admin - דורש אימות והרשאות מנהל
 * @param {string} email - כתובת המייל של המשתמש (בפרמטר URL)
 * 
 * @description
 * מאפשר למנהל לקבל פרטי משתמש ספציפי
 * משמש בעיקר לתצוגת שמות בתיקי לקוחות
 * 
 * @returns {Object} תגובת JSON:
 * - success: boolean
 * - user: Object - פרטי המשתמש:
 *   - email: string
 *   - fullName: string
 *   - role: string
 *   - createdAt: Date
 * 
 * @security
 * - בודק שהמבקש הוא מנהל
 * - לא מחזיר את הסיסמה המוצפנת
 * 
 * @errors
 * - 403: אם המבקש אינו מנהל
 * - 404: אם המשתמש לא נמצא
 * - 500: שגיאת שרת
 */
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

/**
 * ========================================
 * ייצוא הנתיבים
 * ========================================
 */

module.exports = router; 