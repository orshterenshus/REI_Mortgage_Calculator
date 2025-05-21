// Browser-only version of fileDb functionality

// Function to save calculation data as browser download
export const saveCalculation = (data) => {
  try {
    // Browser environment - use text file download
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
    
    return { success: true, filename };
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