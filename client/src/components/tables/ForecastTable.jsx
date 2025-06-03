/**
 * ========================================
 * רכיב טבלת תחזית (ForecastTable Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג טבלת תחזית שנתית לעסקת נדל"ן
 * כולל נתונים על ערך נכס, תשואה הונית, הון עצמי ויתרת הלוואה
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - forecast: Array - מערך אובייקטי התחזית השנתית
 * - years: Number - מספר שנות המשכנתא
 * - totalInvestment: Number - ההשקעה הכוללת
 */

import React from 'react';
import '../../styles/tables/ForecastTable.css';

/**
 * ========================================
 * פונקציות עזר
 * ========================================
 */

/**
 * פורמט מספר למטבע
 * @param {number} value - הערך לפרמוט
 * @returns {string} - הערך מפורמט עם ₪
 */
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₪0';
  }
  return `₪${value.toLocaleString('he-IL')}`;
};

/**
 * חישוב תשואה הונית
 * תשואה הונית = ((הון עצמי - סך השקעה) / סך השקעה) * 100
 * @param {number} totalInvestment - סך ההשקעה הראשוני
 * @param {number} currentEquity - הון עצמי נוכחי
 * @returns {number} - תשואה הונית באחוזים
 */
const calculateEquityReturn = (totalInvestment, currentEquity) => {
  if (!totalInvestment || totalInvestment <= 0) return 0;
  
  // נוסחה: (הון עצמי - סך השקעה) / סך השקעה * 100
  const equityGain = (currentEquity || 0) - totalInvestment;
  return (equityGain / totalInvestment) * 100;
};

/**
 * פורמט אחוזים
 * @param {number} value - הערך באחוזים
 * @returns {string} - הערך מפורמט באחוזים
 */
const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  return `${value.toFixed(2)}%`;
};

/**
 * ========================================
 * רכיב טבלת התחזית
 * ========================================
 */
const ForecastTable = ({ forecast, years, totalInvestment }) => {
  if (!forecast || forecast.length === 0) {
    return <div className="empty-forecast">אין נתוני תחזית להצגה</div>;
  }

  // השתמש בהשקעה הכוללת שהועברה כפרופס, או נסה לקחת מהשנה הראשונה
  const initialInvestment = totalInvestment || forecast[0]?.equity || 0;

  return (
    <div className="forecast-container">
      <h3 className="forecast-title">תחזית שנתית</h3>
      <div className="table-wrapper">
        <table className="forecast-table">
          <thead>
            <tr>
              <th>שנה</th>
              <th>שווי נכס</th>
              <th>יתרת הלוואה</th>
              <th>הון עצמי</th>
              <th>תשואה הונית</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((year) => {
              const equityReturn = calculateEquityReturn(initialInvestment, year.equity || 0);
              
              return (
                <tr key={year.year}>
                  <td className="year-cell">{year.year}</td>
                  <td>{formatCurrency(year.propertyValue)}</td>
                  <td>{year.remainingLoan && year.remainingLoan > 0 ? formatCurrency(year.remainingLoan) : '-'}</td>
                  <td>{formatCurrency(year.equity || 0)}</td>
                  <td className={equityReturn >= 0 ? 'equity-profit' : 'equity-loss'}>
                    {formatPercentage(equityReturn)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default ForecastTable; 