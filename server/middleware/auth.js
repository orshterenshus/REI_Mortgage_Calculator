/**
 * ========================================
 * Middleware לאימות משתמשים (Auth Middleware)
 * ========================================
 * 
 * תיאור:
 * Middleware זה אחראי על אימות משתמשים בכל בקשה מוגנת
 * הוא בודק את תקינות ה-JWT token ומצרף את פרטי המשתמש לבקשה
 * 
 * תלויות:
 * - jsonwebtoken: לאימות ופענוח JWT tokens
 * - User model: לשליפת פרטי המשתמש מהמסד
 * 
 * שימוש:
 * מוסיפים את ה-middleware לכל route שדורש אימות:
 * router.get('/protected-route', auth, (req, res) => {...})
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * פונקציית Middleware לאימות משתמשים
 * 
 * תהליך האימות:
 * 1. בדיקה שקיים Authorization header בבקשה
 * 2. חילוץ ה-token מה-header (פורמט: "Bearer TOKEN")
 * 3. אימות ופענוח ה-token באמצעות המפתח הסודי
 * 4. מציאת המשתמש במסד הנתונים לפי ה-ID מה-token
 * 5. הוספת פרטי המשתמש לאובייקט req להמשך השימוש
 * 
 * @param {Request} req - אובייקט הבקשה של Express
 * @param {Response} res - אובייקט התגובה של Express
 * @param {Function} next - פונקציה למעבר ל-middleware הבא
 * 
 * @modifies req.user - מוסיף אובייקט עם פרטי המשתמש:
 * - id: string - מזהה המשתמש (MongoDB ObjectId)
 * - email: string - כתובת המייל
 * - role: string - תפקיד המשתמש ('user' או 'admin')
 * - fullName: string - שם מלא
 * 
 * @modifies req.token - שומר את ה-token המקורי
 * 
 * @errors
 * מחזיר 401 (Unauthorized) במקרים הבאים:
 * - אין Authorization header
 * - ה-token לא תקין או פג תוקף
 * - המשתמש לא נמצא במסד הנתונים
 * 
 * @example שימוש ב-route:
 * router.get('/my-profile', auth, async (req, res) => {
 *   // req.user מכיל את פרטי המשתמש המאומת
 *   console.log('User:', req.user.email);
 *   console.log('Role:', req.user.role);
 * });
 */
const auth = async (req, res, next) => {
  try {
    /**
     * שלב 1: חילוץ ה-token מה-header
     * 
     * ה-header צריך להיות בפורמט:
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     */
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // בדיקה שה-token קיים
    if (!token) {
      throw new Error('No token provided');
    }
    
    /**
     * שלב 2: אימות ופענוח ה-token
     * 
     * jwt.verify בודק:
     * - שה-token נוצר עם המפתח הסודי שלנו
     * - שה-token לא פג תוקף
     * - שה-token לא השתנה או זויף
     * 
     * אם הכל תקין, מחזיר את המידע שהוצפן ב-token
     */
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret' // המפתח הסודי
    );
    
    /**
     * שלב 3: מציאת המשתמש במסד הנתונים
     * 
     * משתמשים ב-userId שפוענח מה-token
     * לא מחזירים את passwordHash מטעמי אבטחה
     */
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    // בדיקה שהמשתמש קיים
    if (!user) {
      throw new Error('User not found');
    }
    
    /**
     * שלב 4: הצמדת פרטי המשתמש לבקשה
     * 
     * יוצרים אובייקט user נקי עם הפרטים הנדרשים
     * זה מה שיהיה זמין ב-req.user בכל ה-routes המוגנים
     */
    req.user = {
      id: user._id,         // מזהה המשתמש
      email: user.email,    // כתובת מייל
      role: user.role,      // תפקיד (user/admin)
      fullName: user.fullName // שם מלא
    };
    
    // שמירת ה-token המקורי (לשימוש עתידי אם נדרש)
    req.token = token;
    
    /**
     * שלב 5: מעבר ל-middleware או route הבא
     * 
     * אם הכל עבר בהצלחה, ממשיכים לטיפול בבקשה
     */
    next();
    
  } catch (error) {
    /**
     * טיפול בשגיאות
     * 
     * כל שגיאה באימות גורמת להחזרת 401 Unauthorized
     * מטעמי אבטחה, לא חושפים פרטים מדויקים על השגיאה
     */
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'אנא התחבר למערכת' });
  }
};

/**
 * ========================================
 * ייצוא ה-Middleware
 * ========================================
 */

module.exports = auth; 