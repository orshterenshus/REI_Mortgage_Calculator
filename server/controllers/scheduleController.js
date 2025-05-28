const Schedule = require('../models/Schedule');

/**
 * מחזיר לוח תשלומים מותאם לפי הפרמטרים שהתקבלו
 */
const getAdjustedSchedule = async (req, res) => {
  try {
    const { purpose = 'דיור', years, loanAmount, interest = 4.0 } = req.query;
    
    // ולידציה בסיסית
    if (!years || !loanAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'חסרים פרמטרים: יש לספק years ו-loanAmount' 
      });
    }

    // המרה למספרים
    const numYears = parseInt(years);
    const numLoanAmount = parseFloat(loanAmount);
    const numInterest = parseFloat(interest);

    // חיפוש לוח שפיצר מתאים
    const schedule = await Schedule.findMatchingSchedule(purpose, numYears, numInterest);
    
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: `לא נמצא לוח שפיצר מתאים עבור: מטרה=${purpose}, שנים=${numYears}, ריבית=${numInterest}%` 
      });
    }

    // התאמת הלוח לסכום ההלוואה המבוקש
    const adjustedPayments = schedule.adjustToLoanAmount(numLoanAmount);
    
    // חישוב ממוצעים
    const averages = schedule.calculateAverages(adjustedPayments);
    
    // החזרת התוצאה
    res.status(200).json({
      success: true,
      requestParams: {
        purpose,
        years: numYears,
        loanAmount: numLoanAmount,
        interest: numInterest
      },
      schedule: {
        baseSchedule: {
          _id: schedule._id,
          purpose: schedule.purpose,
          years: schedule.years,
          interest: schedule.interest,
          loanAmount: schedule.loanAmount
        },
        adjustedPayments,
        averages
      }
    });
  } catch (error) {
    console.error('שגיאה בקבלת לוח שפיצר:', error);
    res.status(500).json({ 
      success: false, 
      message: 'אירעה שגיאה בשרת בעת חיפוש לוח שפיצר' 
    });
  }
};

/**
 * מחזיר ממוצעי תשלומים לפי הפרמטרים שהתקבלו
 */
const getScheduleAverages = async (req, res) => {
  try {
    const { purpose = 'דיור', years, loanAmount, interest = 4.0 } = req.query;
    
    // ולידציה בסיסית
    if (!years || !loanAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'חסרים פרמטרים: יש לספק years ו-loanAmount' 
      });
    }

    // המרה למספרים
    const numYears = parseInt(years);
    const numLoanAmount = parseFloat(loanAmount);
    const numInterest = parseFloat(interest);

    // חיפוש לוח שפיצר מתאים
    const schedule = await Schedule.findMatchingSchedule(purpose, numYears, numInterest);
    
    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: `לא נמצא לוח שפיצר מתאים עבור: מטרה=${purpose}, שנים=${numYears}, ריבית=${numInterest}%` 
      });
    }

    // התאמת הלוח לסכום ההלוואה המבוקש
    const adjustedPayments = schedule.adjustToLoanAmount(numLoanAmount);
    
    // חישוב ממוצעים
    const averages = schedule.calculateAverages(adjustedPayments);
    
    // החזרת הממוצעים בלבד
    res.status(200).json({
      success: true,
      requestParams: {
        purpose,
        years: numYears,
        loanAmount: numLoanAmount,
        interest: numInterest
      },
      averages
    });
  } catch (error) {
    console.error('שגיאה בקבלת ממוצעי תשלום:', error);
    res.status(500).json({ 
      success: false, 
      message: 'אירעה שגיאה בשרת בעת חיפוש ממוצעי תשלום' 
    });
  }
};

/**
 * בדיקת הזמינות של לוחות שפיצר במערכת
 */
const checkSchedulesAvailability = async (req, res) => {
  try {
    console.log('Checking Spitzer schedules availability...');
    const count = await Schedule.countDocuments();
    console.log(`Found ${count} schedules in the database`);
    const years = await Schedule.distinct('years');
    const purposes = await Schedule.distinct('purpose');
    console.log('Available years:', years);
    res.status(200).json({
      success: true,
      schedulesCount: count,
      availableYears: years.sort((a, b) => a - b),
      availablePurposes: purposes
    });
  } catch (error) {
    console.error('Error checking Spitzer schedules availability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking Spitzer schedules availability',
      error: error.message
    });
  }
};

module.exports = {
  getAdjustedSchedule,
  getScheduleAverages,
  checkSchedulesAvailability
}; 