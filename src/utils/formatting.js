// Format currency in Israeli Shekel
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '₪0';
  
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentage
export const formatPercentage = (value) => {
  if (value === undefined || value === null) return '0%';
  
  return new Intl.NumberFormat('he-IL', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
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