/**
 * ========================================
 * רכיב טופס קלט השקעה (Input Form Component)
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
import './InputForm.css';

/**
 * ========================================
 * פונקציות עזר לפורמט מספרים
 * ========================================
 */

/**
 * פורמט מספר עם פסיקים לפרידת אלפים
 * @param {number|string} value - הערך לפורמט
 * @returns {string} - הערך מפורמט עם פסיקים
 */
const formatNumberWithCommas = (value) => {
  if (!value && value !== 0) return '';
  const numValue = typeof value === 'string' ? value.replace(/,/g, '') : value;
  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * הסרת פסיקים ממספר והמרה למספר
 * @param {string} value - הערך עם פסיקים
 * @returns {number} - המספר ללא פסיקים
 */
const parseNumberFromCommas = (value) => {
  if (!value) return '';
  const cleanValue = value.toString().replace(/,/g, '');
  return cleanValue === '' ? '' : parseFloat(cleanValue);
};

// CSS לאנימציית ספינר
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* הסרת חצים מתיבות המספרים */
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }
  
  /* תיקון צבע placeholder לדרופדאון */
  select option[value=""] {
    color: #999;
  }
  
  select:invalid {
    color: #999;
  }
  
  select:valid {
    color: #000;
  }
`;
if (!document.head.querySelector('style[data-spinner]')) {
  spinnerStyle.setAttribute('data-spinner', 'true');
  document.head.appendChild(spinnerStyle);
}

/**
 * ========================================
 * רכיב הטופס הראשי
 * ========================================
 */
const InputForm = ({ inputs, setInputs, onCalculate, onSave, onClear, isCalculating }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value === '' ? '' : parseFloat(value),
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = parseNumberFromCommas(value);
    setInputs({
      ...inputs,
      [name]: cleanValue === '' ? '' : cleanValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCalculating) return;
    await onCalculate();
  };

  return (
    <div className="input-form-container">
      
      {/* כותרת ראשית */}
      <div className="form-header">
        <h1>מחשבון השקעות נדל"ן</h1>
        <p>הזן את פרטי ההשקעה לקבלת ניתוח מפורט ותחזית רווחיות</p>
      </div>

      <form onSubmit={handleSubmit} className="investment-form">
        
        {/* פרטי הנכס */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">🏠</div>
            <h2>פרטי הנכס</h2>
          </div>
          
          <div className="inputs-grid">
            <div className="input-group">
              <label htmlFor="address">כתובת הנכס</label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                value={inputs.address || ''}
                onChange={(e) => setInputs({ ...inputs, address: e.target.value })}
                placeholder="רחוב הרצל 15, תל אביב"
                required
                disabled={isCalculating}
              />
            </div>

            <div className="input-group">
              <label htmlFor="propertyValue">מחיר הנכס</label>
              <div className="input-with-currency">
                <input
                  type="text"
                  id="propertyValue"
                  name="propertyValue"
                  className="form-input"
                  value={inputs.propertyValue ? formatNumberWithCommas(inputs.propertyValue) : ''}
                  onChange={handleNumberChange}
                  placeholder={inputs.propertyValue ? '' : 'מחיר הנכס'}
                  required
                  disabled={isCalculating}
                />
                {inputs.propertyValue && <span className="currency">₪</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="marketValue">שווי שוק נוכחי</label>
              <div className="input-with-currency">
                <input
                  type="text"
                  id="marketValue"
                  name="marketValue"
                  className="form-input"
                  value={inputs.marketValue ? formatNumberWithCommas(inputs.marketValue) : ''}
                  onChange={handleNumberChange}
                  placeholder={inputs.marketValue ? '' : 'שווי שוק נוכחי'}
                  disabled={isCalculating}
                />
                {inputs.marketValue && <span className="currency">₪</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="monthlyRent">שכירות חודשית</label>
              <div className="input-with-currency">
                <input
                  type="text"
                  id="monthlyRent"
                  name="monthlyRent"
                  className="form-input"
                  value={inputs.monthlyRent ? formatNumberWithCommas(inputs.monthlyRent) : ''}
                  onChange={handleNumberChange}
                  placeholder={inputs.monthlyRent ? '' : 'שכירות חודשית'}
                  required
                  disabled={isCalculating}
                />
                {inputs.monthlyRent && <span className="currency">₪</span>}
              </div>
            </div>
          </div>
        </div>

        {/* מימון */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">💰</div>
            <h2>פרטי מימון</h2>
          </div>
          
          <div className="inputs-grid">
            <div className="input-group">
              <label htmlFor="equity">הון עצמי</label>
              <div className="input-with-currency">
                <input
                  type="text"
                  id="equity"
                  name="equity"
                  className="form-input"
                  value={inputs.equity ? formatNumberWithCommas(inputs.equity) : ''}
                  onChange={handleNumberChange}
                  placeholder={inputs.equity ? '' : 'הון עצמי'}
                  required
                  disabled={isCalculating}
                />
                {inputs.equity && <span className="currency">₪</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="years">תקופת משכנתא</label>
              <div className="input-with-unit">
                <select
                  id="years"
                  name="years"
                  className="form-input"
                  value={inputs.years || ''}
                  onChange={handleChange}
                  required
                  disabled={isCalculating}
                >
                  <option value="">תקופת משכנתא</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="25">25</option>
                  <option value="30">30</option>
                </select>
                {inputs.years && <span className="unit">שנים</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="annualInterestRate">ריבית שנתית</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="annualInterestRate"
                  name="annualInterestRate"
                  className="form-input readonly"
                  value="4.0"
                  step="0.1"
                  readOnly
                  disabled
                />
                <span className="unit">%</span>
              </div>
              <small className="input-note">ריבית קבועה לכל החישובים</small>
            </div>
          </div>
        </div>

        {/* הוצאות */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">📊</div>
            <h2>הוצאות והערכות</h2>
          </div>
          
          <div className="inputs-grid">
            <div className="input-group">
              <label htmlFor="purchaseExpenseRate">הוצאות רכישה</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="purchaseExpenseRate"
                  name="purchaseExpenseRate"
                  className="form-input"
                  value={inputs.purchaseExpenseRate ?? ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={inputs.purchaseExpenseRate ? '' : 'הוצאות רכישה'}
                  disabled={isCalculating}
                />
                {inputs.purchaseExpenseRate && <span className="unit">%</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="renovationCost">השקעה בנכס</label>
              <div className="input-with-currency">
                <input
                  type="text"
                  id="renovationCost"
                  name="renovationCost"
                  className="form-input"
                  value={inputs.renovationCost ? formatNumberWithCommas(inputs.renovationCost) : ''}
                  onChange={handleNumberChange}
                  placeholder={inputs.renovationCost ? '' : 'השקעה בנכס'}
                  disabled={isCalculating}
                />
                {inputs.renovationCost && <span className="currency">₪</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="purchaseTax">מס רכישה</label>
              <div className="input-with-currency">
                <input
                  type="text"
                  id="purchaseTax"
                  name="purchaseTax"
                  className="form-input"
                  value={inputs.purchaseTax ? formatNumberWithCommas(inputs.purchaseTax) : ''}
                  onChange={handleNumberChange}
                  placeholder={inputs.purchaseTax ? '' : 'מס רכישה'}
                  disabled={isCalculating}
                />
                {inputs.purchaseTax && <span className="currency">₪</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="expenseRate">הוצאות שנתיות</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="expenseRate"
                  name="expenseRate"
                  className="form-input"
                  value={inputs.expenseRate ?? ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={inputs.expenseRate ? '' : 'הוצאות שנתיות'}
                  disabled={isCalculating}
                />
                {inputs.expenseRate && <span className="unit">%</span>}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="annualAppreciationRate">אחוז השבחה שנתי</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="annualAppreciationRate"
                  name="annualAppreciationRate"
                  className="form-input"
                  value={inputs.annualAppreciationRate ?? ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={inputs.annualAppreciationRate ? '' : 'אחוז השבחה שנתי'}
                  disabled={isCalculating}
                />
                {inputs.annualAppreciationRate && <span className="unit">% </span>}
              </div>
            </div>
          </div>
        </div>

        {/* כפתורי פעולה */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <div className="loading-spinner"></div>
                מחשב...
              </>
            ) : (
              <>
                <span className="btn-icon">🔍</span>
                חשב השקעה
              </>
            )}
          </button>

          <button 
            type="button" 
            className="btn-secondary"
            onClick={onSave}
            disabled={isCalculating}
          >
            <span className="btn-icon">💾</span>
            שמור עסקה
          </button>

          <button 
            type="button" 
            className="btn-tertiary"
            onClick={onClear}
            disabled={isCalculating}
          >
            <span className="btn-icon">🔄</span>
            נקה טופס
          </button>
        </div>

      </form>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default InputForm; 