import { yearsToPayments, loadMortgageDataForTerm, calculateMonthlyPayment as calculateMortgagePayment, getClosestTerm } from './mortgageTable';

// Calculate purchase expenses
export const calculatePurchaseExpenses = (propertyValue, purchaseExpenseRate) => {
  if (!propertyValue || !purchaseExpenseRate) return 0;
  return (propertyValue * purchaseExpenseRate) / 100;
};

// Calculate mortgage amount
export const calculateMortgageAmount = (propertyValue, equity) => {
  if (!propertyValue || !equity) return 0;
  return propertyValue - equity;
};

// Alias for the mortgage table calculation
export const calculateMonthlyPayment = calculateMortgagePayment;

// Calculate annual mortgage payment
export const calculateAnnualPayment = (monthlyPayment) => {
  if (!monthlyPayment) return 0;
  return monthlyPayment * 12;
};

// Calculate annual income
export const calculateAnnualIncome = (monthlyRent) => {
  if (!monthlyRent) return 0;
  return monthlyRent * 12;
};

// Calculate annual net income
export const calculateAnnualNetIncome = (annualIncome, expenseRate) => {
  if (!annualIncome) return 0;
  return annualIncome * (1 - (expenseRate || 0) / 100);
};

// Calculate annual cashflow
export const calculateAnnualCashflow = (annualNetIncome, annualPayment) => {
  return annualNetIncome - annualPayment;
};

// Calculate property yield
export const calculatePropertyYield = (marketValue, annualNetIncome) => {
  if (!marketValue || !annualNetIncome) return 0;
  return (annualNetIncome / marketValue) * 100;
};

// Calculate total investment
export const calculateTotalInvestment = (equity, purchaseExpenses, renovationCost, purchaseTax) => {
  return (equity || 0) + (purchaseExpenses || 0) + (renovationCost || 0) + (purchaseTax || 0);
};

// Calculate equity yield
export const calculateEquityYield = (totalInvestment, monthlyPrincipalRepayment, annualCashflow) => {
  if (!totalInvestment) return 0;
  const annualPrincipalRepayment = monthlyPrincipalRepayment * 12;
  return ((annualPrincipalRepayment + annualCashflow) / totalInvestment) * 100;
};

// Generate yearly forecast data
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
  
  // Calculate initial values
  let currentPropertyValue = propertyValue;
  let currentMarketValue = marketValue || propertyValue;
  
  // Calculate mortgage amount
  const mortgageAmount = calculateMortgageAmount(propertyValue, equity);
  
  // Calculate purchase expenses
  const purchaseExpenses = calculatePurchaseExpenses(propertyValue, purchaseExpenseRate);
  
  // Calculate total investment
  const totalInvestment = calculateTotalInvestment(equity, purchaseExpenses, renovationCost, purchaseTax);
  
  // Calculate monthly payment
  const monthlyPayment = await calculateMonthlyPayment(
    mortgageAmount,
    annualInterestRate,
    years
  );
  
  // Calculate monthly principal repayment using the new function
  const monthlyPrincipalRepayment = calculateMonthlyPrincipalPayment(mortgageAmount, years);
  
  // Calculate annual income
  const annualIncome = calculateAnnualIncome(monthlyRent);
  
  // Calculate annual net income
  const annualNetIncome = calculateAnnualNetIncome(annualIncome, expenseRate);
  
  // Calculate annual payment
  const annualPayment = calculateAnnualPayment(monthlyPayment);
  
  // Calculate annual cashflow
  const annualCashflow = calculateAnnualCashflow(annualNetIncome, annualPayment);
  
  let accumulatedCashflow = 0;
  
  // Use years parameter for forecast length
  for (let year = 1; year <= years; year++) {
    // Calculate remaining loan using amortization formula
    const currentRemainingLoan = calculateAnnualRemainingBalance(mortgageAmount, years, year);
    
    // Calculate property appreciation
    currentPropertyValue = currentPropertyValue * (1 + (annualAppreciationRate || 0) / 100);
    
    // Calculate market value appreciation
    currentMarketValue = currentMarketValue * (1 + (annualAppreciationRate || 0) / 100);
    
    // Calculate accumulated cash flow
    const yearlyCashflow = annualCashflow;
    accumulatedCashflow += yearlyCashflow;
    
    // Calculate equity
    const currentEquity = currentMarketValue - currentRemainingLoan;
    
    // Calculate property yield
    const propertyYield = calculatePropertyYield(currentMarketValue, annualNetIncome);
    
    // Calculate equity yield
    const equityYield = calculateEquityYield(totalInvestment, monthlyPrincipalRepayment, annualCashflow);
    
    // Calculate total profit percentage
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
      equityYield
    });
  }
  
  return forecast;
};

/**
 * Convert years to months
 * @param {number} years - Number of years
 * @returns {number} - Number of months
 */
export const yearsToMonths = (years) => {
  return years * 12;
};

// Calculate loan amount
export const calculateLoanAmount = (propertyValue, purchaseTax, renovationCost, purchaseExpenses, equity) => {
  return propertyValue + purchaseTax + renovationCost + purchaseExpenses - equity;
};

// Calculate monthly mortgage payment using the mortgage table data
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

// Calculate yearly rent
export const calculateYearlyRent = (monthlyRent) => {
  return monthlyRent * 12;
};

// Calculate yearly expenses
export const calculateYearlyExpenses = (yearlyRent, expenseRate) => {
  return yearlyRent * (expenseRate / 100);
};

// Calculate yearly cash flow
export const calculateYearlyCashFlow = (yearlyRent, yearlyMortgagePayment, yearlyExpenses) => {
  return yearlyRent - yearlyMortgagePayment - yearlyExpenses;
};

// Calculate ROI (Return on Investment)
export const calculateROI = (yearlyCashFlow, totalInvestment) => {
  return (yearlyCashFlow / totalInvestment) * 100;
};

// Calculate yearly capital gain
export const calculateYearlyCapitalGain = (marketValue, annualAppreciationRate) => {
  return marketValue * (annualAppreciationRate / 100);
};

// Calculate total yearly return
export const calculateTotalYearlyReturn = (yearlyCashFlow, yearlyCapitalGain) => {
  return yearlyCashFlow + yearlyCapitalGain;
};

// Calculate total yearly ROI
export const calculateTotalYearlyROI = (totalYearlyReturn, totalInvestment) => {
  return (totalYearlyReturn / totalInvestment) * 100;
};

// Generate forecast data
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

  // Calculate purchase expenses
  const purchaseExpenses = calculatePurchaseExpenses(propertyValue, purchaseExpenseRate);
  
  // Calculate total investment
  const totalInvestment = calculateTotalInvestment(equity, purchaseExpenses, renovationCost, purchaseTax);
  
  // Calculate initial monthly payment
  const loanAmount = calculateLoanAmount(propertyValue, purchaseTax, renovationCost, purchaseExpenses, equity);
  const monthlyPayment = await calculateMonthlyMortgagePayment(loanAmount, annualInterestRate, mortgageYears);
  
  // Calculate yearly values for the first year
  const yearlyRent = calculateYearlyRent(monthlyRent);
  const yearlyMortgagePayment = monthlyPayment * 12;
  const yearlyExpenses = calculateYearlyExpenses(yearlyRent, expenseRate);
  const yearlyCashFlow = calculateYearlyCashFlow(yearlyRent, yearlyMortgagePayment, yearlyExpenses);
  const cashFlowROI = calculateROI(yearlyCashFlow, totalInvestment);
  
  // Initialize forecast with first year
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
  
  // Calculate the first year's total yearly return and ROI
  forecast[0].totalYearlyReturn = calculateTotalYearlyReturn(
    forecast[0].yearlyCashFlow,
    forecast[0].yearlyCapitalGain
  );
  
  forecast[0].totalYearlyROI = calculateTotalYearlyROI(
    forecast[0].totalYearlyReturn,
    totalInvestment
  );
  
  // Generate forecast for remaining years
  for (let i = 1; i < years; i++) {
    const prevYear = forecast[i - 1];
    const yearIndex = i + 1;
    
    // Apply annual appreciation to property value
    const newPropertyValue = prevYear.propertyValue * (1 + annualAppreciationRate / 100);
    
    // Calculate new yearly capital gain
    const yearlyCapitalGain = calculateYearlyCapitalGain(newPropertyValue, annualAppreciationRate);
    
    // Calculate new monthly rent (assume 2% increase per year)
    const newMonthlyRent = prevYear.monthlyRent * 1.02;
    const newYearlyRent = calculateYearlyRent(newMonthlyRent);
    
    // Calculate new yearly expenses
    const newYearlyExpenses = calculateYearlyExpenses(newYearlyRent, expenseRate);
    
    // Monthly payment remains the same (fixed-rate mortgage)
    const newMonthlyPayment = prevYear.monthlyPayment;
    const newYearlyMortgagePayment = newMonthlyPayment * 12;
    
    // Calculate new yearly cash flow
    const newYearlyCashFlow = calculateYearlyCashFlow(
      newYearlyRent,
      newYearlyMortgagePayment,
      newYearlyExpenses
    );
    
    // Calculate new ROI
    const newCashFlowROI = calculateROI(newYearlyCashFlow, totalInvestment);
    
    // Calculate new total yearly return
    const newTotalYearlyReturn = calculateTotalYearlyReturn(
      newYearlyCashFlow,
      yearlyCapitalGain
    );
    
    // Calculate new total yearly ROI
    const newTotalYearlyROI = calculateTotalYearlyROI(
      newTotalYearlyReturn,
      totalInvestment
    );
    
    // Add to forecast
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

// Get principal payment for specific month and term
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

// Calculate annual principal payment
export const calculateAnnualPrincipalPayment = (mortgageAmount, years) => {
  // Calculate loan multiplier
  const multiplier = mortgageAmount / 100000;
  
  // Calculate total principal paid in first year
  let annualPrincipalPayment = 0;
  for (let month = 1; month <= 12; month++) {
    // Calculate principal payment for this month
    const monthlyPrincipal = getPrincipalPaymentForMonth(years, month) * multiplier;
    annualPrincipalPayment += monthlyPrincipal;
  }
  
  return Math.round(annualPrincipalPayment);
};

// Calculate remaining loan balance considering monthly principal payment changes
export const calculateRemainingLoanBalance = (principal, years, monthsElapsed) => {
  if (!principal || !years || monthsElapsed === undefined) return 0;

  // Calculate loan multiplier
  const multiplier = principal / 100000;
  
  // Calculate total principal paid so far
  let totalPrincipalPaid = 0;
  for (let month = 1; month <= monthsElapsed; month++) {
    // Calculate principal payment for this month
    const monthlyPrincipal = getPrincipalPaymentForMonth(years, month) * multiplier;
    totalPrincipalPaid += monthlyPrincipal;
  }
  
  // Calculate remaining balance
  const remainingBalance = principal - totalPrincipalPaid;
  
  // Don't allow negative balance
  return Math.max(0, Math.round(remainingBalance));
};

// Calculate annual remaining balance
export const calculateAnnualRemainingBalance = (mortgageAmount, years, currentYear) => {
  return calculateRemainingLoanBalance(mortgageAmount, years, currentYear * 12);
};

// Calculate monthly principal payment based on loan term
export const calculateMonthlyPrincipalPayment = (mortgageAmount, years) => {
  if (!mortgageAmount || !years) return 0;

  // Define the principal payment rates per 100,000 ILS for different terms
  const PRINCIPAL_RATES = {
    30: 125,  // 30 years: 125 ש"ח
    25: 178,  // 25 years: 178 ש"ח
    20: 261,  // 20 years: 261 ש"ח
    15: 400,  // 15 years: 400 ש"ח
    10: 679   // 10 years: 679 ש"ח
  };

  // Get the closest term
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  // Get the rate for the term
  const rate = PRINCIPAL_RATES[termYears];
  
  // Calculate the monthly principal payment
  const multiplier = mortgageAmount / 100000;
  return Math.round(rate * multiplier);
};

// Get initial principal portion of monthly payment based on loan term
export const getInitialPrincipalPortion = (years) => {
  // Initial principal portion per 100,000 ILS for different terms
  const PRINCIPAL_PORTIONS = {
    30: 125,  // 30 years: starts at 125 ש"ח
    25: 178,  // 25 years: starts at 178 ש"ח
    20: 261,  // 20 years: starts at 261 ש"ח
    15: 400,  // 15 years: starts at 400 ש"ח
    10: 679   // 10 years: starts at 679 ש"ח
  };

  // Get the closest term
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  return PRINCIPAL_PORTIONS[termYears];
};

// Get monthly increase in principal payment based on loan term
export const getPrincipalMonthlyIncrease = (years) => {
  // Monthly increase in principal payment per 100,000 ILS
  const MONTHLY_INCREASES = {
    30: 1,    // 30 years: increases by ~1 ש"ח per month
    25: 1,    // 25 years: increases by ~1 ש"ח per month
    20: 1,    // 20 years: increases by ~1 ש"ח per month
    15: 1,    // 15 years: increases by ~1-2 ש"ח per month
    10: 2     // 10 years: increases by ~2-3 ש"ח per month
  };

  // Get the closest term
  let termYears;
  if (years <= 10) termYears = 10;
  else if (years > 10 && years <= 15) termYears = 15;
  else if (years > 15 && years <= 20) termYears = 20;
  else if (years > 20 && years <= 25) termYears = 25;
  else termYears = 30;

  return MONTHLY_INCREASES[termYears];
}; 