const mongoose = require('mongoose');

// ---- טיפול דרסטי במודלים וקולקציות ----

// מחיקת כל המודלים הקודמים
try {
  // ניקוי מודלים קיימים למניעת שימוש לא נכון
  const models = mongoose.modelNames();
  models.forEach(model => {
    if (model === 'Deal' || model === 'deals') {
      mongoose.deleteModel(model);
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
  next();
});

// פעולות לפני כל פעולת מסמך
dealSchema.pre(/^find/, function() {
  // וידוא שימוש בקולקציה הנכונה
  if (this.model.collection.name !== 'deals') {
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
    return mongoose.connection.collection('deals');
  }
});

// ייצוא
module.exports = DealModel; 