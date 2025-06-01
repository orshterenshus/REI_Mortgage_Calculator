/**
 * ========================================
 * התחברות למסד נתונים MongoDB
 * ========================================
 * 
 * הקובץ האחראי על יצירת וניהול החיבור למסד הנתונים
 * מטפל ביצירת קולקציות, אינדקסים ואופטימיזציות
 * 
 * תלויות:
 * - mongoose: ממשק ODM למסד נתונים MongoDB
 */

const mongoose = require('mongoose');

/**
 * פונקציה להתחברות למסד נתונים MongoDB
 * 
 * תהליך ההתחברות כולל:
 * 1. יצירת חיבור למסד הנתונים
 * 2. בדיקה ויצירה של קולקציות נדרשות
 * 3. יצירת אינדקסים לשיפור ביצועים
 * 4. הגדרת חוקי pluralization
 * 
 * @async
 * @function connectDB
 * @throws {Error} אם ההתחברות נכשלת
 */
const connectDB = async () => {
  try {
    /**
     * ========================================
     * שלב 1: יצירת חיבור למסד נתונים
     * ========================================
     */
    
    // כתובת מסד הנתונים - ברירת מחדל לפיתוח מקומי
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/apartment-calculator';
    
    // אפשרויות החיבור למסד הנתונים
    const connectionOptions = {
      useNewUrlParser: true,    // שימוש בפרסר החדש של MongoDB
      useUnifiedTopology: true, // שימוש במנוע החיבור החדש
    };

    // ביצוע החיבור למסד הנתונים
    const conn = await mongoose.connect(mongoURI, connectionOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    /**
     * ========================================
     * שלב 2: ניהול קולקציות במסד הנתונים
     * ========================================
     */
    
    try {
      console.log('=== MongoDB Collection Management ===');
      
      // קבלת הפניה למסד הנתונים
      const db = mongoose.connection.db;
      
      // קבלת רשימת כל הקולקציות הקיימות
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      console.log('Existing collections:', collectionNames.join(', '));
      
      /**
       * טיפול בקולקציית deals (עסקאות)
       * ווידוא שהקולקציה קיימת עבור שמירת נתוני העסקאות
       */
      if (!collectionNames.includes('deals')) {
        await db.createCollection('deals');
        console.log('✓ deals collection created successfully');
      } else {
        console.log('✓ deals collection already exists');
      }
      
      // בדיקה מחודשת של קולקציות אחרי השינויים
      const updatedCollections = await db.listCollections().toArray();
      const updatedNames = updatedCollections.map(c => c.name);
      console.log('Final collections:', updatedNames.join(', '));
      
      /**
       * ========================================
       * שלב 3: יצירת אינדקסים לשיפור ביצועים
       * ========================================
       */
      
      // יצירת אינדקס על שדה name בקולקציית deals
      // מאיץ חיפושים לפי שם העסקה
      await db.collection('deals').createIndex({ name: 1 });
      console.log('✓ Index created on deals.name field');
      
      // יצירת אינדקס על שדה email בקולקציית deals
      // מאיץ חיפוש עסקאות לפי משתמש
      await db.collection('deals').createIndex({ email: 1 });
      console.log('✓ Index created on deals.email field');
      
      // יצירת אינדקס על שדה createdAt בקולקציית deals
      // מאיץ מיון לפי תאריך יצירה
      await db.collection('deals').createIndex({ createdAt: -1 });
      console.log('✓ Index created on deals.createdAt field');
      
      console.log('=== Collection management completed ===');
      
    } catch (err) {
      console.error('❌ Error in collection management:', err.message);
      // לא עוצרים את השרת בגלל שגיאות בניהול קולקציות
    }
    
    /**
     * ========================================
     * שלב 4: הגדרות Mongoose מתקדמות
     * ========================================
     */
    
    /**
     * הגדרת חוק pluralization מותאם אישית
     * מבטיח שמודל Deal ישתמש בקולקציה 'deals'
     * 
     * @param {string} name - שם המודל
     * @returns {string} שם הקולקציה
     */
    mongoose.pluralize(function(name) {
      if (name === 'Deal') return 'deals';
      if (name === 'User') return 'users';
      return name.toLowerCase() + 's';
    });
    
    console.log('✓ Mongoose pluralization rules configured');
    
  } catch (error) {
    /**
     * ========================================
     * טיפול בשגיאות התחברות
     * ========================================
     */
    
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Full error details:', error);
    
    // יציאה מהתהליך עם קוד שגיאה
    // השרת לא יכול לפעול בלי מסד נתונים
    process.exit(1);
  }
};

/**
 * ========================================
 * ייצוא הפונקציות
 * ========================================
 */

module.exports = { connectDB }; 