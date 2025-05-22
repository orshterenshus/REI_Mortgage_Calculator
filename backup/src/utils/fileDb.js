// Simple file-based database for storing calculation results
// Works both in Node.js environment and browser environment

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to save calculation data
export const saveCalculation = (data) => {
  try {
    if (isBrowser) {
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
    } else {
      // Node.js environment - use file system
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      // Create a folder in the user's documents directory for storing the data
      const dbFolder = path.join(os.homedir(), 'ApartmentCalculatorDB');
      
      // Create the folder if it doesn't exist
      if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder);
      }
      
      // Create a filename based on the current date and time
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `calculation_${timestamp}.txt`;
      const filePath = path.join(dbFolder, filename);
      
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
      
      // Write to file
      fs.writeFileSync(filePath, fileContent, 'utf-8');
      
      return { success: true, filePath };
    }
  } catch (error) {
    console.error('Failed to save calculation:', error);
    return { success: false, error: error.message };
  }
};

// List calculations is only available in Node.js
export const listCalculations = () => {
  try {
    if (!isBrowser) {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      const dbFolder = path.join(os.homedir(), 'ApartmentCalculatorDB');
      
      if (!fs.existsSync(dbFolder)) {
        return { success: true, files: [] };
      }
      
      const files = fs.readdirSync(dbFolder);
      return {
        success: true,
        files: files.map(file => path.join(dbFolder, file))
      };
    } else {
      return { success: false, error: 'Not available in browser environment' };
    }
  } catch (error) {
    console.error('Failed to list calculations:', error);
    return { success: false, error: error.message };
  }
};

// Get content of a specific calculation file (Node.js only)
export const getCalculation = (filePath) => {
  try {
    if (!isBrowser) {
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, content };
    } else {
      return { success: false, error: 'Not available in browser environment' };
    }
  } catch (error) {
    console.error('Failed to read calculation:', error);
    return { success: false, error: error.message };
  }
}; 