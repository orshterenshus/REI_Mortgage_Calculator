/**
 * ========================================
 * נתיבי API לניהול עסקאות (Deals Routes)
 * ========================================
 * 
 * קובץ זה מגדיר את כל נתיבי ה-API הקשורים לעסקאות:
 * - צפייה בעסקאות אישיות
 * - יצירת עסקה חדשה
 * - עדכון עסקה קיימת
 * - מחיקת עסקה
 * - ניהול תיקי לקוחות (למנהלים)
 * 
 * תלויות:
 * - express: יצירת נתיבי API
 * - mongoose: תקשורת עם MongoDB
 * - auth middleware: אימות משתמשים
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Deal = require('../models/Deal');
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * ========================================
 * נתיבים למשתמשים רגילים
 * ========================================
 */

/**
 * קבלת כל העסקאות של המשתמש המחובר
 * 
 * @route GET /api/deals/my-deals
 * @access Private - דורש אימות
 * @description מחזיר רשימת כל העסקאות של המשתמש הנוכחי
 * 
 * @returns {Object} תגובת JSON:
 * - success: true/false - האם הפעולה הצליחה
 * - deals: Array - מערך של עסקאות ממוינות לפי תאריך יצירה (החדשות ראשונות)
 * 
 * @example תגובה מוצלחת:
 * {
 *   "success": true,
 *   "deals": [
 *     {
 *       "_id": "...",
 *       "address": "רחוב הרצל 1, תל אביב",
 *       "propertyValue": 2000000,
 *       "monthlyRent": 6000,
 *       "createdAt": "2024-01-15T10:30:00Z"
 *     }
 *   ]
 * }
 */
router.get('/my-deals', auth, async (req, res) => {
  try {
    // חיפוש עסקאות לפי המייל של המשתמש המחובר
    const deals = await Deal.find({ email: req.user.email })
      .sort({ createdAt: -1 }) // מיון לפי תאריך יצירה - החדשות קודם
      .limit(50); // הגבלה ל-50 עסקאות אחרונות לביצועים טובים
    
    res.json({ success: true, deals });
  } catch (error) {
    console.error('Error fetching user deals:', error);
    res.status(500).json({ success: false, error: 'שגיאה בטעינת העסקאות' });
  }
});

/**
 * ========================================
 * נתיבים למנהלים בלבד
 * ========================================
 */

/**
 * קבלת עסקאות של לקוח ספציפי (למנהלים בלבד)
 * 
 * @route GET /api/deals/client/:email
 * @access Private/Admin - דורש אימות והרשאות מנהל
 * @param {string} email - כתובת המייל של הלקוח (בפרמטר URL)
 * 
 * @description מאפשר למנהל לצפות בכל העסקאות של לקוח מסוים
 * 
 * @returns {Object} תגובת JSON:
 * - success: true/false
 * - deals: Array - עסקאות הלקוח
 * 
 * @security בודק שהמשתמש הוא מנהל לפני מתן גישה לנתונים
 */
router.get('/client/:email', auth, async (req, res) => {
  try {
    // בדיקת הרשאות - רק מנהלים יכולים לראות עסקאות של אחרים
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'אין הרשאה' });
    }
    
    // פענוח המייל מה-URL (במקרה שיש תווים מיוחדים)
    const clientEmail = decodeURIComponent(req.params.email);
    
    // חיפוש כל העסקאות של הלקוח
    const deals = await Deal.find({ email: clientEmail })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, deals });
  } catch (error) {
    console.error('Error fetching client deals:', error);
    res.status(500).json({ success: false, error: 'שגיאה בטעינת עסקאות הלקוח' });
  }
});

/**
 * קבלת כל תיקי הלקוחות (למנהלים בלבד)
 * 
 * @route GET /api/deals/client-portfolios
 * @access Private/Admin - דורש אימות והרשאות מנהל
 * 
 * @description מחזיר רשימה מקובצת של כל הלקוחות והעסקאות שלהם
 * משתמש ב-MongoDB aggregation לקיבוץ יעיל של הנתונים
 * 
 * @returns {Object} תגובת JSON:
 * - success: true/false
 * - clients: Array - מערך של לקוחות עם פרטיהם ועסקאותיהם
 * 
 * @example תגובה:
 * {
 *   "success": true,
 *   "clients": [
 *     {
 *       "_id": "user@example.com",
 *       "fullName": "ישראל ישראלי",
 *       "dealCount": 5,
 *       "lastDealDate": "2024-01-15T10:30:00Z",
 *       "deals": [...]
 *     }
 *   ]
 * }
 */
router.get('/client-portfolios', auth, async (req, res) => {
  try {
    // בדיקת הרשאות מנהל
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'אין הרשאה' });
    }
    
    // שימוש ב-aggregation לקיבוץ עסקאות לפי משתמש
    const dealsGrouped = await Deal.aggregate([
      {
        // קיבוץ לפי כתובת מייל
        $group: {
          _id: '$email', // המייל הוא המזהה הייחודי
          dealCount: { $sum: 1 }, // ספירת עסקאות
          lastDealDate: { $max: '$createdAt' }, // תאריך העסקה האחרונה
          deals: { $push: '$$ROOT' } // כל העסקאות של המשתמש
        }
      }
    ]);
    
    // העשרת הנתונים עם פרטי המשתמש מטבלת Users
    const clientsWithUserInfo = await Promise.all(
      dealsGrouped.map(async (client) => {
        // חיפוש פרטי המשתמש לפי המייל
        const user = await User.findOne({ email: client._id });
        return {
          _id: client._id,
          fullName: user ? user.fullName : '', // שם מלא אם קיים
          dealCount: client.dealCount,
          lastDealDate: client.lastDealDate,
          deals: client.deals
        };
      })
    );
    
    // מיון לפי שם מלא (או מייל אם אין שם)
    clientsWithUserInfo.sort((a, b) => {
      const aName = (a.fullName || a._id).toLowerCase();
      const bName = (b.fullName || b._id).toLowerCase();
      return aName.localeCompare(bName);
    });
    
    res.json({ success: true, clients: clientsWithUserInfo });
  } catch (error) {
    console.error('Error fetching client portfolios:', error);
    res.status(500).json({ success: false, error: 'שגיאה בטעינת תיקי הלקוחות' });
  }
});

/**
 * ========================================
 * יצירה ועדכון עסקאות
 * ========================================
 */

/**
 * יצירת עסקה חדשה
 * 
 * @route POST /api/deals
 * @access Private - דורש אימות
 * 
 * @description שומר חישוב חדש של עסקת נדל"ן במסד הנתונים
 * 
 * @body {Object} נתוני העסקה:
 * - inputs: Object - כל הנתונים שהמשתמש הזין
 *   - address: string - כתובת הנכס (חובה)
 *   - propertyValue: number - מחיר הנכס
 *   - equity: number - הון עצמי
 *   - monthlyRent: number - שכירות חודשית
 *   - וכו'...
 * - results: Object - תוצאות החישובים
 *   - monthlyPayment: number - תשלום חודשי
 *   - propertyYield: number - תשואה על הנכס
 *   - וכו'...
 * - forecast: Array - תחזית ל-30 שנה
 * 
 * @returns {Object} תגובת JSON:
 * - success: true/false
 * - deal: Object - העסקה שנוצרה עם ה-ID שלה
 * - message: string - הודעת הצלחה
 * 
 * @validation
 * - בודק שיש inputs ו-results
 * - בודק שיש כתובת נכס
 * - בודק שהכתובת בפורמט הנכון (כתובת, עיר)
 */
router.post('/', auth, async (req, res) => {
  try {
    // קבלת פרטי המשתמש מה-middleware של האימות
    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : null;
    
    // בדיקת תקינות נתונים בסיסית
    if (!req.body.inputs || !req.body.results) {
      return res.status(400).json({ 
        success: false, 
        error: 'חסרים נתונים הכרחיים' 
      });
    }

    // בדיקת שדה כתובת - חובה
    if (!req.body.inputs.address || !req.body.inputs.address.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'חסרה כתובת נכס' 
      });
    }

    // בדיקת פורמט כתובת (צריך להכיל פסיק)
    const addressParts = req.body.inputs.address.split(',');
    if (addressParts.length < 2 || !addressParts[0].trim() || !addressParts[1].trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'יש להזין כתובת בפורמט: כתובת, עיר' 
      });
    }

    // פירוק הנתונים מהבקשה
    const { inputs, results, forecast } = req.body;
    
    // המרת נתוני הקליינט למבנה של מודל Deal
    const dealData = {
      userId,
      email: userEmail,
      address: inputs.address.trim(),
      name: inputs.address.trim(), // תאימות לאחור
      propertyValue: inputs.propertyValue || 0,
      purchaseTaxRate: inputs.purchaseExpenseRate || 0,
      lawyerFee: 0, // לא מוצג כרגע בממשק
      otherExpenses: inputs.renovationCost || 0,
      equity: inputs.equity || 0,
      annualInterestRate: inputs.annualInterestRate || 4.0,
      loanTerm: inputs.years || 0,
      monthlyRent: inputs.monthlyRent || 0,
      annualExpensesRate: inputs.expenseRate || 0,
      annualAppreciationRate: inputs.annualAppreciationRate || 0,
      results: results || {},
      forecast: forecast || [],
      createdAt: new Date()
    };
    
    // יצירת מסמך Deal חדש
    const deal = new Deal(dealData);
    
    // שמירה במסד הנתונים
    const savedDeal = await deal.save();
    
    // החזרת תגובת הצלחה
    res.json({ 
      success: true, 
      deal: savedDeal,
      message: 'העסקה נשמרה בהצלחה'
    });
  } catch (error) {
    console.error('Error saving deal - Full error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'שגיאה בשמירת העסקה' });
  }
});

/**
 * קבלת עסקה ספציפית לפי ID
 * 
 * @route GET /api/deals/:id
 * @access Private - דורש אימות
 * @param {string} id - מזהה העסקה (MongoDB ObjectId)
 * 
 * @description מחזיר את כל פרטי העסקה כולל תוצאות ותחזית
 * 
 * @security בודק שהמשתמש הוא בעל העסקה או מנהל
 * 
 * @returns {Object} העסקה המלאה או הודעת שגיאה
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // חיפוש העסקה לפי ID
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    // בדיקת הרשאות - רק בעל העסקה או מנהל יכולים לצפות
    if (req.user.role !== 'admin' && deal.email !== req.user.email) {
      return res.status(403).json({ success: false, error: 'אין הרשאה לצפות בעסקה זו' });
    }
    
    res.status(200).json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ success: false, error: 'שגיאה בטעינת העסקה' });
  }
});

/**
 * עדכון עסקה קיימת
 * 
 * @route PUT /api/deals/:id
 * @access Private - דורש אימות
 * @param {string} id - מזהה העסקה
 * @body {Object} updateData - הנתונים לעדכון
 * 
 * @description מעדכן עסקה קיימת עם נתונים חדשים
 * 
 * @returns {Object} העסקה המעודכנת
 */
router.put('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;
    const updateData = req.body;
    
    // חיפוש ועדכון העסקה
    const updatedDeal = await Deal.findByIdAndUpdate(
      dealId,
      { $set: updateData }, // עדכון רק השדות שנשלחו
      { new: true, runValidators: true } // החזרת המסמך המעודכן + הרצת ולידציות
    );
    
    if (!updatedDeal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    console.log(`Deal ${dealId} updated successfully`);
    res.status(200).json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * מחיקת עסקה
 * 
 * @route DELETE /api/deals/:id
 * @access Private - דורש אימות
 * @param {string} id - מזהה העסקה למחיקה
 * 
 * @description מוחק עסקה לצמיתות מהמסד נתונים
 * 
 * @returns {Object} הודעת אישור על המחיקה
 */
router.delete('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    
    res.status(200).json({ success: true, message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * ========================================
 * חישוב בצד השרת (אופציונלי)
 * ========================================
 */

/**
 * חישוב תוצאות השקעה בצד השרת
 * 
 * @route POST /api/deals/calculate
 * @access Public (כרגע)
 * 
 * @description מבצע את כל החישובים בצד השרת ושומר את התוצאות
 * נועד לעתיד כאשר נרצה להעביר את הלוגיקה מהקליינט לשרת
 * 
 * @body {Object} inputData - כל נתוני הקלט לחישוב
 * 
 * @returns {Object} תוצאות החישוב:
 * - success: true/false
 * - dealId: מזהה העסקה שנוצרה
 * - results: תוצאות החישובים
 * - forecast: תחזית 30 שנה
 * 
 * @note כרגע זו גרסה בסיסית - החישובים המלאים נעשים בקליינט
 */
router.post('/calculate', async (req, res) => {
  try {
    const inputData = req.body;
    
    // בדיקת תקינות נתוני קלט
    if (!inputData || 
        !inputData.propertyValue || 
        !inputData.equity || 
        !inputData.monthlyRent ||
        !inputData.years) {
      return res.status(400).json({ 
        success: false, 
        message: 'חסרים נתונים הכרחיים לחישוב' 
      });
    }
    
    // המרת נתונים למספרים
    const propertyValue = parseFloat(inputData.propertyValue);
    const equity = parseFloat(inputData.equity);
    const monthlyRent = parseFloat(inputData.monthlyRent);
    const years = parseInt(inputData.years);
    const mortgageYears = years; // משתמשים באותו ערך
    const annualInterestRate = parseFloat(inputData.annualInterestRate || 4.0);
    const purchaseExpenseRate = parseFloat(inputData.purchaseExpenseRate || 0);
    const renovationCost = parseFloat(inputData.renovationCost || 0);
    const purchaseTax = parseFloat(inputData.purchaseTax || 0);
    const expenseRate = parseFloat(inputData.expenseRate || 0);
    const annualAppreciationRate = parseFloat(inputData.annualAppreciationRate || 0);
    const marketValue = parseFloat(inputData.marketValue || propertyValue);
    
    /**
     * פונקציה פנימית לחישוב בסיסי
     * בעתיד תוחלף בפונקציות החישוב המלאות
     */
    const calculateBasicResults = (inputData) => {
      // פרמטרים לחישוב
      const propertyValue = parseFloat(inputData.propertyValue);
      const equity = parseFloat(inputData.equity);
      const monthlyRent = parseFloat(inputData.monthlyRent);
      const years = parseInt(inputData.years);
      const mortgageYears = years;
      const annualInterestRate = parseFloat(inputData.annualInterestRate || 4.0);
      const purchaseExpenseRate = parseFloat(inputData.purchaseExpenseRate || 0);
      const renovationCost = parseFloat(inputData.renovationCost || 0);
      const purchaseTax = parseFloat(inputData.purchaseTax || 0);
      const expenseRate = parseFloat(inputData.expenseRate || 0);
      const annualAppreciationRate = parseFloat(inputData.annualAppreciationRate || 0);
      
      // חישובים בסיסיים
      const purchaseExpenses = (propertyValue * purchaseExpenseRate) / 100;
      const mortgageAmount = propertyValue - equity;
      const totalInvestment = equity + purchaseExpenses + renovationCost + purchaseTax;
      
      // חישוב תשלום חודשי - נוסחת שפיצר בסיסית
      const monthlyRate = annualInterestRate / 100 / 12;
      const totalMonths = mortgageYears * 12;
      const monthlyPayment = mortgageAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) /
                            (Math.pow(1 + monthlyRate, totalMonths) - 1);
      
      // חישוב הכנסה והוצאות
      const annualIncome = monthlyRent * 12;
      const annualNetIncome = annualIncome - (annualIncome * expenseRate / 100);
      const annualPayment = monthlyPayment * 12;
      const annualCashflow = annualNetIncome - annualPayment;
      const monthlyCashflow = annualCashflow / 12;
      
      // חישוב תשואות
      const propertyYield = (annualNetIncome / propertyValue) * 100;
      const equityYield = ((monthlyCashflow) / (totalInvestment / 12)) * 100;
      
      // יצירת תחזית שנתית בסיסית
      const forecast = [];
      let currentPropertyValue = propertyValue;
      let accumulatedCashflow = 0;
      
      for (let year = 1; year <= 30; year++) {
        // חישוב יתרת הלוואה
        let remainingLoan = null;
        if (year < mortgageYears) {
          const monthsPassed = year * 12;
          remainingLoan = mortgageAmount * Math.pow(1 + monthlyRate, monthsPassed) - 
                         (monthlyPayment * (Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate);
          
          if (remainingLoan <= 0 || isNaN(remainingLoan)) {
            remainingLoan = null;
          } else {
            remainingLoan = Math.round(remainingLoan);
          }
        }
        
        // עדכון שווי הנכס
        if (year > 1) {
          currentPropertyValue = currentPropertyValue * (1 + (annualAppreciationRate / 100));
        }
        
        // חישוב תזרים מצטבר
        const yearlyCashflow = (year >= mortgageYears) ? annualNetIncome : annualCashflow;
        accumulatedCashflow += yearlyCashflow;
        
        // חישוב הון עצמי
        const equity = currentPropertyValue - (remainingLoan || 0);
        
        // חישוב תשואה הונית
        const equityPercentage = ((equity / totalInvestment) * 100) - 100;
        
        // הוספת שנה לתחזית
        forecast.push({
          year,
          propertyValue: Math.round(currentPropertyValue),
          marketValue: Math.round(currentPropertyValue),
          remainingLoan,
          equity: Math.round(equity),
          accumulatedCashflow: Math.round(accumulatedCashflow),
          annualNetIncome: Math.round(annualNetIncome),
          yearlyCashflow: Math.round(yearlyCashflow),
          propertyYield: parseFloat(propertyYield.toFixed(2)),
          equityYield: parseFloat(equityYield.toFixed(2)),
          equityPercentage: parseFloat(equityPercentage.toFixed(2)),
          totalProfitPercentage: parseFloat(((equity - totalInvestment + accumulatedCashflow) / totalInvestment * 100).toFixed(2))
        });
      }
      
      // החזרת תוצאות
      return {
        results: {
          purchaseExpenses: Math.round(purchaseExpenses),
          mortgageAmount: Math.round(mortgageAmount),
          monthlyPayment: Math.round(monthlyPayment),
          annualPayment: Math.round(annualPayment),
          annualIncome: Math.round(annualIncome),
          annualNetIncome: Math.round(annualNetIncome),
          annualCashflow: Math.round(annualCashflow),
          monthlyCashflow: Math.round(monthlyCashflow),
          totalInvestment: Math.round(totalInvestment),
          propertyYield: parseFloat(propertyYield.toFixed(2)),
          equityYield: parseFloat(equityYield.toFixed(2)),
          marketValue: Math.round(propertyValue),
          calculatedByServer: true
        },
        forecast
      };
    };
    
    // ביצוע החישוב
    const results = calculateBasicResults(inputData);
    
    // יצירת נתוני העסקה לשמירה
    const dealData = {
      address: inputData.address || `נכס ${new Date().toLocaleDateString('he-IL')}`,
      name: inputData.address || `חישוב ${new Date().toLocaleDateString('he-IL')}`,
      propertyValue,
      purchaseTaxRate: purchaseExpenseRate,
      lawyerFee: 0,
      otherExpenses: renovationCost,
      equity,
      annualInterestRate,
      loanTerm: mortgageYears,
      monthlyRent,
      annualExpensesRate: expenseRate,
      annualAppreciationRate,
      results: results.results,
      forecast: results.forecast
    };
    
    // שמירה במסד נתונים
    const deal = new Deal(dealData);
    const savedDeal = await deal.save();
    
    // החזרת התוצאות
    res.status(200).json({
      success: true,
      message: 'החישוב בוצע בהצלחה ונשמר במסד הנתונים',
      dealId: savedDeal._id,
      results: results.results,
      forecast: results.forecast,
      inputData: {
        propertyValue,
        equity,
        monthlyRent,
        years,
        mortgageYears,
        annualInterestRate,
        purchaseExpenseRate,
        renovationCost,
        purchaseTax,
        expenseRate,
        annualAppreciationRate,
        marketValue
      }
    });
    
  } catch (error) {
    console.error('שגיאה בחישוב:', error);
    res.status(500).json({ 
      success: false, 
      message: 'אירעה שגיאה בשרת בעת ביצוע החישוב',
      error: error.message 
    });
  }
});

/**
 * ========================================
 * ייצוא הנתיבים
 * ========================================
 */

module.exports = router; 