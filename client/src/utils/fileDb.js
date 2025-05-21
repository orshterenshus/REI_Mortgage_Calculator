// Browser-only version of fileDb functionality
import api from './api';

// Function to save calculation data as browser download and to MongoDB
export const saveCalculation = async (data) => {
  try {
    // 1. Save as browser download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `calculation_${timestamp}.txt`;
    
    // Format the data as key-value pairs
    let fileContent = '';
    
    // Add input values
    fileContent += '====== נתוני קלט ======\n';
    Object.entries(data.inputs).forEach(([key, value]) => {
      fileContent += `${key}: ${value}\n`;
    });
    
    // Add calculation results
    fileContent += '\n====== תוצאות חישוב ======\n';
    Object.entries(data.results).forEach(([key, value]) => {
      fileContent += `${key}: ${value}\n`;
    });
    
    // Create a blob and download the file
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    // 2. Save to MongoDB
    try {
      // Convert input/results to match the Deal schema
      const dealData = {
        name: `חישוב ${new Date().toLocaleDateString('he-IL')}`,
        propertyValue: data.inputs.propertyValue,
        purchaseTaxRate: data.inputs.purchaseExpenseRate,
        lawyerFee: 0, // Not provided in current UI
        otherExpenses: data.inputs.renovationCost,
        equity: data.inputs.equity,
        annualInterestRate: data.inputs.annualInterestRate,
        loanTerm: data.inputs.mortgageYears,
        monthlyRent: data.inputs.monthlyRent,
        annualExpensesRate: data.inputs.expenseRate,
        annualAppreciationRate: data.inputs.annualAppreciationRate,
        results: data.results,
        forecast: data.forecast || []
      };

      // משתמש ב-api במקום ב-fetch ישירות
      console.log('שולח נתונים לשמירה ב-deals...');
      const response = await api.post('/deals', dealData);
      const dbResult = response.data;

      console.log('נשמר למסד הנתונים:', dbResult);
      return { 
        success: true, 
        filename, 
        dbSaved: true,
        dbId: dbResult._id,
        message: `החישוב נשמר בקובץ: ${filename} ובמסד הנתונים`
      };
    } catch (dbError) {
      console.error('שגיאה בשמירה למסד הנתונים:', dbError);
      return { 
        success: true, 
        filename, 
        dbSaved: false,
        message: `החישוב נשמר בקובץ: ${filename} (שגיאה בשמירה למסד הנתונים: ${dbError.message})`
      };
    }
  } catch (error) {
    console.error('Failed to save calculation:', error);
    return { success: false, error: error.message };
  }
};

// Stub functions (not available in browser)
export const listCalculations = () => {
  console.warn('listCalculations is not available in browser environment');
  return { success: false, error: 'Not available in browser environment', files: [] };
};

export const getCalculation = () => {
  console.warn('getCalculation is not available in browser environment');
  return { success: false, error: 'Not available in browser environment', content: null };
}; 