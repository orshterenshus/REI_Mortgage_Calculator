const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Deal = require('../models/Deal');

// שמירת חישוב חדש
router.post('/', async (req, res) => {
  try {
    const deal = new Deal(req.body);
    const savedDeal = await deal.save();
    res.status(201).json(savedDeal);
  } catch (error) {
    console.error('Error saving deal:', error);
    res.status(400).json({ message: error.message });
  }
});

// קבלת כל החישובים עם אפשרות להגביל את מספר התוצאות
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Deal.find().sort({ createdAt: -1 });
    
    // אם הועבר פרמטר limit, הגבל את מספר התוצאות
    if (limit && !isNaN(parseInt(limit))) {
      query = query.limit(parseInt(limit));
    }
    
    const deals = await query;
    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// קבלת חישוב ספציפי לפי ID
router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(200).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// עדכון חישוב קיים
router.put('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;
    const updateData = req.body;
    
    // מצא ועדכן את החישוב
    const updatedDeal = await Deal.findByIdAndUpdate(
      dealId,
      { $set: updateData },
      { new: true, runValidators: true }
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

// מחיקת חישוב
router.delete('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(200).json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// חישוב תוצאות השקעה בשרת ושמירת התוצאות ב-DB
router.post('/calculate', async (req, res) => {
  try {
    const inputData = req.body;
    
    // בדיקת תקינות הנתונים
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
    
    // המרת שדות הקלט למספרים
    const propertyValue = parseFloat(inputData.propertyValue);
    const equity = parseFloat(inputData.equity);
    const monthlyRent = parseFloat(inputData.monthlyRent);
    const years = parseInt(inputData.years);
    const mortgageYears = parseInt(inputData.years); // חשוב! משתמשים בנתון שהוזן ולא בקבוע
    const annualInterestRate = parseFloat(inputData.annualInterestRate || 4.0);
    const purchaseExpenseRate = parseFloat(inputData.purchaseExpenseRate || 0);
    const renovationCost = parseFloat(inputData.renovationCost || 0);
    const purchaseTax = parseFloat(inputData.purchaseTax || 0);
    const expenseRate = parseFloat(inputData.expenseRate || 0);
    const annualAppreciationRate = parseFloat(inputData.annualAppreciationRate || 0);
    const marketValue = parseFloat(inputData.marketValue || propertyValue);
    
    // ייבוא פונקציות החישוב
    // בהמשך יש להעתיק את הפונקציות הרלוונטיות מהקליינט לשרת
    // כרגע נשתמש בחישוב פשוט
    const calculateBasicResults = (inputData) => {
      // ערכי קלט
      const propertyValue = parseFloat(inputData.propertyValue);
      const equity = parseFloat(inputData.equity);
      const monthlyRent = parseFloat(inputData.monthlyRent);
      const years = parseInt(inputData.years);
      const mortgageYears = years; // חשוב! משתמשים בטווח השנים שהמשתמש הזין
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
      
      // יצירת תחזית שנתית פשוטה
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
          
          // לא לאפשר יתרה שלילית או לא הגיונית
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
        
        // הוספת רשומה לתחזית
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
      
      // החזרת תוצאות החישוב
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
    
    // לבינתיים, ניצור אובייקט דמה עם התוצאות
    const results = calculateBasicResults(inputData);
    
    // יצירת מסמך חדש ב-DB
    const dealData = {
      name: `חישוב ${new Date().toLocaleDateString('he-IL')}`,
      propertyValue,
      purchaseTaxRate: purchaseExpenseRate,
      lawyerFee: 0, // לא מוזן בממשק הנוכחי
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
    
    // שמירה ב-DB
    const deal = new Deal(dealData);
    const savedDeal = await deal.save();
    
    // החזרת התשובה לקליינט
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

module.exports = router; 