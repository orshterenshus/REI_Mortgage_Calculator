/**
 * ========================================
 * רכיב טופס הזנת נתונים (InputForm Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג טופס להזנת כל הנתונים הנדרשים לחישוב כדאיות השקעה בנדל"ן
 * כולל שדות לפרטי הנכס, מימון, הכנסות והוצאות
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - @emotion/styled: לעיצוב הרכיב
 * 
 * Props:
 * - inputs: Object - ערכי השדות הנוכחיים
 * - setInputs: Function - פונקציה לעדכון הערכים
 * - onCalculate: Function - פונקציה שנקראת בלחיצה על "חשב"
 * - onSave: Function - פונקציה שנקראת בלחיצה על "שמור"
 * - onClear: Function - פונקציה שנקראת בלחיצה על "נקה"
 * - isCalculating: boolean - האם מתבצע חישוב כרגע
 */

import React from 'react';
import styled from '@emotion/styled';

/**
 * ========================================
 * Styled Components - עיצוב הרכיב
 * ========================================
 */

/**
 * מיכל הטופס הראשי
 */
const FormContainer = styled.div`
  margin-bottom: 2rem;
`;

/**
 * אנימציית טעינה (ספינר)
 * מוצגת בזמן חישוב
 */
const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 2s linear infinite;
  display: inline-block;
  margin-left: 10px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * כפתור מותאם אישית
 */
const Button = styled.button`
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

/**
 * ========================================
 * רכיב הטופס הראשי
 * ========================================
 */
const InputForm = ({ inputs, setInputs, onCalculate, onSave, onClear, isCalculating }) => {
  
  /**
   * טיפול בשינוי ערך של שדה מספרי
   * 
   * @param {Event} e - אירוע השינוי
   * 
   * הפונקציה:
   * 1. מחלצת את שם השדה והערך החדש
   * 2. ממירה את הערך למספר (או שומרת כמחרוזת ריקה)
   * 3. מעדכנת את ה-state באמצעות setInputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value === '' ? '' : parseFloat(value),
    });
  };

  /**
   * טיפול בשינוי ערך של שדה טקסט (כתובת)
   * 
   * @param {Event} e - אירוע השינוי
   * 
   * דומה ל-handleChange אבל לא ממירה למספר
   */
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  /**
   * בדיקת תקינות כתובת
   * 
   * @param {string} address - הכתובת לבדיקה
   * @returns {boolean} האם הכתובת תקינה
   * 
   * כתובת תקינה חייבת:
   * 1. להכיל טקסט (לא ריקה)
   * 2. להכיל פסיק (מפריד בין כתובת לעיר)
   * 3. להכיל טקסט משני צידי הפסיק
   */
  const validateAddress = (address) => {
    if (!address || !address.trim()) return false;
    const parts = address.split(',');
    return parts.length >= 2 && parts[0].trim() && parts[1].trim();
  };

  /**
   * טיפול בשליחת הטופס
   * 
   * @param {Event} e - אירוע השליחה
   * 
   * תהליך:
   * 1. מונע רענון הדף (preventDefault)
   * 2. בודק שלא מתבצע חישוב כרגע
   * 3. מבצע ולידציה על שדה הכתובת
   * 4. קורא לפונקציית החישוב
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCalculating) return;
    
    // בדיקת תקינות כתובת לפני שליחה
    if (!validateAddress(inputs.address)) {
      alert('יש להזין כתובת מלאה בפורמט: כתובת, עיר (לדוגמה: תירוש 56, כרמיאל)');
      return;
    }
    
    await onCalculate();
  };

  /**
   * ========================================
   * הרכיב המוחזר - ממשק המשתמש
   * ========================================
   */
  return (
    <FormContainer className="card">
      <h2>נתוני השקעה</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-grid">
          
          {/* ========================================
              שדה כתובת הנכס - שדה חובה
              ======================================== */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="address">כתובת הנכס *</label>
            <input
              type="text"
              id="address"
              name="address"
              className="form-control"
              value={inputs.address ?? ''}
              onChange={handleTextChange}
              placeholder="לדוגמה: תירוש 56, כרמיאל"
              required
              disabled={isCalculating}
              style={{ fontSize: '1rem' }}
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              יש להזין כתובת מלאה כולל עיר, מופרדת בפסיק
            </small>
          </div>
          
          {/* ========================================
              שדות נתונים כספיים
              ======================================== */}
          
          {/* סכום הרכישה - מחיר הנכס */}
          <div className="form-group">
            <label htmlFor="propertyValue">סכום הרכישה</label>
            <input
              type="number"
              id="propertyValue"
              name="propertyValue"
              className="form-control"
              value={inputs.propertyValue ?? ''}
              onChange={handleChange}
              min="0"
              step="10000"
              required
              disabled={isCalculating}
            />
          </div>
          
          {/* אחוז הוצאות רכישה - עמלות, מיסים וכו' */}
          <div className="form-group">
            <label htmlFor="purchaseExpenseRate">אחוז הוצאות רכישה</label>
            <input
              type="number"
              id="purchaseExpenseRate"
              name="purchaseExpenseRate"
              className="form-control"
              value={inputs.purchaseExpenseRate ?? ''}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              disabled={isCalculating}
            />
          </div>
          
          {/* הון עצמי - כמה כסף המשקיע משקיע מכיסו */}
          <div className="form-group">
            <label htmlFor="equity">הון עצמי</label>
            <input
              type="number"
              id="equity"
              name="equity"
              className="form-control"
              value={inputs.equity ?? ''}
              onChange={handleChange}
              min="0"
              step="10000"
              required
              disabled={isCalculating}
            />
          </div>
          
          {/* השקעה בנכס - שיפוצים וכו' */}
          <div className="form-group">
            <label htmlFor="renovationCost">השקעה בנכס</label>
            <input
              type="number"
              id="renovationCost"
              name="renovationCost"
              className="form-control"
              value={inputs.renovationCost ?? ''}
              onChange={handleChange}
              min="0"
              step="5000"
              disabled={isCalculating}
            />
          </div>
          
          {/* מס רכישה - סכום קבוע */}
          <div className="form-group">
            <label htmlFor="purchaseTax">מס רכישה</label>
            <input
              type="number"
              id="purchaseTax"
              name="purchaseTax"
              className="form-control"
              value={inputs.purchaseTax ?? ''}
              onChange={handleChange}
              min="0"
              step="1000"
              disabled={isCalculating}
            />
          </div>
          
          {/* טווח שנים - תקופת ההשקעה/משכנתא */}
          <div className="form-group">
            <label htmlFor="years">טווח שנים</label>
            <input
              type="number"
              id="years"
              name="years"
              className="form-control"
              value={inputs.years ?? ''}
              onChange={handleChange}
              min="1"
              max="50"
              step="1"
              required
              disabled={isCalculating}
            />
          </div>
          
          {/* מחיר שוק - ערך שוק נוכחי של הנכס */}
          <div className="form-group">
            <label htmlFor="marketValue">מחיר שוק</label>
            <input
              type="number"
              id="marketValue"
              name="marketValue"
              className="form-control"
              value={inputs.marketValue ?? ''}
              onChange={handleChange}
              min="0"
              step="10000"
              disabled={isCalculating}
            />
          </div>
          
          {/* אחוז השבחה שנתי - כמה הנכס צפוי לעלות בערך */}
          <div className="form-group">
            <label htmlFor="annualAppreciationRate">אחוז השבחה שנתי</label>
            <input
              type="number"
              id="annualAppreciationRate"
              name="annualAppreciationRate"
              className="form-control"
              value={inputs.annualAppreciationRate ?? ''}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              disabled={isCalculating}
            />
          </div>
          
          {/* הכנסה משכירות חודשית */}
          <div className="form-group">
            <label htmlFor="monthlyRent">הכנסה משכירות חודשית</label>
            <input
              type="number"
              id="monthlyRent"
              name="monthlyRent"
              className="form-control"
              value={inputs.monthlyRent ?? ''}
              onChange={handleChange}
              min="0"
              step="100"
              required
              disabled={isCalculating}
            />
          </div>
          
          {/* אחוז הוצאה שנתית - תחזוקה, ניהול וכו' */}
          <div className="form-group">
            <label htmlFor="expenseRate">אחוז הוצאה שנתית</label>
            <input
              type="number"
              id="expenseRate"
              name="expenseRate"
              className="form-control"
              value={inputs.expenseRate ?? ''}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.5"
              disabled={isCalculating}
            />
          </div>
        </div>
        
        {/* ========================================
            כפתורי פעולה
            ======================================== */}
        <div className="actions">
          {/* כפתור חישוב - מפעיל את החישובים */}
          <Button type="submit" className="btn" disabled={isCalculating}>
            {isCalculating ? (
              <>
                <LoadingSpinner /> מחשב...
              </>
            ) : 'חשב'}
          </Button>
          
          {/* כפתור שמירה - שומר את הנתונים הנוכחיים */}
          <Button type="button" className="btn btn-secondary" onClick={onSave} disabled={isCalculating}>
            שמור
          </Button>
          
          {/* כפתור ניקוי - מאפס את כל השדות */}
          <Button type="button" className="btn" onClick={onClear} style={{ backgroundColor: '#e74c3c' }} disabled={isCalculating}>
            נקה
          </Button>
        </div>
      </form>
    </FormContainer>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default InputForm; 