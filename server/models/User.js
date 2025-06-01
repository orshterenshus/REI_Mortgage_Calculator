/**
 * ========================================
 * מודל משתמש (User)
 * ========================================
 * 
 * מגדיר את מבנה הנתונים של משתמש במערכת
 * כולל אימות, הרשאות ופונקציות עזר
 * 
 * תלויות:
 * - mongoose: ממשק ODM למסד נתונים MongoDB
 * - bcrypt: הצפנת סיסמאות
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * ========================================
 * הגדרת סכמת המשתמש
 * ========================================
 * 
 * כל משתמש במערכת מכיל:
 * - פרטים אישיים (שם מלא, מייל)
 * - פרטי אימות (סיסמה מוצפנת)
 * - הרשאות (משתמש רגיל או מנהל)
 * - נתונים למחזור סיסמה
 */
const UserSchema = new mongoose.Schema({
  
  /**
   * ========================================
   * פרטי אימות
   * ========================================
   */
  
  /**
   * סיסמה מוצפנת באמצעות bcrypt
   * מעולם לא נשמרת הסיסמה הגולמית במסד הנתונים
   * @type {String}
   * @required
   */
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password hash']
  },

  /**
   * ========================================
   * פרטים אישיים
   * ========================================
   */
  
  /**
   * שם מלא של המשתמש
   * מוצג בממשק המשתמש ובדוחות
   * @type {String}
   * @required
   * @trim מסיר רווחים מיותרים
   */
  fullName: {
    type: String,
    required: [true, 'Please provide a full name'],
    trim: true
  },
  
  /**
   * כתובת מייל ייחודית
   * משמשת כשם משתמש להתחברות
   * חייבת להיות בפורמט מייל תקין
   * @type {String}
   * @required
   * @unique מבטיח שלא יהיו שני משתמשים עם אותו מייל
   */
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },

  /**
   * ========================================
   * הרשאות במערכת
   * ========================================
   */
  
  /**
   * תפקיד המשתמש במערכת
   * - 'user': משתמש רגיל - יכול לראות רק את העסקאות שלו
   * - 'admin': מנהל - יכול לראות את כל העסקאות ומשתמשים
   * @type {String}
   * @enum ['user', 'admin']
   * @default 'user'
   */
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  /**
   * ========================================
   * איפוס סיסמה
   * ========================================
   */
  
  /**
   * טוקן לאיפוס סיסמה
   * נוצר כשמשתמש מבקש לאפס סיסמה
   * @type {String}
   * @default null
   */
  resetToken: {
    type: String,
    default: null
  },
  
  /**
   * תאריך תפוגת טוקן איפוס הסיסמה
   * הטוקן תקף לזמן מוגבל למטרות אבטחה
   * @type {Date}
   * @default null
   */
  resetTokenExpiry: {
    type: Date,
    default: null
  },

  /**
   * ========================================
   * מידע מערכתי
   * ========================================
   */
  
  /**
   * תאריך הצטרפות למערכת
   * מתי המשתמש נרשם לראשונה
   * @type {Date}
   * @default Date.now
   */
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * ========================================
 * שיטות המשתמש (Instance Methods)
 * ========================================
 */

/**
 * השוואת סיסמה שהוזנה מול הסיסמה השמורה
 * 
 * פונקציה זו מקבלת סיסמה גולמית ומשווה אותה
 * מול הסיסמה המוצפנת השמורה במסד הנתונים
 * 
 * @async
 * @param {string} candidatePassword - הסיסמה שהמשתמש הזין
 * @returns {Promise<boolean>} true אם הסיסמה נכונה, false אחרת
 * 
 * @example
 * const user = await User.findOne({ email: 'user@example.com' });
 * const isValid = await user.comparePassword('userEnteredPassword');
 * if (isValid) {
 *   // הסיסמה נכונה - אפשר להתחבר
 * }
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * ========================================
 * Hooks (Middleware)
 * ========================================
 */

/**
 * לפני שמירה - טיפול בהצפנת סיסמה
 * כאן ניתן להוסיף לוגיקה שתרוץ לפני שמירת המשתמש
 */
UserSchema.pre('save', function(next) {
  // כאן ניתן להוסיף לוגיקה נוספת לפני השמירה
  // לדוגמה: בדיקות נוספות, עיבוד נתונים וכו'
  next();
});

/**
 * ========================================
 * שיטות סטטיות (Static Methods)
 * ========================================
 */

/**
 * מציאת משתמש לפי מייל
 * פונקציה עזר לחיפוש מהיר של משתמש
 * 
 * @static
 * @async
 * @param {string} email - כתובת המייל לחיפוש
 * @returns {Promise<User|null>} המשתמש או null אם לא נמצא
 */
UserSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * יצירת סיסמה מוצפנת
 * פונקציה עזר ליצירת hash מסיסמה גולמית
 * 
 * @static
 * @async
 * @param {string} password - הסיסמה הגולמית
 * @returns {Promise<string>} הסיסמה המוצפנת
 */
UserSchema.statics.hashPassword = async function(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * ========================================
 * אינדקסים לשיפור ביצועים
 * ========================================
 */

// אינדקס על שדה המייל - מאיץ חיפושים
UserSchema.index({ email: 1 });

// אינדקס על תאריך יצירה - מאיץ מיון לפי תאריך הצטרפות
UserSchema.index({ createdAt: -1 });

/**
 * ========================================
 * ייצוא המודל
 * ========================================
 */

/**
 * יצירת וייצוא מודל User
 * המודל ישמר בקולקציה 'users' במסד הנתונים
 */
module.exports = mongoose.model('User', UserSchema); 