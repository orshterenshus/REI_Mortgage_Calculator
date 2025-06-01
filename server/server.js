/**
 * ========================================
 * מחשבון השקעות נדל"ן - שרת ראשי
 * ========================================
 * 
 * הקובץ הראשי של השרת שמפעיל את כל המערכת
 * מגדיר routing, middleware, ומתחבר למסד הנתונים
 * 
 * תלויות חיצונות:
 * - express: framework לשרת HTTP
 * - cors: מאפשר קריאות מדומיינים שונים
 * - morgan: רישום בקשות HTTP
 * - mongoose: ממשק למסד נתונים MongoDB
 * - dotenv: טעינת משתני סביבה
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
require('dotenv').config();
const mongoose = require('mongoose');

/**
 * ========================================
 * אתחול השרת
 * ========================================
 */

// יצירת אפליקציית Express חדשה
const app = express();

// הגדרת פורט השרת - ברירת מחדל 5000 או מתוך משתני הסביבה
const PORT = process.env.PORT || 5000;

/**
 * ========================================
 * התחברות למסד נתונים
 * ========================================
 */

// התחברות למסד נתונים MongoDB באמצעות פונקציה מיועדת
connectDB();

/**
 * ========================================
 * הגדרת Middleware
 * ========================================
 */

// פיענוח JSON בבקשות נכנסות - מאפשר לקרוא req.body
app.use(express.json());

// הגדרת CORS - מאפשר לקליינט בפורט 3000 לגשת לשרת בפורט 5000
app.use(cors());

// רישום כל הבקשות ההטיפּ לקונסולה למטרות debug
app.use(morgan('dev'));

/**
 * ========================================
 * הגדרת נתיבי API
 * ========================================
 */

// נתיבי חישובים - לחישוב תוצאות השקעה
app.use('/api/calculations', require('./routes/calculations'));

// נתיבי עסקאות - שמירה, טעינה ועריכה של עסקאות
app.use('/api/deals', require('./routes/deals'));

// נתיבי לוחות שפיצר - טעינת נתוני משכנתא
app.use('/api/schedules', require('./routes/schedules'));

// נתיבי אימות - הרשמה, התחברות ויציאה
app.use('/api/auth', require('./routes/auth'));

/**
 * ========================================
 * נתיבי בדיקת מערכת
 * ========================================
 */

/**
 * בדיקת בריאות השרת
 * מחזיר מידע על מצב השרת וחיבור למסד הנתונים
 * 
 * @route GET /api/health
 * @returns {Object} מידע על מצב השרת
 * - message: הודעת סטטוס
 * - dbConnected: האם מחובר למסד נתונים (true/false)
 * - dbHost: כתובת מסד הנתונים
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running',
    dbConnected: mongoose.connection.readyState === 1, // 1 = מחובר
    dbHost: mongoose.connection.host
  });
});

/**
 * בדיקת קולקציות במסד הנתונים
 * מציג רשימת כל הקולקציות וכמות המסמכים בכל אחת
 * 
 * @route GET /api/check-collections
 * @returns {Object} מידע על קולקציות במסד הנתונים
 * - success: האם הפעולה הצליחה
 * - collections: רשימת שמות הקולקציות
 * - stats: כמות מסמכים בכל קולקציה
 */
app.get('/api/check-collections', async (req, res) => {
  try {
    // בדיקה האם יש חיבור למסד נתונים
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'No connection to the database' 
      });
    }

    // קבלת רשימת כל הקולקציות
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // ספירת מסמכים בכל קולקציה
    const stats = {};
    for (const name of collectionNames) {
      const count = await db.collection(name).countDocuments();
      stats[name] = count;
    }

    return res.status(200).json({ 
      success: true, 
      collections: collectionNames,
      stats
    });
  } catch (error) {
    console.error('Error checking collections:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while checking collections',
      error: error.message
    });
  }
});

/**
 * ========================================
 * טיפול בשגיאות כלליות
 * ========================================
 */

/**
 * Middleware לטיפול בשגיאות שלא נתפסו
 * מופעל אוטומטית כשיש שגיאה בכל route
 * 
 * @param {Error} err - אובייקט השגיאה
 * @param {Request} req - בקשת HTTP
 * @param {Response} res - תגובת HTTP
 * @param {Function} next - פונקציה למעבר ל-middleware הבא
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    // מציג פרטי שגיאה רק בסביבת פיתוח
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * ========================================
 * הפעלת השרת
 * ========================================
 */

/**
 * הפעלת השרת על הפורט שהוגדר
 * מדפיס הודעת אישור לקונסולה
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 