import api from '../utils/api';

// Get all investments
export const getInvestments = async () => {
  const response = await api.get('/deals');
  return response.data;
};

// Get a single investment by ID
export const getInvestmentById = async (id) => {
  const response = await api.get(`/deals/${id}`);
  return response.data;
};

// Create a new investment
export const createInvestment = async (investmentData) => {
  const response = await api.post('/deals', investmentData);
  return response.data;
};

// Update an existing investment
export const updateInvestment = async (id, investmentData) => {
  const response = await api.put(`/deals/${id}`, investmentData);
  return response.data;
};

// Delete an investment
export const deleteInvestment = async (id) => {
  const response = await api.delete(`/deals/${id}`);
  return response.data;
};

// While the server-side integration is being developed, we can keep
// the current calculation logic on the client side and only save/load
// the results when the MongoDB integration is ready

// Future function to perform calculations on the server-side
export const calculateInvestmentOnServer = async (inputData) => {
  try {
    console.log('שולח נתונים לחישוב בשרת:', inputData);
    const response = await api.post('/deals/calculate', inputData);
    
    if (response.data && response.data.success) {
      console.log('חישוב הושלם בהצלחה בשרת:', response.data);
      return {
        success: true,
        data: response.data
      };
    } else {
      console.error('השרת החזיר שגיאה:', response.data);
      return {
        success: false,
        error: response.data.message || 'שגיאה לא ידועה בחישוב'
      };
    }
  } catch (error) {
    console.error('שגיאה בשליחת בקשת חישוב לשרת:', error);
    return {
      success: false,
      error: error.message || 'שגיאה בתקשורת עם השרת'
    };
  }
}; 