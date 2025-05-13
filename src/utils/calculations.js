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

// Calculate annual principal repayment
// This is simplified for now
export const calculateAnnualPrincipalRepayment = (mortgageAmount, years) => {
  if (!mortgageAmount || !years) return 0;
  return mortgageAmount / years;
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
  
  // IMPORTANT CHANGE: Use years as the term for choosing the mortgage payment table
  // This will determine the payment based on the years parameter, not the mortgageYears parameter
  const monthlyPayment = await calculateMonthlyPayment(
    mortgageAmount,
    annualInterestRate,
    years  // Use years instead of mortgageYears for choosing the payment table
  );
  
  // Calculate monthly principal repayment (simplified) - still use mortgageYears for actual loan term
  const monthlyPrincipalRepayment = mortgageAmount / (mortgageYears * 12);
  
  // Calculate annual income
  const annualIncome = calculateAnnualIncome(monthlyRent);
  
  // Calculate annual net income
  const annualNetIncome = calculateAnnualNetIncome(annualIncome, expenseRate);
  
  // Calculate annual payment
  const annualPayment = calculateAnnualPayment(monthlyPayment);
  
  // Calculate annual cashflow
  const annualCashflow = calculateAnnualCashflow(annualNetIncome, annualPayment);
  
  let currentRemainingLoan = mortgageAmount;
  let accumulatedCashflow = 0;
  
  // Use years parameter for forecast length, not mortgageYears
  for (let year = 1; year <= years; year++) {
    // Calculate remaining loan using amortization - use mortgageYears for loan term
    const monthlyRate = annualInterestRate / 100 / 12;
    const totalPayments = mortgageYears * 12;  // Use mortgageYears for loan term
    const paymentsCompleted = year * 12;
    
    if (paymentsCompleted < totalPayments) {
      // Calculate remaining loan balance
      const factor = Math.pow(1 + monthlyRate, totalPayments - paymentsCompleted);
      const numerator = factor - 1;
      const denominator = Math.pow(1 + monthlyRate, totalPayments) - 1;
      currentRemainingLoan = mortgageAmount * (numerator / denominator) * factor;
    } else {
      currentRemainingLoan = 0;
    }
    
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