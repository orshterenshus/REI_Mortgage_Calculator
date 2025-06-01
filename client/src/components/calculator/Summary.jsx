/**
 * ========================================
 * רכיב סיכום תוצאות (Summary Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג את תוצאות החישוב בצורה מסודרת וברורה
 * כולל את כל הנתונים הפיננסיים החשובים להחלטת השקעה
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - @emotion/styled: לעיצוב הרכיב
 * 
 * Props:
 * - results: Object - אובייקט התוצאות מהחישוב
 *   - purchaseExpenses: הוצאות רכישה
 *   - mortgageAmount: גובה המשכנתא
 *   - monthlyPayment: תשלום חודשי
 *   - annualPayment: תשלום שנתי
 *   - annualIncome: הכנסה שנתית
 *   - annualNetIncome: הכנסה נטו שנתית
 *   - annualCashflow: תזרים שנתי
 *   - monthlyCashflow: תזרים חודשי
 *   - totalInvestment: סך ההשקעה
 *   - propertyYield: תשואה על הנכס
 *   - equityYield: תשואה על ההון
 *   - marketValue: שווי שוק
 */

import React from 'react';
import styled from '@emotion/styled';

/**
 * ========================================
 * Styled Components - עיצוב הרכיב
 * ========================================
 */

/**
 * מיכל הסיכום הראשי
 */
const SummaryContainer = styled.div`
  margin-bottom: 2rem;
`;

/**
 * כותרת הסעיף
 */
const SectionTitle = styled.h3`
  color: var(--primary);
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;

/**
 * רשת לתצוגת הנתונים
 * מסדרת את השדות בשתי עמודות ברספונסיב
 */
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

/**
 * תיבת נתון בודד
 */
const SummaryItem = styled.div`
  background-color: var(--surface);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
`;

/**
 * תווית השדה
 */
const Label = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

/**
 * ערך השדה
 * צבע משתנה לפי סוג הערך (חיובי/שלילי)
 */
const Value = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.negative ? '#e74c3c' : 'var(--text)'};
`;

/**
 * ========================================
 * פונקציות עזר
 * ========================================
 */

/**
 * פורמט מספר למטבע ישראלי
 * 
 * @param {number} value - הערך לפרמוט
 * @returns {string} המספר מפורמט עם ₪ ופסיקים
 * 
 * @example
 * formatCurrency(1500000) // "₪1,500,000"
 * formatCurrency(-5000) // "-₪5,000"
 */
const formatCurrency = (value) => {
  // בדיקה אם הערך תקין
  if (value === null || value === undefined || isNaN(value)) {
    return '₪0';
  }
  
  // שמירת הסימן
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  // פירמוט עם פסיקים
  const formatted = absValue.toLocaleString('he-IL');
  
  // החזרה עם סימן וסמל מטבע
  return `${isNegative ? '-' : ''}₪${formatted}`;
};

/**
 * פורמט אחוזים
 * 
 * @param {number} value - הערך באחוזים
 * @returns {string} האחוז מפורמט עם סימן %
 * 
 * @example
 * formatPercentage(5.67) // "5.67%"
 * formatPercentage(-2.5) // "-2.50%"
 */
const formatPercentage = (value) => {
  // בדיקה אם הערך תקין
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  
  // פירמוט לשתי ספרות אחרי הנקודה
  return `${value.toFixed(2)}%`;
};

/**
 * ========================================
 * רכיב הסיכום הראשי
 * ========================================
 */
const Summary = ({ results }) => {
  // אם אין תוצאות, לא להציג כלום
  if (!results) return null;

  return (
    <SummaryContainer className="card">
      <h2>סיכום תוצאות</h2>
      
      {/* ========================================
          סעיף עלויות רכישה והשקעה
          ======================================== */}
      <SectionTitle>עלויות רכישה והשקעה</SectionTitle>
      <SummaryGrid>
        {/* הוצאות רכישה - עמלות, מיסים וכו' */}
        <SummaryItem>
          <Label>הוצאות רכישה</Label>
          <Value>{formatCurrency(results.purchaseExpenses)}</Value>
        </SummaryItem>
        
        {/* גובה המשכנתא - הסכום שנלקח כהלוואה */}
        <SummaryItem>
          <Label>גובה המשכנתא</Label>
          <Value>{formatCurrency(results.mortgageAmount)}</Value>
        </SummaryItem>
        
        {/* סך ההשקעה - כל מה שהמשקיע מוציא מכיסו */}
        <SummaryItem>
          <Label>סך ההשקעה</Label>
          <Value>{formatCurrency(results.totalInvestment)}</Value>
        </SummaryItem>
      </SummaryGrid>

      {/* ========================================
          סעיף תשלומי משכנתא
          ======================================== */}
      <SectionTitle>תשלומי משכנתא</SectionTitle>
      <SummaryGrid>
        {/* תשלום חודשי למשכנתא */}
        <SummaryItem>
          <Label>תשלום חודשי</Label>
          <Value>{formatCurrency(results.monthlyPayment)}</Value>
        </SummaryItem>
        
        {/* תשלום שנתי למשכנתא */}
        <SummaryItem>
          <Label>תשלום שנתי</Label>
          <Value>{formatCurrency(results.annualPayment)}</Value>
        </SummaryItem>
      </SummaryGrid>

      {/* ========================================
          סעיף הכנסות
          ======================================== */}
      <SectionTitle>הכנסות</SectionTitle>
      <SummaryGrid>
        {/* הכנסה שנתית ברוטו משכירות */}
        <SummaryItem>
          <Label>הכנסה שנתית</Label>
          <Value>{formatCurrency(results.annualIncome)}</Value>
        </SummaryItem>
        
        {/* הכנסה שנתית נטו (אחרי הוצאות תפעול) */}
        <SummaryItem>
          <Label>הכנסה שנתית נטו</Label>
          <Value>{formatCurrency(results.annualNetIncome)}</Value>
        </SummaryItem>
      </SummaryGrid>

      {/* ========================================
          סעיף תזרים מזומנים
          ======================================== */}
      <SectionTitle>תזרים מזומנים</SectionTitle>
      <SummaryGrid>
        {/* תזרים שנתי - הכנסה נטו פחות תשלומי משכנתא */}
        <SummaryItem>
          <Label>תזרים שנתי</Label>
          <Value negative={results.annualCashflow < 0}>
            {formatCurrency(results.annualCashflow)}
          </Value>
        </SummaryItem>
        
        {/* תזרים חודשי - תזרים שנתי חלקי 12 */}
        <SummaryItem>
          <Label>תזרים חודשי</Label>
          <Value negative={results.monthlyCashflow < 0}>
            {formatCurrency(results.monthlyCashflow)}
          </Value>
        </SummaryItem>
      </SummaryGrid>

      {/* ========================================
          סעיף תשואות
          ======================================== */}
      <SectionTitle>תשואות</SectionTitle>
      <SummaryGrid>
        {/* תשואה על הנכס - הכנסה נטו חלקי ערך הנכס */}
        <SummaryItem>
          <Label>תשואה על הנכס</Label>
          <Value negative={results.propertyYield < 0}>
            {formatPercentage(results.propertyYield)}
          </Value>
        </SummaryItem>
        
        {/* תשואה על ההון - תזרים חלקי השקעה עצמית */}
        <SummaryItem>
          <Label>תשואה על ההון</Label>
          <Value negative={results.equityYield < 0}>
            {formatPercentage(results.equityYield)}
          </Value>
        </SummaryItem>
      </SummaryGrid>

      {/* ========================================
          סעיף שווי שוק (אם קיים)
          ======================================== */}
      {results.marketValue && (
        <>
          <SectionTitle>שווי שוק</SectionTitle>
          <SummaryGrid>
            <SummaryItem>
              <Label>שווי שוק נוכחי</Label>
              <Value>{formatCurrency(results.marketValue)}</Value>
            </SummaryItem>
          </SummaryGrid>
        </>
      )}
    </SummaryContainer>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default Summary; 