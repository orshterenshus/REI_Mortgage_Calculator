import { yearsToPayments, loadMortgageDataForTerm, calculateMonthlyPayment as calculateMortgagePayment, getClosestTerm } from './mortgageTable';

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

// Alias for the mortgage table calculation - חישוב תשלום חודשי
export const calculateMonthlyPayment = calculateMortgagePayment;

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
  const forecast = [];
  
  // החישוב יהיה תמיד עד 30 שנה, ללא תלות בפרמטר years
  const forecastYears = 30;
  
  // Calculate initial values - חישוב ערכים התחלתיים
  let currentPropertyValue = propertyValue;
  let currentMarketValue = marketValue || propertyValue;
  
  // Calculate mortgage amount - חישוב סכום המשכנתא
  const mortgageAmount = calculateMortgageAmount(propertyValue, equity);
  
  // Calculate purchase expenses - חישוב הוצאות רכישה
  const purchaseExpenses = calculatePurchaseExpenses(propertyValue, purchaseExpenseRate);
  
  // Calculate total investment - חישוב סך ההשקעה
  const totalInvestment = calculateTotalInvestment(equity, purchaseExpenses, renovationCost, purchaseTax);
  
  // Calculate monthly payment - חישוב תשלום חודשי
  const monthlyPayment = await calculateMonthlyPayment(
    mortgageAmount,
    annualInterestRate,
    years
  );
  
  // Calculate monthly principal repayment - חישוב החזר קרן חודשי
  const monthlyPrincipalRepayment = calculateMonthlyPrincipalPayment(mortgageAmount, years);
  
  // Calculate annual income - חישוב הכנסה שנתית
  const annualIncome = calculateAnnualIncome(monthlyRent);
  
  // Calculate annual net income - חישוב הכנסה שנתית נטו
  const annualNetIncome = calculateAnnualNetIncome(annualIncome, expenseRate);
  
  // Calculate annual payment - חישוב תשלום שנתי
  const annualPayment = calculateAnnualPayment(monthlyPayment);
  
  // Calculate annual cashflow - חישוב תזרים מזומנים שנתי
  const annualCashflow = calculateAnnualCashflow(annualNetIncome, annualPayment);
  
  let accumulatedCashflow = 0;
  
  // ייצור התחזית ל-30 שנה
  for (let year = 1; year <= forecastYears; year++) {
    // Calculate remaining loan using amortization formula - חישוב יתרת ההלוואה
    // אם השנה הנוכחית גדולה ממספר השנים של ההלוואה, יתרת ההלוואה היא 0
    const currentRemainingLoan = year > years ? 0 : calculateAnnualRemainingBalance(mortgageAmount, years, year);
    
    // Calculate property appreciation - חישוב עליית ערך הנכס
    currentPropertyValue = currentPropertyValue * (1 + (annualAppreciationRate || 0) / 100);
    
    // Calculate market value appreciation - חישוב עליית ערך השוק
    currentMarketValue = currentMarketValue * (1 + (annualAppreciationRate || 0) / 100);
    
    // Calculate accumulated cash flow - חישוב תזרים מזומנים מצטבר
    const yearlyCashflow = annualCashflow;
    accumulatedCashflow += yearlyCashflow;
    
    // Calculate equity - חישוב הון עצמי
    const currentEquity = currentMarketValue - currentRemainingLoan;
    
    // Calculate property yield - חישוב תשואת נכס
    const propertyYield = calculatePropertyYield(currentMarketValue, annualNetIncome);
    
    // Calculate equity yield - חישוב תשואה על הון
    const monthlyCashflow = yearlyCashflow / 12; // חישוב תזרים מזומנים חודשי
    const equityYield = calculateEquityYield(monthlyPrincipalRepayment, monthlyCashflow, totalInvestment);
    
    // Calculate equity percentage - חישוב תשואה הונית
    const equityPercentage = calculateEquityPercentage(currentEquity, totalInvestment);
    
    // Calculate total profit percentage - חישוב אחוז רווח כולל
    const totalProfit = (currentEquity - propertyValue) + accumulatedCashflow;
    const totalProfitPercentage = (totalProfit / totalInvestment) * 100;
    
    forecast.push({
      year,
      propertyValue: currentPropertyValue,
      marketValue: currentMarketValue,
      remainingLoan: currentRemainingLoan,
      equity: currentEquity,
      accumulatedCashflow,
      totalProfitPercentage,
      annualNetIncome,
      yearlyCashflow,
      propertyYield,
      equityYield,
      equityPercentage
    });
  }
  
  return forecast;
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

// Calculate monthly mortgage payment using the mortgage table data - חישוב תשלום משכנתא חודשי לפי טבלה
export const calculateMonthlyMortgagePayment = async (loanAmount, annualInterestRate, mortgageYears) => {
  // First, load the mortgage data for the specified term
  const mortgageData = await loadMortgageDataForTerm(mortgageYears);

  // Calculate the monthly payment using the mortgage data
  const monthlyPayment = calculateMonthlyPayment(
    mortgageData,
    loanAmount, 
    annualInterestRate / 100
  );

  return monthlyPayment;
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
  
  return forecast;
};

// Get principal payment for specific month and term - חישוב תשלום קרן לחודש ספציפי
export const getPrincipalPaymentForMonth = (years, month) => {
  if (years === 25) {
    if (month <= 3) return 178;
    if (month <= 5) return 180;
    if (month <= 7) return 182;
    if (month <= 9) return 184;
    if (month <= 11) return 186;
    return 187;
  } else if (years === 30) {
    if (month <= 5) return 125;
    if (month <= 8) return 126;
    if (month <= 11) return 127;
    return 128;
  } else if (years === 20) {
    if (month <= 3) return 261;
    if (month <= 6) return 263;
    if (month <= 9) return 268;
    if (month <= 11) return 270;
    return 271;
  } else if (years === 15) {
    if (month <= 2) return 400;
    if (month <= 4) return 403;
    if (month <= 6) return 407;
    if (month <= 8) return 410;
    if (month <= 10) return 413;
    return 415;
  } else if (years === 10) {
    if (month <= 2) return 679;
    if (month <= 4) return 684;
    if (month <= 6) return 691;
    if (month <= 8) return 695;
    if (month <= 10) return 700;
    return 704;
  }
  return 0;
};

// Calculate annual principal payment - חישוב תשלום קרן שנתי
export const calculateAnnualPrincipalPayment = (mortgageAmount, years) => {
  // Calculate loan multiplier - חישוב מכפיל הלוואה
  const multiplier = mortgageAmount / 100000;
  
  // Calculate total principal paid in first year - חישוב סך הקרן המשולמת בשנה הראשונה
  let annualPrincipalPayment = 0;
  for (let month = 1; month <= 12; month++) {
    // Calculate principal payment for this month - חישוב תשלום קרן לחודש זה
    const monthlyPrincipal = getPrincipalPaymentForMonth(years, month) * multiplier;
    annualPrincipalPayment += monthlyPrincipal;
  }
  
  return Math.round(annualPrincipalPayment);
};

// Calculate remaining loan balance considering monthly principal payment changes - חישוב יתרת הלוואה בהתחשב בשינויים חודשיים
export const calculateRemainingLoanBalance = (principal, years, monthsElapsed) => {
  if (!principal || !years || monthsElapsed === undefined) return 0;

  // Calculate loan multiplier - חישוב מכפיל הלוואה
  const multiplier = principal / 100000;
  
  // Calculate total principal paid so far - חישוב סך הקרן ששולמה עד כה
  let totalPrincipalPaid = 0;
  for (let month = 1; month <= monthsElapsed; month++) {
    // Calculate principal payment for this month - חישוב תשלום קרן לחודש זה
    const monthlyPrincipal = getPrincipalPaymentForMonth(years, month) * multiplier;
    totalPrincipalPaid += monthlyPrincipal;
  }
  
  // Calculate remaining balance - חישוב יתרה נותרת
  const remainingBalance = principal - totalPrincipalPaid;
  
  // Don't allow negative balance - לא לאפשר יתרה שלילית
  return Math.max(0, Math.round(remainingBalance));
};

// Calculate annual remaining balance - חישוב יתרת הלוואה שנתית
export const calculateAnnualRemainingBalance = (mortgageAmount, years, currentYear) => {
  return calculateRemainingLoanBalance(mortgageAmount, years, currentYear * 12);
};

// Calculate monthly principal payment based on loan term - חישוב תשלום קרן חודשי לפי תקופת הלוואה
export const calculateMonthlyPrincipalPayment = (mortgageAmount, years) => {
  if (!mortgageAmount || !years) return 0;

  // Define the principal payment rates per 100,000 ILS for different terms - הגדרת שיעורי תשלום קרן לכל 100,000 ש"ח
  const PRINCIPAL_RATES = {
    30: 125,  // 30 years: 125 ש"ח
    25: 178,  // 25 years: 178 ש"ח
    20: 261,  // 20 years: 261 ש"ח
    15: 400,  // 15 years: 400 ש"ח
    10: 679   // 10 years: 679 ש"ח
  };

  // Get the closest term - קבלת התקופה הקרובה ביותר
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  // Get the rate for the term - קבלת הערך לתקופה
  const rate = PRINCIPAL_RATES[termYears];
  
  // Calculate the monthly principal payment - חישוב תשלום קרן חודשי
  const multiplier = mortgageAmount / 100000;
  return Math.round(rate * multiplier);
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