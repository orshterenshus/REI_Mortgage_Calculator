/**
 * ========================================
 * רכיב טבלת תחזית (ForecastTable Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג טבלת תחזית שנתית לעסקת נדל"ן
 * כולל נתונים על הכנסות, הוצאות, תזרים ותשואה לאורך השנים
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - forecast: Array - מערך אובייקטי התחזית השנתית
 * - years: Number - מספר שנות המשכנתא
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
 * ========================================
 * רכיב טבלת התחזית
 * ========================================
 */
const ForecastTable = ({ forecast, years }) => {
  if (!forecast || forecast.length === 0) {
    return <div className="empty-forecast">אין נתוני תחזית להצגה</div>;
  }

  return (
    <div className="forecast-container">
      <h3 className="forecast-title">תחזית שנתית</h3>
      <div className="table-wrapper">
        <table className="forecast-table">
          <thead>
            <tr>
              <th>שנה</th>
              <th>ערך נכס</th>
              <th>הכנסה שנתית</th>
              <th>הוצאות תפעול</th>
              <th>הכנסה נטו</th>
              <th>החזר משכנתא</th>
              <th>תזרים שנתי</th>
              <th>תשואה להון</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((year) => (
              <tr key={year.year}>
                <td className="year-cell">{year.year}</td>
                <td>{formatCurrency(year.propertyValue)}</td>
                <td>{formatCurrency(year.annualIncome)}</td>
                <td>{formatCurrency(year.operatingExpenses)}</td>
                <td>{formatCurrency(year.netIncome)}</td>
                <td>{formatCurrency(year.mortgagePayment)}</td>
                <td className={year.cashflow != null && year.cashflow >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(year.cashflow)}
                </td>
                <td className={year.equityYield != null && year.equityYield >= 0 ? 'positive' : 'negative'}>
                  {year.equityYield != null ? year.equityYield.toFixed(2) + '%' : '0.00%'}
                </td>
              </tr>
            ))}
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