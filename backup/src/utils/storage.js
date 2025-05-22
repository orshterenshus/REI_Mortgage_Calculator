const STORAGE_KEY = 'apartmentInvestmentCalculator';

// Save data to localStorage
export const saveData = (data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    return false;
  }
};

// Load data from localStorage
export const loadData = () => {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return null;
  }
};

// Clear data from localStorage
export const clearData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
    return false;
  }
}; 