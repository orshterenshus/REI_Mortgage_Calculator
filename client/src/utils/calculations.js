import { calculateMonthlyPaymentFromSchedule, getFullPaymentSchedule } from './mortgageCalculations';
import api from './api';

// Calculate purchase expenses - חישוב הוצאות רכישה
export const calculatePurchaseExpenses = (propertyValue, purchaseExpenseRate) => {
  if (!propertyValue || !purchaseExpenseRate) return 0;
  return (propertyValue * purchaseExpenseRate) / 100;
};

// Calculate mortgage amount - חישוב סכום המשכנתא
export const calculateMortgageAmount = (propertyValue, equity) => {
  if (!propertyValue || !equity) return 0;
  return propertyValue - equity;
};

// Alias for the mortgage calculation - חישוב תשלום חודשי
export const calculateMonthlyPayment = async (loanAmount, annualInterestRate, years) => {
  if (!loanAmount || !years) return 0;

  try {
    // נסה קודם כל להביא את totalPayment מה-DB (shpizer)
    console.log(`🔄 מנסה לקבל totalPayment מלוח shpizer עבור ${years} שנים`);
    const response = await api.get('/shpizer', {
      params: {
        years,
        interest: annualInterestRate,
        purpose: 'דיור'
      }
    });
    if (response.data && response.data.success && response.data.schedule) {
      const totalPayment = response.data.schedule.totalPayment || (response.data.schedule.monthlyPayments && response.data.schedule.monthlyPayments[0]?.totalPayment);
      if (totalPayment) {
        const multiplier = loanAmount / 100000;
        const payment = Math.round(totalPayment * multiplier);
        console.log(`✅ תשלום חודשי מחושב מה-DB: ${payment}₪ (${totalPayment} × ${multiplier})`);
        return payment;
      }
    }
    // fallback if no totalPayment found
    console.log('❌ לא נמצא totalPayment ב-db, עובר לחישוב רגיל');
  } catch (error) {
    console.error('שגיאה בקבלת totalPayment מה-DB:', error);
  }

  // גיבוי - במקרה של שגיאה נחזור לערכים הקבועים
  const PAYMENT_RATES = {
    10: 1012, // 10 years: 1012 ש"ח
    15: 750,  // 15 years: 750 ש"ח
    20: 627,  // 20 years: 627 ש"ח
    25: 562,  // 25 years: 562 ש"ח
    30: 525   // 30 years: 525 ש"ח
  };

  // קבלת התקופה הקרובה ביותר
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  // קבלת הערך לתקופה
  const rate = PAYMENT_RATES[termYears];

  // חישוב תשלום חודשי
  const multiplier = loanAmount / 100000;
  const payment = Math.round(rate * multiplier);

  console.log(`משתמש בחישוב גיבוי לתשלום חודשי: ${payment}₪ (${rate} × ${multiplier})`);
  return payment;
};

// Calculate annual mortgage payment - חישוב תשלום משכנתא שנתי
export const calculateAnnualPayment = (monthlyPayment) => {
  if (!monthlyPayment) return 0;
  return monthlyPayment * 12;
};

// Calculate annual income - חישוב הכנסה שנתית
export const calculateAnnualIncome = (monthlyRent) => {
  if (!monthlyRent) return 0;
  return monthlyRent * 12;
};

// Calculate annual net income - חישוב הכנסה שנתית נטו
export const calculateAnnualNetIncome = (annualIncome, expenseRate) => {
  if (!annualIncome) return 0;
  // הנוסחה החדשה: הכנסה שנתית נטו = הכנסה שנתית - (הכנסה שנתית*אחוז הוצאה שנתית)
  return annualIncome - (annualIncome * (expenseRate || 0) / 100);
};

// Calculate annual cashflow - חישוב תזרים מזומנים שנתי
export const calculateAnnualCashflow = (annualNetIncome, annualPayment) => {
  return annualNetIncome - annualPayment;
};

// Calculate property yield - חישוב תשואת נכס
export const calculatePropertyYield = (marketValue, annualNetIncome) => {
  if (!marketValue || !annualNetIncome) return 0;
  return (annualNetIncome / marketValue) * 100;
};

// Calculate total investment - חישוב סך השקעה
export const calculateTotalInvestment = (equity, purchaseExpenses, renovationCost, purchaseTax) => {
  return (equity || 0) + (purchaseExpenses || 0) + (renovationCost || 0) + (purchaseTax || 0);
};

// Calculate equity yield - חישוב תשואה על הון (ברמה החודשית)
export const calculateEquityYield = (monthlyPrincipalRepayment, monthlyCashflow, totalInvestment) => {
  if (!totalInvestment) return 0;
  
  // החישוב המעודכן: (החזר קרן חודשי + תזרים מזומנים חודשי) / (סך השקעה / 12) * 100
  return ((monthlyPrincipalRepayment + monthlyCashflow) / (totalInvestment / 12)) * 100;
};

// Calculate equity percentage - חישוב תשואה הונית (אחוז גידול בהון העצמי)
export const calculateEquityPercentage = (equity, totalInvestment) => {
  if (!totalInvestment || !equity) return 0;
  // מחשב את אחוז התשואה ומוריד 100% מהתוצאה
  return ((equity / totalInvestment) * 100) - 100;
};

// נתקן את החישובים של יתרת ההלוואה - בצורה דינמית וללא טבלאות קבועות
export const calculateLoanScheduleForYears = (mortgageAmount, mortgageYears, currentYear, annualInterestRate = 4.0) => {
  // כפיית ערך null כשמגיעים לשנת סיום המשכנתא
  console.log(`[חישוב יתרה]: שנה=${currentYear}, תקופת משכנתא=${mortgageYears}`);
  
  // אם השנה שווה או גדולה משנות המשכנתא - בהכרח null
  if (currentYear >= mortgageYears) {
    console.log(`[אכיפת כלל]: שנה ${currentYear} >= ${mortgageYears} - מחזיר בהכרח null!`);
    return null;
  }
  
  // חישוב דינמי המבוסס על לוח שפיצר מדויק
  // בשנים הראשונות, רוב התשלום החודשי הולך לריבית והקרן יורדת לאט
  // בהמשך, התשלומים הולכים יותר ויותר לקרן והיא יורדת מהר יותר
  
  // חישוב יתרת ההלוואה על פי נוסחה מדויקת של שפיצר
  
  const monthsPassed = currentYear * 12;
  const monthlyRate = annualInterestRate / 100 / 12; // המרה לריבית חודשית
  const totalMonths = mortgageYears * 12;
  
  // חישוב התשלום החודשי לפי נוסחת שפיצר
  const monthlyPayment = mortgageAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                         (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  // חישוב יתרת ההלוואה אחרי currentYear שנים
  const remainingBalance = mortgageAmount * Math.pow(1 + monthlyRate, monthsPassed) - 
                         (monthlyPayment * (Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate);
  
  // בדיקה אם היתרה לא תקינה
  if (remainingBalance <= 0 || isNaN(remainingBalance)) {
    console.log(`החישוב נתן יתרה לא תקינה (${remainingBalance}), מחזיר null`);
    return null;
  }
  
  const roundedBalance = Math.round(remainingBalance);
  console.log(`יתרת הלוואה מחושבת בשנה ${currentYear}: ${roundedBalance}₪`);
  return roundedBalance;
};

// Generate yearly forecast data - יצירת תחזית לפי שנים
export const generateYearlyForecast = async (
  years,
  propertyValue,
  equity,
  renovationCost,
  purchaseExpenseRate,
  purchaseTax,
  mortgageYears,
  annualInterestRate,
  monthlyRent,
  expenseRate,
  annualAppreciationRate,
  marketValue
) => {
  console.log(`יוצר תחזית שנתית לתקופה של ${years} שנים, משכנתא ל-${mortgageYears} שנים`);

  const forecast = [];

  // החישוב יהיה עד 31 שנה (כולל שנה "31")
  const forecastYears = 31;

  // המרת ערכים לא מספריים לברירת מחדל כדי למנוע NaN
  propertyValue = propertyValue || 0;
  equity = equity || 0;
  renovationCost = renovationCost || 0;
  purchaseExpenseRate = purchaseExpenseRate || 0;
  purchaseTax = purchaseTax || 0;
  mortgageYears = mortgageYears || 30;
  annualInterestRate = annualInterestRate || 4;
  monthlyRent = monthlyRent || 0;
  expenseRate = expenseRate || 0;
  annualAppreciationRate = annualAppreciationRate || 0;
  marketValue = marketValue || propertyValue;

  // Calculate mortgage amount - חישוב סכום המשכנתא
  const mortgageAmount = calculateMortgageAmount(propertyValue, equity);

  // Calculate purchase expenses - חישוב הוצאות רכישה
  const purchaseExpenses = calculatePurchaseExpenses(propertyValue, purchaseExpenseRate);

  // Calculate total investment - חישוב סך ההשקעה
  const totalInvestment = calculateTotalInvestment(equity, purchaseExpenses, renovationCost, purchaseTax);

  try {
    console.log(`מנסה לקבל לוח תשלומים מלא ממסד הנתונים`);

    // ניסיון לקבל לוח תשלומים מלא ממסד הנתונים אם אפשר
    const fullSchedule = await getFullPaymentSchedule(mortgageAmount, mortgageYears, annualInterestRate);

    console.log(`התקבל לוח תשלומים מלא מהשרת`);
    console.log(`יש ${fullSchedule.monthlyPayments?.length || 0} חודשים בלוח השפיצר`);

    // התשלום החודשי והחזרי הקרן והריבית יילקחו מממוצעי הלוח
    const { monthlyPayment, monthlyPrincipalRepayment, monthlyInterestPayment } = fullSchedule.averages;

    // Calculate annual income - חישוב הכנסה שנתית
    const annualIncome = calculateAnnualIncome(monthlyRent);

    // Calculate annual net income - חישוב הכנסה שנתית נטו
    const annualNetIncome = calculateAnnualNetIncome(annualIncome, expenseRate);

    // Calculate annual payment - חישוב תשלום שנתי
    const annualPayment = calculateAnnualPayment(monthlyPayment);

    // Calculate annual cashflow - חישוב תזרים מזומנים שנתי
    const annualCashflow = calculateAnnualCashflow(annualNetIncome, annualPayment);

    let accumulatedCashflow = 0;
    // שינוי: ערך הנכס בשנה הראשונה כבר כולל את ההתייקרות
    let currentPropertyValue = marketValue * (1 + (annualAppreciationRate / 100));

    // ייצור התחזית ל-31 שנה
    for (let year = 1; year <= forecastYears; year++) {
      try {
        let currentRemainingLoan = null;
        if (year < mortgageYears) {
          currentRemainingLoan = calculateLoanScheduleForYears(mortgageAmount, mortgageYears, year, annualInterestRate);
        } else {
          currentRemainingLoan = null;
        }

        // חישוב עליית ערך השוק לפי שיעור ההתייקרות השנתי
        if (year > 1) {
          currentPropertyValue = currentPropertyValue * (1 + (annualAppreciationRate / 100));
        }

        const yearlyCashflow = year >= mortgageYears ? annualNetIncome : annualCashflow;
        accumulatedCashflow += yearlyCashflow;
        const currentEquity = currentPropertyValue - (currentRemainingLoan !== null ? currentRemainingLoan : 0);
        const propertyYield = calculatePropertyYield(currentPropertyValue, annualNetIncome);
        const monthlyCashflow = yearlyCashflow / 12;
        const effectiveMonthlyPrincipal = year >= mortgageYears ? 0 : monthlyPrincipalRepayment;
        const equityYield = calculateEquityYield(effectiveMonthlyPrincipal, monthlyCashflow, totalInvestment);
        const equityPercentage = calculateEquityPercentage(currentEquity, totalInvestment);
        const totalProfit = (currentEquity - equity) + accumulatedCashflow;
        const totalProfitPercentage = (totalProfit / totalInvestment) * 100;

        const forecastEntry = {
          year,
          propertyValue: Math.round(currentPropertyValue),
          marketValue: Math.round(currentPropertyValue),
          remainingLoan: currentRemainingLoan,
          equity: Math.round(currentEquity),
          accumulatedCashflow: Math.round(accumulatedCashflow),
          totalProfitPercentage: parseFloat((totalProfit / totalInvestment * 100).toFixed(2)),
          annualNetIncome: Math.round(annualNetIncome),
          yearlyCashflow: Math.round(yearlyCashflow),
          propertyYield: parseFloat(propertyYield.toFixed(2)),
          equityYield: parseFloat(equityYield.toFixed(2)),
          equityPercentage: parseFloat(equityPercentage.toFixed(2))
        };
        forecast.push(forecastEntry);
      } catch (error) {
        console.error(`שגיאה בחישוב שנה ${year}:`, error);
        forecast.push({
          year,
          propertyValue: Math.round(currentPropertyValue),
          marketValue: Math.round(currentPropertyValue),
          remainingLoan: null,
          equity: Math.round(currentPropertyValue),
          accumulatedCashflow: Math.round(accumulatedCashflow),
          totalProfitPercentage: 0,
          annualNetIncome: Math.round(annualNetIncome),
          yearlyCashflow: Math.round(annualNetIncome),
          propertyYield: 0,
          equityYield: 0,
          equityPercentage: 0
        });
      }
    }
    // לאחר יצירת התחזית ל-31 שנה, מחק את השנה האחרונה (שנה 31)
    if (forecast.length > 30) {
      forecast.pop();
    }
    return forecast;
  } catch (error) {
    console.error('שגיאה בקבלת לוח תשלומים מהשרת:', error);
    console.log('משתמש בחישוב מקומי (גיבוי)');
    
    // החישוב יהיה תמיד עד 30 שנה, ללא תלות בפרמטר years
    const forecastYears = 30;
    
    // למקרה של שגיאה, נשתמש בחישוב מקומי כגיבוי
    
    // Calculate monthly payment - חישוב תשלום חודשי
    const monthlyPayment = await calculateMonthlyPayment(
      mortgageAmount,
      annualInterestRate,
      mortgageYears
    );
    
    // Calculate monthly principal repayment - חישוב החזר קרן חודשי
    const monthlyPrincipalRepayment = await calculateMonthlyPrincipalPayment(mortgageAmount, mortgageYears);
    
    // Calculate annual income - חישוב הכנסה שנתית
    const annualIncome = calculateAnnualIncome(monthlyRent);
    
    // Calculate annual net income - חישוב הכנסה שנתית נטו
    const annualNetIncome = calculateAnnualNetIncome(annualIncome, expenseRate);
    
    // Calculate annual payment - חישוב תשלום שנתי
    const annualPayment = calculateAnnualPayment(monthlyPayment);
    
    // Calculate annual cashflow - חישוב תזרים מזומנים שנתי
    const annualCashflow = calculateAnnualCashflow(annualNetIncome, annualPayment);
    
    let accumulatedCashflow = 0;
    let currentPropertyValue = marketValue; // משתמשים בערך השוק ההתחלתי
    
    // ייצור התחזית ל-30 שנה
    for (let year = 1; year <= forecastYears; year++) {
      try {
        // אכיפה מוחלטת: בשנה שמגיעה לסוף תקופת המשכנתא או אחריה - קו מפריד!
        let currentRemainingLoan = null;
        
        // בודקים בפשטות אם השנה היא לפני סוף המשכנתא
        if (year < mortgageYears) {
          console.log(`שנה ${year} בתוך תקופת המשכנתא (${mortgageYears}), מחשב יתרה`);
          // רק במקרה כזה מחשבים יתרת הלוואה
          currentRemainingLoan = calculateLoanScheduleForYears(mortgageAmount, mortgageYears, year, annualInterestRate);
        } else {
          // אחרת - בכל מקרה מציגים קו מפריד!
          console.log(`שנה ${year} בסוף או אחרי המשכנתא (${mortgageYears}) - בהכרח קו מפריד!`);
          currentRemainingLoan = null; // בהכרח null בשביל להציג קו מפריד
        }
        
        // חישוב עליית ערך השוק לפי שיעור ההתייקרות השנתי
        currentPropertyValue = year === 1 ? marketValue : currentPropertyValue * (1 + (annualAppreciationRate / 100));
        
        // חישוב תזרים מזומנים לשנה הנוכחית
        // אם השנה גדולה או שווה למספר שנות ההלוואה, אין יותר תשלומי משכנתא
        const yearlyCashflow = year >= mortgageYears ? annualNetIncome : annualCashflow;
        
        // חישוב תזרים מזומנים מצטבר
    accumulatedCashflow += yearlyCashflow;
    
        // חישוב הון עצמי (שווי נכס פחות יתרת הלוואה)
        const currentEquity = currentPropertyValue - (currentRemainingLoan !== null ? currentRemainingLoan : 0);
        
        // חישוב תשואת נכס (הכנסה נטו חלקי שווי נכס)
        const propertyYield = calculatePropertyYield(currentPropertyValue, annualNetIncome);
    
        // חישוב תזרים מזומנים חודשי
        const monthlyCashflow = yearlyCashflow / 12;
        
        // חישוב תשואה על הון (החזר קרן חודשי + תזרים מזומנים חודשי) / (סך השקעה / 12)
        // אם השנה גדולה או שווה למספר שנות ההלוואה, החזר הקרן החודשי הוא 0
        const effectiveMonthlyPrincipal = year >= mortgageYears ? 0 : monthlyPrincipalRepayment;
        const equityYield = calculateEquityYield(effectiveMonthlyPrincipal, monthlyCashflow, totalInvestment);
    
        // חישוב תשואה הונית (הון עצמי חלקי סך השקעה, פחות 100%)
    const equityPercentage = calculateEquityPercentage(currentEquity, totalInvestment);
    
        // חישוב אחוז רווח כולל
        const totalProfit = (currentEquity - equity) + accumulatedCashflow; // הון עצמי נוכחי פחות הון עצמי התחלתי, ועוד תזרים מצטבר
    const totalProfitPercentage = (totalProfit / totalInvestment) * 100;
    
        // יצירת רשומה לשנה הנוכחית
        const forecastEntry = {
          year,
          propertyValue: Math.round(currentPropertyValue),
          marketValue: Math.round(currentPropertyValue),
          remainingLoan: currentRemainingLoan,
          equity: Math.round(currentEquity),
          accumulatedCashflow: Math.round(accumulatedCashflow),
          totalProfitPercentage: parseFloat((totalProfit / totalInvestment * 100).toFixed(2)),
          annualNetIncome: Math.round(annualNetIncome),
          yearlyCashflow: Math.round(yearlyCashflow),
          propertyYield: parseFloat(propertyYield.toFixed(2)),
          equityYield: parseFloat(equityYield.toFixed(2)),
          equityPercentage: parseFloat(equityPercentage.toFixed(2))
        };
        
        // הוספת הרשומה לתחזית
        forecast.push(forecastEntry);
      } catch (error) {
        console.error(`שגיאה בחישוב שנה ${year}:`, error);
        // במקרה של שגיאה, נוסיף שורה עם ערכים בסיסיים
    forecast.push({
      year,
          propertyValue: Math.round(currentPropertyValue),
          marketValue: Math.round(currentPropertyValue),
          remainingLoan: null,
          equity: Math.round(currentPropertyValue),
          accumulatedCashflow: Math.round(accumulatedCashflow),
          totalProfitPercentage: 0,
          annualNetIncome: Math.round(annualNetIncome),
          yearlyCashflow: Math.round(annualNetIncome),
          propertyYield: 0,
          equityYield: 0,
          equityPercentage: 0
    });
      }
  }
  
  // לאחר יצירת התחזית ל-30 שנה, מחק את השנה האחרונה (שנה 30)
  if (forecast.length > 30) {
    forecast.pop();
  }
  return forecast;
  }
};

/**
 * Convert years to months - המרת שנים לחודשים
 * @param {number} years - Number of years
 * @returns {number} - Number of months
 */
export const yearsToMonths = (years) => {
  return years * 12;
};

// Calculate loan amount - חישוב סכום ההלוואה
export const calculateLoanAmount = (propertyValue, purchaseTax, renovationCost, purchaseExpenses, equity) => {
  return propertyValue + purchaseTax + renovationCost + purchaseExpenses - equity;
};

// Calculate monthly mortgage payment using the Spitzer schedules - חישוב תשלום משכנתא חודשי לפי לוח שפיצר
export const calculateMonthlyMortgagePayment = async (loanAmount, annualInterestRate, mortgageYears) => {
  const result = await calculateMonthlyPaymentFromSchedule(loanAmount, mortgageYears, annualInterestRate);
  return result.monthlyPayment;
};

// Calculate yearly rent - חישוב שכר דירה שנתי
export const calculateYearlyRent = (monthlyRent) => {
  return monthlyRent * 12;
};

// Calculate yearly expenses - חישוב הוצאות שנתיות
export const calculateYearlyExpenses = (yearlyRent, expenseRate) => {
  return yearlyRent * (expenseRate / 100);
};

// Calculate yearly cash flow - חישוב תזרים מזומנים שנתי
export const calculateYearlyCashFlow = (yearlyRent, yearlyMortgagePayment, yearlyExpenses) => {
  return yearlyRent - yearlyMortgagePayment - yearlyExpenses;
};

// Calculate ROI (Return on Investment) - חישוב תשואה על השקעה
export const calculateROI = (yearlyCashFlow, totalInvestment) => {
  return (yearlyCashFlow / totalInvestment) * 100;
};

// Calculate yearly capital gain - חישוב רווח הון שנתי
export const calculateYearlyCapitalGain = (marketValue, annualAppreciationRate) => {
  return marketValue * (annualAppreciationRate / 100);
};

// Calculate total yearly return - חישוב תשואה שנתית כוללת
export const calculateTotalYearlyReturn = (yearlyCashFlow, yearlyCapitalGain) => {
  return yearlyCashFlow + yearlyCapitalGain;
};

// Calculate total yearly ROI - חישוב תשואה שנתית כוללת על ההשקעה
export const calculateTotalYearlyROI = (totalYearlyReturn, totalInvestment) => {
  return (totalYearlyReturn / totalInvestment) * 100;
};

// Generate forecast data - יצירת תחזית כללית
export const generateForecast = async (inputs) => {
  const {
    propertyValue,
    purchaseExpenseRate,
    equity,
    renovationCost,
    purchaseTax,
    years,
    marketValue,
    annualAppreciationRate,
    monthlyRent,
    expenseRate,
    mortgageYears,
    annualInterestRate
  } = inputs;

  // Calculate purchase expenses - חישוב הוצאות רכישה
  const purchaseExpenses = calculatePurchaseExpenses(propertyValue, purchaseExpenseRate);
  
  // Calculate total investment - חישוב סך ההשקעה
  const totalInvestment = calculateTotalInvestment(equity, purchaseExpenses, renovationCost, purchaseTax);
  
  // Calculate initial monthly payment - חישוב תשלום חודשי התחלתי
  const loanAmount = calculateLoanAmount(propertyValue, purchaseTax, renovationCost, purchaseExpenses, equity);
  const monthlyPayment = await calculateMonthlyMortgagePayment(loanAmount, annualInterestRate, mortgageYears);
  
  // Calculate yearly values for the first year - חישוב ערכים שנתיים לשנה הראשונה
  const yearlyRent = calculateYearlyRent(monthlyRent);
  const yearlyMortgagePayment = monthlyPayment * 12;
  const yearlyExpenses = calculateYearlyExpenses(yearlyRent, expenseRate);
  const yearlyCashFlow = calculateYearlyCashFlow(yearlyRent, yearlyMortgagePayment, yearlyExpenses);
  const cashFlowROI = calculateROI(yearlyCashFlow, totalInvestment);
  
  // Initialize forecast with first year - אתחול התחזית עם השנה הראשונה
  const forecast = [
    {
      year: 1,
      propertyValue: marketValue,
      monthlyRent,
      yearlyRent,
      yearlyExpenses,
      monthlyPayment,
      yearlyMortgagePayment,
      yearlyCashFlow,
      cashFlowROI,
      yearlyCapitalGain: calculateYearlyCapitalGain(marketValue, annualAppreciationRate),
      totalYearlyReturn: 0,
      totalYearlyROI: 0
    }
  ];
  
  // Calculate the first year's total yearly return and ROI - חישוב תשואה כוללת לשנה הראשונה
  forecast[0].totalYearlyReturn = calculateTotalYearlyReturn(
    forecast[0].yearlyCashFlow,
    forecast[0].yearlyCapitalGain
  );
  
  forecast[0].totalYearlyROI = calculateTotalYearlyROI(
    forecast[0].totalYearlyReturn,
    totalInvestment
  );
  
  // Generate forecast for remaining years - יצירת תחזית לשנים הבאות
  for (let i = 1; i < years; i++) {
    const prevYear = forecast[i - 1];
    const yearIndex = i + 1;
    
    // Apply annual appreciation to property value - חישוב עליית ערך הנכס
    const newPropertyValue = prevYear.propertyValue * (1 + annualAppreciationRate / 100);
    
    // Calculate new yearly capital gain - חישוב רווח הון שנתי חדש
    const yearlyCapitalGain = calculateYearlyCapitalGain(newPropertyValue, annualAppreciationRate);
    
    // Calculate new monthly rent (assume 2% increase per year) - חישוב שכר דירה חודשי חדש
    const newMonthlyRent = prevYear.monthlyRent * 1.02;
    const newYearlyRent = calculateYearlyRent(newMonthlyRent);
    
    // Calculate new yearly expenses - חישוב הוצאות שנתיות חדשות
    const newYearlyExpenses = calculateYearlyExpenses(newYearlyRent, expenseRate);
    
    // Monthly payment remains the same (fixed-rate mortgage) - תשלום חודשי נשאר קבוע
    const newMonthlyPayment = prevYear.monthlyPayment;
    const newYearlyMortgagePayment = newMonthlyPayment * 12;
    
    // Calculate new yearly cash flow - חישוב תזרים מזומנים שנתי חדש
    const newYearlyCashFlow = calculateYearlyCashFlow(
      newYearlyRent,
      newYearlyMortgagePayment,
      newYearlyExpenses
    );
    
    // Calculate new ROI - חישוב תשואה חדשה
    const newCashFlowROI = calculateROI(newYearlyCashFlow, totalInvestment);
    
    // Calculate new total yearly return - חישוב תשואה שנתית כוללת חדשה
    const newTotalYearlyReturn = calculateTotalYearlyReturn(
      newYearlyCashFlow,
      yearlyCapitalGain
    );
    
    // Calculate new total yearly ROI - חישוב אחוז תשואה שנתית כוללת חדש
    const newTotalYearlyROI = calculateTotalYearlyROI(
      newTotalYearlyReturn,
      totalInvestment
    );
    
    // Add to forecast - הוספה לתחזית
    forecast.push({
      year: yearIndex,
      propertyValue: newPropertyValue,
      monthlyRent: newMonthlyRent,
      yearlyRent: newYearlyRent,
      yearlyExpenses: newYearlyExpenses,
      monthlyPayment: newMonthlyPayment,
      yearlyMortgagePayment: newYearlyMortgagePayment,
      yearlyCashFlow: newYearlyCashFlow,
      cashFlowROI: newCashFlowROI,
      yearlyCapitalGain,
      totalYearlyReturn: newTotalYearlyReturn,
      totalYearlyROI: newTotalYearlyROI
    });
  }
  
  // לאחר יצירת התחזית ל-30 שנה, מחק את השנה האחרונה (שנה 30)
  if (forecast.length > 30) {
    forecast.pop();
  }
  return forecast;
};

// Get principal payment for specific month and term - חישוב תשלום קרן לחודש ספציפי
export const getPrincipalPaymentForMonth = (years, month) => {
  // Make sure month is not outside bounds
  if (month > years * 12) {
    return 0; // אם החודש מחוץ לטווח ההלוואה, אין תשלום קרן
  }
  
  // החישוב הקבוע עבור כל תקופה
  if (years === 10) {
    // לתקופה של 10 שנים
    const baseRate = 679;  // ערך התחלתי
    const finalRate = 1012; // ערך בסיום
    const totalMonths = years * 12;
    const monthlyIncrease = (finalRate - baseRate) / totalMonths;
    return Math.round(baseRate + (monthlyIncrease * (month - 1)));
  } 
  else if (years === 15) {
    // לתקופה של 15 שנים
    const baseRate = 400;  // ערך התחלתי
    const finalRate = 750; // ערך בסיום
    const totalMonths = years * 12;
    const monthlyIncrease = (finalRate - baseRate) / totalMonths;
    return Math.round(baseRate + (monthlyIncrease * (month - 1)));
  } 
  else if (years === 20) {
    // לתקופה של 20 שנים
    const baseRate = 261;  // ערך התחלתי
    const finalRate = 627; // ערך בסיום
    const totalMonths = years * 12;
    const monthlyIncrease = (finalRate - baseRate) / totalMonths;
    return Math.round(baseRate + (monthlyIncrease * (month - 1)));
  } 
  else if (years === 25) {
    // לתקופה של 25 שנים
    const baseRate = 178;  // ערך התחלתי
    const finalRate = 562; // ערך בסיום
    const totalMonths = years * 12;
    const monthlyIncrease = (finalRate - baseRate) / totalMonths;
    return Math.round(baseRate + (monthlyIncrease * (month - 1)));
  } 
  else if (years === 30) {
    // לתקופה של 30 שנים
    const baseRate = 125;  // ערך התחלתי
    const finalRate = 525; // ערך בסיום
    const totalMonths = years * 12;
    const monthlyIncrease = (finalRate - baseRate) / totalMonths;
    return Math.round(baseRate + (monthlyIncrease * (month - 1)));
  }
  
  // אם התקופה לא תואמת לאף אחת מהתקופות שהוגדרו, נחשב באופן יחסי
  // קבלת התקופה הקרובה ביותר
  let termYears;
  if (years < 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;
  
  // החזרת ערך יחסי לתקופה הקרובה
  return getPrincipalPaymentForMonth(termYears, month);
};

// Calculate monthly principal payment based on loan term - חישוב תשלום קרן חודשי לפי תקופת הלוואה
export const calculateMonthlyPrincipalPayment = async (mortgageAmount, years) => {
  if (!mortgageAmount || !years) return 0;

  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < MAX_RETRIES) {
    try {
      // ניסיון לקבל את לוח התשלומים ממסד הנתונים
      const scheduleResult = await getFullPaymentSchedule(mortgageAmount, years, 4.0);

      if (scheduleResult && scheduleResult.monthlyPayments && scheduleResult.monthlyPayments.length > 0) {
        // החזר קרן חודשי של החודש הראשון בלבד
        const principalPayment = scheduleResult.monthlyPayments[0].principalPayment ||
                                 scheduleResult.monthlyPayments[0].principal || 0;
        return Math.round(principalPayment);
      }
      throw new Error('לא התקבלו נתונים מספיקים מהשרת');
    } catch (error) {
      lastError = error;
      retryCount++;
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
      }
    }
  }

  // גיבוי - ערך קבוע
  const PRINCIPAL_RATES = {
    10: 679, 15: 400, 20: 261, 25: 178, 30: 125
  };
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;
  const multiplier = mortgageAmount / 100000;
  return Math.round(PRINCIPAL_RATES[termYears] * multiplier);
};

// Calculate annual principal payment - חישוב תשלום קרן שנתי
export const calculateAnnualPrincipalPayment = async (mortgageAmount, years, annualInterestRate = 4.0) => {
  if (!mortgageAmount || !years) return 0;

  console.log(`מחשב החזר קרן שנתי עבור הלוואה של ${mortgageAmount}₪ ל-${years} שנים`);

  try {
    // קבל יתרת הלוואה לאחר שנה (1 = שנה ראשונה)
    const remainingAfterYear = await calculateAnnualRemainingBalance(mortgageAmount, years, 1, annualInterestRate);
    if (remainingAfterYear !== null && !isNaN(remainingAfterYear)) {
      const annualPrincipal = mortgageAmount - remainingAfterYear;
      console.log(`✅ החזר קרן שנתי (הפרש): ${annualPrincipal}₪`);
      return Math.round(annualPrincipal);
    }
    // אם לא הצליח, fallback
    console.warn('❌ לא התקבלה יתרה תקינה לאחר שנה, עובר לחישוב גיבוי');
  } catch (error) {
    console.error('שגיאה בחישוב החזר קרן שנתי:', error);
  }

  // גיבוי - חישוב לפי טבלה
  const ANNUAL_PRINCIPAL_RATES = {
    10: 8280, // 10 שנים: 8,280₪ החזר קרן שנתי לכל 100K
    15: 4900, // 15 שנים: 4,900₪ החזר קרן שנתי לכל 100K
    20: 3200, // 20 שנים: 3,200₪ החזר קרן שנתי לכל 100K
    25: 2190, // 25 שנים: 2,190₪ החזר קרן שנתי לכל 100K
    30: 1530  // 30 שנים: 1,530₪ החזר קרן שנתי לכל 100K
  };

  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  const annualPrincipalPayment = Math.round(ANNUAL_PRINCIPAL_RATES[termYears] * (mortgageAmount / 100000));
  console.log(`החזר קרן שנתי (גיבוי לפי טבלאות): ${annualPrincipalPayment}₪`);
  return annualPrincipalPayment;
};

// פונקציה משופרת לחישוב יחס ההחזר לפי השנה
export const calculateRemainingRatioByYear = (currentYear, totalYears) => {
  // יחס בסיסי - כמה נשאר כאחוז מהתקופה המלאה
  const baseRatio = 1 - (currentYear / totalYears);
  
  // התאמת היחס לפי תקופת ההלוואה - הלוואות קצרות יורדות מהר יותר
  let power;
  if (totalYears <= 10) {
    power = 0.8;  // יורד מהר יותר בהלוואות קצרות
  } else if (totalYears <= 15) {
    power = 0.85;
  } else if (totalYears <= 20) {
    power = 0.9;
  } else if (totalYears <= 25) {
    power = 0.92;
  } else {
    power = 0.95; // יורד לאט יותר בהלוואות ארוכות
  }
  
  // החזרת יחס מותאם לפי העיקרון של החזר איטי בהתחלה ומהיר יותר בסוף
  return Math.pow(baseRatio, power);
};

// Calculate annual remaining balance - חישוב יתרת הלוואה שנתית
export const calculateAnnualRemainingBalance = async (mortgageAmount, years, currentYear, annualInterestRate = 4.0) => {
  // כפיית ערך null כשמגיעים לשנת סיום המשכנתא
  console.log(`[יתרה שנתית]: שנה=${currentYear}, תקופת משכנתא=${years}`);
  
  // אם השנה שווה או גדולה משנות המשכנתא - בהכרח null
  if (currentYear >= years) {
    console.log(`[אכיפת כלל]: שנה ${currentYear} >= ${years} - מחזיר בהכרח null!`);
    return null;
  }
  
  // נשתמש בפונקציה הדינמית
  const remainingLoan = calculateLoanScheduleForYears(mortgageAmount, years, currentYear, annualInterestRate);
  
  if (remainingLoan !== null) {
    console.log(`חישוב יתרת הלוואה לשנה ${currentYear} (מחישוב דינמי): ${remainingLoan}₪`);
    return remainingLoan;
  }
  
  // אם החישוב הדינמי לא הצליח, חשב לפי חודשים
  return calculateRemainingLoanBalance(mortgageAmount, years, currentYear * 12, annualInterestRate);
};

// Get initial principal portion of monthly payment based on loan term - קבלת חלק הקרן הראשוני מהתשלום החודשי
export const getInitialPrincipalPortion = (years) => {
  // Initial principal portion per 100,000 ILS for different terms - חלק קרן ראשוני לכל 100,000 ש"ח
  const PRINCIPAL_PORTIONS = {
    30: 125,  // 30 years: starts at 125 ש"ח
    25: 178,  // 25 years: starts at 178 ש"ח
    20: 261,  // 20 years: starts at 261 ש"ח
    15: 400,  // 15 years: starts at 400 ש"ח
    10: 679   // 10 years: starts at 679 ש"ח
  };

  // Get the closest term - קבלת התקופה הקרובה ביותר
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  return PRINCIPAL_PORTIONS[termYears];
};

// Get monthly increase in principal payment based on loan term - קבלת הגידול החודשי בתשלום הקרן
export const getPrincipalMonthlyIncrease = (years) => {
  // Monthly increase in principal payment per 100,000 ILS - גידול חודשי בתשלום קרן לכל 100,000 ש"ח
  const MONTHLY_INCREASES = {
    30: 1,    // 30 years: increases by ~1 ש"ח per month
    25: 1,    // 25 years: increases by ~1 ש"ח per month
    20: 1,    // 20 years: increases by ~1 ש"ח per month
    15: 1,    // 15 years: increases by ~1-2 ש"ח per month
    10: 2     // 10 years: increases by ~2-3 ש"ח per month
  };

  // Get the closest term - קבלת התקופה הקרובה ביותר
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  return MONTHLY_INCREASES[termYears];
};

// במקום המחשבון המקומי, נשתמש בפונקציה הדינמית
export const calculateRemainingLoanBalance = async (principal, years, monthsElapsed, annualInterestRate = 4.0) => {
  if (!principal || !years || monthsElapsed === undefined) return 0;

  // כפיית ערך null כשהחודשים שווים או גדולים מסה"כ חודשי המשכנתא
  console.log(`[יתרה חודשית]: חודש=${monthsElapsed}, סה"כ חודשים=${years * 12}`);
  
  // אם חלפו מספיק חודשים - בהכרח null
  if (monthsElapsed >= years * 12) {
    console.log(`[אכיפת כלל]: חודש ${monthsElapsed} >= ${years * 12} - מחזיר בהכרח null!`);
    return null;
  }

  try {
    // ניסיון לקבל את לוח התשלומים ממסד הנתונים
    const fullSchedule = await getFullPaymentSchedule(principal, years, annualInterestRate);
    
    // אם התקבל לוח תשלומים מלא
    if (fullSchedule && fullSchedule.monthlyPayments && fullSchedule.monthlyPayments.length > 0) {
      // בדיקה אם יש לנו את כל החודשים שאנחנו צריכים
      if (fullSchedule.monthlyPayments.length >= monthsElapsed) {
        // מציאת היתרה בחודש הספציפי
        const remainingBalance = fullSchedule.monthlyPayments[monthsElapsed - 1].remainingPrincipal;
        console.log(`יתרת הלוואה לאחר ${monthsElapsed} חודשים (מהשרת): ${remainingBalance}₪`);
        
        // אם יתרת ההלוואה נמוכה מאוד, נחזיר null במקום 0
        if (remainingBalance <= 0 || remainingBalance < principal * 0.01) {
          return null;
        }
        
        return Math.round(remainingBalance);
      } else {
        // אם אין לנו את כל החודשים, נחשב בצורה מקומית
        console.log(`יש רק ${fullSchedule.monthlyPayments.length} חודשים בלוח, אבל צריך ${monthsElapsed}. משלים חישוב...`);
        
        // בדיקה נוספת אם חצינו את תקופת ההלוואה
        if (monthsElapsed >= years * 12) {
          return null;
        }
        
        // סיכום החזרי הקרן מהחודשים שקיימים בלוח
        let totalPrincipalPaid = 0;
        
        // עבור כל חודש בלוח שיש לנו, נסכום את החזרי הקרן
        for (let i = 0; i < Math.min(fullSchedule.monthlyPayments.length, monthsElapsed); i++) {
          totalPrincipalPaid += fullSchedule.monthlyPayments[i].principalPayment;
        }
        
        // אם צריך להשלים חודשים נוספים, נשתמש בחישוב מקומי
        if (fullSchedule.monthlyPayments.length < monthsElapsed) {
          // קבלת המכפיל להלוואה
          const multiplier = principal / 100000;
          
          for (let month = fullSchedule.monthlyPayments.length + 1; month <= monthsElapsed; month++) {
            // חישוב תשלום קרן לחודש זה לפי הפונקציה שלנו
            const monthlyPrincipal = getPrincipalPaymentForMonth(years, month) * multiplier;
            totalPrincipalPaid += monthlyPrincipal;
          }
        }
        
        // חישוב יתרה נותרת
        const remainingBalance = principal - totalPrincipalPaid;
        console.log(`יתרת הלוואה לאחר ${monthsElapsed} חודשים (חישוב משולב): ${Math.max(0, Math.round(remainingBalance))}₪`);
        
        // אם יתרת ההלוואה נמוכה מאוד, נחזיר null במקום 0
        if (remainingBalance <= 0 || remainingBalance < principal * 0.01) {
          return null;
        }
        
        // לא לאפשר יתרה שלילית או גדולה מהקרן המקורית
        return Math.max(0, Math.min(principal, Math.round(remainingBalance)));
      }
    } else {
      // אם אין נתונים מהשרת, נחשב בצורה מקומית
      
      // נבדוק שוב אם הגענו לתקופה שאחרי ההלוואה
      if (monthsElapsed >= years * 12) {
        return null;
      }
      
      // נשתמש בפונקציה הדינמית שחישבנו
      const currentYear = Math.ceil(monthsElapsed / 12);
      const remainingLoan = calculateLoanScheduleForYears(principal, years, currentYear, annualInterestRate);
      
      if (remainingLoan !== null) {
        console.log(`יתרת הלוואה לאחר ${monthsElapsed} חודשים (חישוב דינמי): ${remainingLoan}₪`);
        return remainingLoan;
      }
      
      throw new Error('לא התקבלו נתונים מספיקים מהשרת');
    }
    
  } catch (error) {
    console.error('שגיאה בקבלת נתונים מהשרת עבור יתרת הלוואה:', error);
    console.log('משתמש בחישוב גיבוי מקומי');

    // בדיקה נוספת אם הגענו לתקופה שאחרי ההלוואה
    if (monthsElapsed >= years * 12) {
      return null;
    }

    // נחשב בצורה דינמית
    const currentYear = Math.ceil(monthsElapsed / 12);
    const remainingLoan = calculateLoanScheduleForYears(principal, years, currentYear, annualInterestRate);
    
    if (remainingLoan !== null) {
      console.log(`יתרת הלוואה לאחר ${monthsElapsed} חודשים (מחישוב דינמי): ${remainingLoan}₪`);
      return remainingLoan;
    }
    
    // אם החישוב הדינמי לא הצליח
    console.log('משתמש בחישוב גיבוי מקומי המסורתי');

    // קבלת המכפיל להלוואה
    const multiplier = principal / 100000;
    
    // חישוב סך תשלומי קרן עד כה
    let totalPrincipalPaid = 0;
    for (let month = 1; month <= monthsElapsed; month++) {
      // חישוב תשלום קרן לחודש זה
      const monthlyPrincipal = getPrincipalPaymentForMonth(years, month) * multiplier;
      totalPrincipalPaid += monthlyPrincipal;
    }
    
    // חישוב יתרה נותרת
    const remainingBalance = principal - totalPrincipalPaid;
    
    console.log(`יתרת הלוואה לאחר ${monthsElapsed} חודשים (חישוב מקומי): ${Math.max(0, Math.round(remainingBalance))}₪`);
    
    // אם היתרה קטנה מאוד או שלילית, נחזיר null במקום 0
    if (remainingBalance <= 0 || remainingBalance < principal * 0.01) {
      return null;
    }
    
    // לא לאפשר יתרה שלילית או גדולה מהקרן המקורית
    return Math.max(0, Math.min(principal, Math.round(remainingBalance)));
  }
}; 