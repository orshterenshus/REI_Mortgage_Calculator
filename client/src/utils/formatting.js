// Format currency in Israeli Shekel
export const formatCurrency = (value) => {
  if (value === undefined || value === null || value === 0) return '-';
  
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  if (value === undefined || value === null) return '0';
  
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

// Format number with thousands separator
export const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format number with 2 decimal places
export const formatDecimal = (value) => {
  if (value === undefined || value === null) return '0';
  
  return new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}; 