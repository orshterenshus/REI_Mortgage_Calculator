const mongoose = require('mongoose');

// ---- טיפול דרסטי במודלים וקולקציות ----

// מחיקת כל המודלים הקודמים
try {
  // ניקוי מודלים קיימים למניעת שימוש לא נכון
  const models = mongoose.modelNames();
  models.forEach(model => {
    if (model === 'Deal' || model === 'Investment' || model === 'deals') {
      mongoose.deleteModel(model);
      console.log(`מחיקת מודל: ${model}`);
    }
  });
} catch (error) {
  console.log('שגיאה במחיקת מודלים', error.message);
}

// הגדרת סכמה חדשה וברורה
const dealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for this deal'],
    trim: true
  },
  propertyValue: {
    type: Number,
    required: [true, 'Please provide the property value']
  },
  purchaseTaxRate: {
    type: Number,
    required: [true, 'Please provide the purchase tax rate']
  },
  lawyerFee: {
    type: Number,
    default: 0
  },
  otherExpenses: {
    type: Number,
    default: 0
  },
  equity: {
    type: Number,
    required: [true, 'Please provide the equity amount']
  },
  annualInterestRate: {
    type: Number,
    required: [true, 'Please provide the annual interest rate'],
    default: 4.0
  },
  loanTerm: {
    type: Number,
    required: [true, 'Please provide the loan term']
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Please provide the monthly rent']
  },
  annualExpensesRate: {
    type: Number,
    required: [true, 'Please provide the annual expenses rate']
  },
  annualAppreciationRate: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  forecast: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
}, {
  // אכיפת קולקציית deals באופן מוחלט
  collection: 'deals'
});

// ---- MONGOOSE HOOKS & OVERRIDES ----

// פעולות לפני שמירה
dealSchema.pre('save', function(next) {
  // תיעוד פעולת השמירה
  console.log(`🔄 שומר מסמך ב: ${this.collection.name}`);
  
  // בדיקת קולקציה
  if (this.collection.name !== 'deals') {
    console.error(`⛔ ניסיון שמירה בקולקציה שגויה: ${this.collection.name}`);
    // אכיפת שימוש ב-deals
    this.collection = mongoose.connection.collection('deals');
    console.log('✅ הופנה מחדש לקולקציית deals');
  }
  
  next();
});

// פעולות לפני כל פעולת מסמך
dealSchema.pre(/^find/, function() {
  console.log(`🔍 מחפש מסמכים בקולקציה: ${this.model.collection.name}`);
  // וידוא שימוש בקולקציה הנכונה
  if (this.model.collection.name !== 'deals') {
    console.log('⚠️ מחפש בקולקציה שגויה, מתקן לdeals');
    this._collection = mongoose.connection.collection('deals');
  }
});

// ---- יצירת מודל וייצוא ----

// חשוב! שימוש בשם מדויק - רק עם הקולקציה deals
// args: (modelName, schema, collectionName)
// השם השלישי חשוב ביותר! הוא קובע את שם הקולקציה!
const DealModel = mongoose.model('dealModel', dealSchema, 'deals');

// גישה ישירה לקולקציית deals
Object.defineProperty(DealModel, 'collection', {
  get: function() {
    return mongoose.connection.collection('deals');
  },
  set: function() {
    console.error('⛔ ניסיון לשנות את הקולקציה נחסם!');
    return mongoose.connection.collection('deals');
  }
});

// במקום הפרוקסי שגרם לבעיה, ננסה פתרון פשוט יותר
// הוספת אירוע לאחר התחברות למסד הנתונים שיטפל בהפניה לקולקציה הנכונה
mongoose.connection.on('connected', () => {
  console.log('התחברות למונגו הושלמה - וידוא שימוש בקולקציית deals');
  
  // טיפול בשגיאות גישה לקולקציית investments
  const originalCollection = mongoose.connection.collection;
  if (originalCollection) {
    mongoose.connection.collection = function(name) {
      if (name === 'investments') {
        console.log('ניסיון גישה לקולקציית investments - מפנה לdeals');
        name = 'deals';
      }
      return originalCollection.call(this, name);
    };
  }
});

// קודם כל להדפיס את שם הקולקציה
console.log('✅ מודל Deal נוצר עם קולקציית:', DealModel.collection.name);

// ייצוא
module.exports = DealModel; 