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
export const createDeal = async (inputs) => {
  try {
    // First check if we have a token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('לא נמצא טוקן אימות - יש להתחבר מחדש');
    }
    
    const response = await api.post('/deals', {
      name: `Deal ${new Date().toISOString()}`,
      propertyValue: inputs.propertyValue,
      purchaseTaxRate: inputs.purchaseExpenseRate || 0,
      lawyerFee: 0,
      otherExpenses: inputs.renovationCost || 0,
      equity: inputs.equity,
      annualInterestRate: inputs.annualInterestRate || 4,
      loanTerm: inputs.years,
      monthlyRent: inputs.monthlyRent,
      annualExpensesRate: inputs.expenseRate || 0,
      annualAppreciationRate: inputs.annualAppreciationRate || 0
    });
    return response.data;
  } catch (error) {
    console.error('Error creating deal:', error);
    
    // Check for authentication error
    if (error.response && error.response.status === 401) {
      console.error('Authentication failed - token may be expired');
      // Optionally clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload(); // Force reload to show login
    }
    
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