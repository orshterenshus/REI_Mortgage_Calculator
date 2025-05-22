import api from '../utils/api';

/**
 * Get the most recent deal from the database
 * @returns {Promise<Object>} The most recent deal
 */
export const getLatestDeal = async () => {
  try {
    const response = await api.get('/deals?limit=1');
    return response.data && response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error('Error getting latest deal:', error);
    return null;
  }
};

/**
 * Get a deal by ID
 * @param {string} id - The deal ID
 * @returns {Promise<Object>} The deal
 */
export const getDealById = async (id) => {
  try {
    const response = await api.get(`/deals/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting deal with ID ${id}:`, error);
    return null;
  }
};

/**
 * Create a new deal with form inputs
 * @param {Object} formInputs - The form inputs
 * @returns {Promise<Object>} The created deal
 */
export const createDeal = async (formInputs) => {
  try {
    // If formInputs already contains all required fields, use them directly
    // Otherwise, create a proper deal object from formInputs
    const dealData = formInputs.name ? formInputs : {
      name: `חישוב ${new Date().toLocaleDateString('he-IL')}`,
      propertyValue: formInputs.propertyValue || 0,
      purchaseTaxRate: formInputs.purchaseExpenseRate || 0,
      lawyerFee: 0,
      otherExpenses: formInputs.renovationCost || 0,
      equity: formInputs.equity || 0,
      annualInterestRate: formInputs.annualInterestRate || 4.0,
      loanTerm: formInputs.years || 0,
      monthlyRent: formInputs.monthlyRent || 0,
      annualExpensesRate: formInputs.expenseRate || 0,
      annualAppreciationRate: formInputs.annualAppreciationRate || 0
    };
    
    const response = await api.post('/deals', dealData);
    return response.data;
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

/**
 * Update an existing deal with form inputs
 * @param {string} id - The deal ID
 * @param {Object} formInputs - The form inputs
 * @returns {Promise<Object>} The updated deal
 */
export const updateDealInputs = async (id, formInputs) => {
  try {
    // Only update the input fields, not the results or forecast
    const updateData = {
      propertyValue: formInputs.propertyValue,
      purchaseTaxRate: formInputs.purchaseExpenseRate,
      otherExpenses: formInputs.renovationCost,
      equity: formInputs.equity,
      annualInterestRate: formInputs.annualInterestRate || 4.0,
      loanTerm: formInputs.years,
      monthlyRent: formInputs.monthlyRent,
      annualExpensesRate: formInputs.expenseRate,
      annualAppreciationRate: formInputs.annualAppreciationRate
    };
    
    const response = await api.put(`/deals/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating deal with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Map a deal document to form input format
 * @param {Object} deal - The deal document from database
 * @returns {Object} The form inputs
 */
export const mapDealToFormInputs = (deal) => {
  if (!deal) return null;
  
  // First map direct fields
  const formInputs = {
    propertyValue: deal.propertyValue || 0,
    purchaseExpenseRate: deal.purchaseTaxRate || 0,
    equity: deal.equity || 0,
    renovationCost: deal.otherExpenses || 0,
    purchaseTax: 0, // Not directly mapped in the Deal model
    years: deal.loanTerm || 0,
    marketValue: deal.propertyValue || 0, // Use property value as market value if not specified
    annualAppreciationRate: deal.annualAppreciationRate || 0,
    monthlyRent: deal.monthlyRent || 0,
    expenseRate: deal.annualExpensesRate || 0,
    annualInterestRate: deal.annualInterestRate || 4.0,
    mortgageYears: deal.loanTerm || 0
  };
  
  // If there are results, use them to override certain values
  if (deal.results && Object.keys(deal.results).length > 0) {
    // Override with values from results if they exist
    if (deal.results.marketValue) {
      formInputs.marketValue = deal.results.marketValue;
    }
    
    if (deal.results.annualInterestRate) {
      formInputs.annualInterestRate = deal.results.annualInterestRate;
    }
  }
  
  return formInputs;
}; 