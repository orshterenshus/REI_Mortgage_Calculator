/**
 * ========================================
 * מודל עסקת השקעה נדל"ן (Deal)
 * ========================================
 * 
 * מגדיר את מבנה הנתונים של עסקת השקעה במסד הנתונים
 * כולל כל השדות הנדרשים לחישוב כדאיות השקעה
 * 
 * תלויות:
 * - mongoose: ממשק ODM למסד נתונים MongoDB
 */

const mongoose = require('mongoose');

/**
 * ========================================
 * ניקוי מודלים קיימים
 * ========================================
 * 
 * מוחק מודלים קיימים למניעת קונפליקטים
 * חשוב במיוחד במהלך פיתוח כשהמודל משתנה
 */
try {
  const models = mongoose.modelNames();
  models.forEach(model => {
    if (model === 'Deal' || model === 'deals') {
      mongoose.deleteModel(model);
    }
  });
} catch (error) {
  console.log('Note: No existing models to clean up');
}

/**
 * ========================================
 * הגדרת סכמת העסקה
 * ========================================
 * 
 * כל עסקה מכילה:
 * - פרטי המשתמש שיצר את העסקה
 * - כתובת הנכס ופרטיו הכספיים
 * - תנאי המשכנתא והשקעה
 * - תוצאות החישובים
 * - תחזית רווחיות
 */
const dealSchema = new mongoose.Schema({
  
  /**
   * ========================================
   * פרטי המשתמש
   * ========================================
   */
  
  /**
   * מזהה המשתמש שיצר את העסקה
   * קישור למודל User במסד הנתונים
   * @type {ObjectId}
   * @required
   */
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  /**
   * כתובת המייל של המשתמש
   * משמש לחיפוש מהיר של עסקאות לפי משתמש
   * @type {String}
   * @required
   */
  email: { 
    type: String, 
    required: true 
  },

  /**
   * ========================================
   * פרטי הנכס
   * ========================================
   */
  
  /**
   * כתובת הנכס המלאה
   * בפורמט: "רחוב מספר, עיר" (לדוגמה: "תירוש 56, כרמיאל")
   * @type {String}
   * @required
   */
  address: {
    type: String,
    required: [true, 'Please provide a property address'],
    trim: true
  },
  
  /**
   * שם העסקה (לתאימות עם קוד ישן)
   * בדרך כלל זהה לכתובת הנכס
   * @type {String}
   */
  name: {
    type: String,
    trim: true
  },

  /**
   * ========================================
   * נתונים כספיים של הנכס
   * ========================================
   */
  
  /**
   * מחיר הנכס בשקלים
   * הסכום הכולל שישולם עבור רכישת הנכס
   * @type {Number}
   * @required
   */
  propertyValue: {
    type: Number,
    required: [true, 'Please provide the property value']
  },
  
  /**
   * אחוז מס רכישה ועלויות נלוות
   * בדרך כלל בין 2% ל-10% ממחיר הנכס
   * @type {Number}
   * @required
   */
  purchaseTaxRate: {
    type: Number,
    required: [true, 'Please provide the purchase tax rate']
  },
  
  /**
   * עמלת עו"ד בשקלים
   * עלות השירותים המשפטיים לעסקה
   * @type {Number}
   * @default 0
   */
  lawyerFee: {
    type: Number,
    default: 0
  },
  
  /**
   * הוצאות אחרות (שיפוצים, ציוד וכו')
   * השקעה נוספת הנדרשת לאחר הרכישה
   * @type {Number}
   * @default 0
   */
  otherExpenses: {
    type: Number,
    default: 0
  },

  /**
   * ========================================
   * פרטי המימון
   * ========================================
   */
  
  /**
   * הון עצמי בשקלים
   * הסכום שהמשקיע משקיע מכספו
   * @type {Number}
   * @required
   */
  equity: {
    type: Number,
    required: [true, 'Please provide the equity amount']
  },
  
  /**
   * ריבית שנתית של המשכנתא באחוזים
   * בדרך כלל בין 2% ל-6%
   * @type {Number}
   * @required
   * @default 4.0
   */
  annualInterestRate: {
    type: Number,
    required: [true, 'Please provide the annual interest rate'],
    default: 4.0
  },
  
  /**
   * תקופת המשכנתא בשנים
   * כמה שנים ייקח להחזיר את המשכנתא
   * @type {Number}
   * @required
   */
  loanTerm: {
    type: Number,
    required: [true, 'Please provide the loan term']
  },

  /**
   * ========================================
   * פרטי השכרה
   * ========================================
   */
  
  /**
   * שכירות חודשית בשקלים
   * הכנסה צפויה מהשכרת הנכס
   * @type {Number}
   * @required
   */
  monthlyRent: {
    type: Number,
    required: [true, 'Please provide the monthly rent']
  },
  
  /**
   * אחוז הוצאות שנתיות
   * עלויות תחזוקה, ביטוח, ארנונה וכו'
   * @type {Number}
   * @required
   */
  annualExpensesRate: {
    type: Number,
    required: [true, 'Please provide the annual expenses rate']
  },
  
  /**
   * אחוז עליית ערך שנתית צפויה
   * כמה אחוזים צפוי הנכס לעלות בערכו מדי שנה
   * @type {Number}
   * @default 0
   */
  annualAppreciationRate: {
    type: Number,
    default: 0
  },

  /**
   * ========================================
   * מידע מערכתי
   * ========================================
   */
  
  /**
   * תאריך יצירת העסקה
   * מתי הועסקה נוצרה במערכת
   * @type {Date}
   * @default Date.now
   */
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  /**
   * תוצאות החישובים
   * אובייקט המכיל את כל התוצאות המחושבות
   * כגון: תזרים מזומנים, תשואות, תשלומים וכו'
   * @type {Mixed}
   * @default {}
   */
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  /**
   * תחזית שנתית
   * מערך של אובייקטים המכילים תחזית ל-30 שנה
   * כל שנה מכילה: ערך נכס, יתרת הלוואה, תזרים וכו'
   * @type {Array<Mixed>}
   * @default []
   */
  forecast: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
  
}, {
  /**
   * אכיפת שימוש בקולקציית 'deals' במסד הנתונים
   * מבטיח עקביות בשמות הקולקציות
   */
  collection: 'deals'
});

/**
 * ========================================
 * Middleware וחיטוטים
 * ========================================
 */

/**
 * פעולות לפני שמירה
 * מופעל אוטומטית לפני כל save()
 * כאן ניתן להוסיף ולידציות נוספות או עיבוד נתונים
 */
dealSchema.pre('save', function(next) {
  // כאן ניתן להוסיף לוגיקה נוספת לפני השמירה
  next();
});

/**
 * פעולות לפני חיפושים
 * מבטיח שימוש בקולקציה הנכונה בכל פעולות החיפוש
 */
dealSchema.pre(/^find/, function() {
  if (this.model.collection.name !== 'deals') {
    this._collection = mongoose.connection.collection('deals');
  }
});

/**
 * ========================================
 * יצירת המודל וייצוא
 * ========================================
 */

/**
 * יצירת מודל Deal
 * הפרמטרים:
 * 1. שם המודל: 'Deal'
 * 2. הסכמה: dealSchema  
 * 3. שם הקולקציה: 'deals' (חשוב!)
 */
const DealModel = mongoose.model('Deal', dealSchema, 'deals');

/**
 * אכיפת גישה ישירה לקולקציית deals
 * מבטיח שהמודל תמיד ישתמש בקולקציה הנכונה
 */
Object.defineProperty(DealModel, 'collection', {
  get: function() {
    return mongoose.connection.collection('deals');
  },
  set: function() {
    return mongoose.connection.collection('deals');
  }
});

/**
 * ייצוא המודל לשימוש ביתר המערכת
 */
module.exports = DealModel; 