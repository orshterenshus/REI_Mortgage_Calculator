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

import React, { useState } from 'react';

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
  // State לשמירת ערכי התצוגה הגולמיים
  const [displayValues, setDisplayValues] = useState({});
  
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
   * טיפול בשינוי ערך של שדה כסף עם פורמט פסיקים
   * @param {Event} e - אירוע השינוי
   */
  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const previousValue = displayValues[name] || '';
    
    // שמירת מיקום הקרסור
    const cursorPosition = e.target.selectionStart;
    
    // בדיקה אם זו מחיקה (הערך החדש קצר מהקודם)
    const isDeleting = value.length < previousValue.length;
    
    // אם מוחקים הכל, נקה את השדה
    if (value === '' || value === '₪') {
      setInputs({
        ...inputs,
        [name]: '',
      });
      setDisplayValues({
        ...displayValues,
        [name]: ''
      });
      return;
    }
    
    // בדיקה שהתו האחרון שהוזן הוא מספר או נקודה או פסיק או סימן ₪
    const lastChar = value.slice(-1);
    
    // אם התו האחרון לא מספרי ולא נקודה ולא סימן ₪ ולא פסיק - דחה (רק אם לא מוחקים)
    if (!isDeleting && lastChar && !/[0-9.,₪]/.test(lastChar)) {
      return; // לא מעדכנים כלום
    }
    
    // הסרת סמלים ופסיקים לצורך עיבוד
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    if (cleanValue === '') {
      setInputs({
        ...inputs,
        [name]: '',
      });
      setDisplayValues({
        ...displayValues,
        [name]: ''
      });
    } else {
      const numericValue = parseFloat(cleanValue);
      if (!isNaN(numericValue)) {
        setInputs({
          ...inputs,
          [name]: numericValue,
        });
        
        // פורמט בזמן אמת עם פסיקים וסימן ₪
        const formattedWithCommas = formatNumberWithCommas(cleanValue);
        const newDisplayValue = `${formattedWithCommas}₪`;
        
        setDisplayValues({
          ...displayValues,
          [name]: newDisplayValue
        });
        
        // חישוב מיקום הקרסור החדש
        setTimeout(() => {
          const input = e.target;
          let newCursorPos = cursorPosition;
          
          // אם הוסיפו פסיק לפני מיקום הקרסור, הזז אותו אחורה
          const commasBefore = (value.substring(0, cursorPosition).match(/,/g) || []).length;
          const newCommasBefore = (newDisplayValue.substring(0, cursorPosition).match(/,/g) || []).length;
          
          if (newCommasBefore > commasBefore) {
            newCursorPos += (newCommasBefore - commasBefore);
          }
          
          // וודא שהקרסור לא אחרי הסימן ₪
          const maxPos = newDisplayValue.length - 1;
          newCursorPos = Math.min(newCursorPos, maxPos);
          
          input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  /**
   * טיפול בשינוי ערך של שדה אחוזים
   * @param {Event} e - אירוע השינוי
   */
  const handlePercentageChange = (e) => {
    const { name, value } = e.target;
    const previousValue = displayValues[name] || '';
    
    // שמירת מיקום הקרסור
    const cursorPosition = e.target.selectionStart;
    
    // בדיקה אם זו מחיקה (הערך החדש קצר מהקודם)
    const isDeleting = value.length < previousValue.length;
    
    // אם מוחקים הכל, נקה את השדה
    if (value === '' || value === '%') {
      setInputs({
        ...inputs,
        [name]: '',
      });
      setDisplayValues({
        ...displayValues,
        [name]: ''
      });
      return;
    }
    
    // בדיקה שהתו האחרון שהוזן הוא מספר או נקודה או %
    const lastChar = value.slice(-1);
    
    // אם התו האחרון לא מספרי ולא נקודה ולא סימן % - דחה (רק אם לא מוחקים)
    if (!isDeleting && lastChar && !/[0-9.%]/.test(lastChar)) {
      return; // לא מעדכנים כלום
    }
    
    // הסרת סמל האחוז לצורך עיבוד
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    if (cleanValue === '') {
      setInputs({
        ...inputs,
        [name]: '',
      });
      setDisplayValues({
        ...displayValues,
        [name]: ''
      });
    } else {
      const numericValue = parseFloat(cleanValue);
      if (!isNaN(numericValue)) {
        setInputs({
          ...inputs,
          [name]: numericValue,
        });
        
        // הצגה בזמן אמת עם סימן %
        const newDisplayValue = `${cleanValue}%`;
        setDisplayValues({
          ...displayValues,
          [name]: newDisplayValue
        });
        
        // שמירת מיקום הקרסור
        setTimeout(() => {
          const input = e.target;
          // וודא שהקרסור לא אחרי הסימן %
          const maxPos = newDisplayValue.length - 1;
          const newCursorPos = Math.min(cursorPosition, maxPos);
          
          input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  /**
   * טיפול בעזיבת שדה כסף - פורמט הערך
   * @param {Event} e - אירוע עזיבת השדה
   */
  const handleCurrencyBlur = (e) => {
    const { name } = e.target;
    const value = inputs[name];
    
    if (value && value !== '' && value !== 0) {
      const formatted = `${formatNumberWithCommas(value)}₪`;
      setDisplayValues({
        ...displayValues,
        [name]: formatted
      });
    } else {
      // אם השדה ריק או 0, נקה את התצוגה כדי שיופיע placeholder
      setDisplayValues({
        ...displayValues,
        [name]: undefined
      });
    }
  };

  /**
   * טיפול בעזיבת שדה אחוז - פורמט הערך
   * @param {Event} e - אירוע עזיבת השדה
   */
  const handlePercentageBlur = (e) => {
    const { name } = e.target;
    const value = inputs[name];
    
    if (value && value !== '' && value !== 0) {
      setDisplayValues({
        ...displayValues,
        [name]: `${value}%`
      });
    } else {
      // אם השדה ריק או 0, נקה את התצוגה כדי שיופיע placeholder
      setDisplayValues({
        ...displayValues,
        [name]: undefined
      });
    }
  };

  /**
   * טיפול בכניסה לשדה כסף - אם יש ערך, הצג אותו ללא פורמט לעריכה
   * @param {Event} e - אירוע כניסה לשדה
   */
  const handleCurrencyFocus = (e) => {
    const { name } = e.target;
    const value = inputs[name];
    
    if (value && value !== '' && value !== 0) {
      // אם יש ערך, הצג אותו עם ₪ לעריכה
      setDisplayValues({
        ...displayValues,
        [name]: `${value}₪`
      });
      
      // מיקום הקרסור לפני הסימן ₪
      setTimeout(() => {
        const cursorPos = value.toString().length;
        e.target.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }
    // אם השדה ריק, לא מוסיפים כלום - רק placeholder
  };

  /**
   * טיפול בכניסה לשדה אחוז - אם יש ערך, הצג אותו ללא פורמט לעריכה
   * @param {Event} e - אירוע כניסה לשדה
   */
  const handlePercentageFocus = (e) => {
    const { name } = e.target;
    const value = inputs[name];
    
    if (value && value !== '' && value !== 0) {
      // אם יש ערך, הצג אותו עם % לעריכה
      setDisplayValues({
        ...displayValues,
        [name]: `${value}%`
      });
      
      // מיקום הקרסור לפני הסימן %
      setTimeout(() => {
        const cursorPos = value.toString().length;
        e.target.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }
    // אם השדה ריק, לא מוסיפים כלום - רק placeholder
  };

  /**
   * טיפול בכניסה לשדה - הסרת פורמט
   * @param {Event} e - אירוע כניסה לשדה
   */
  const handleFocus = (e) => {
    const { name } = e.target;
    const value = inputs[name];
    
    if (value && value !== '' && value !== 0) {
      setDisplayValues({
        ...displayValues,
        [name]: value.toString()
      });
    } else {
      // אם השדה ריק, נקה את התצוגה
      setDisplayValues({
        ...displayValues,
        [name]: ''
      });
    }
  };

  /**
   * קבלת ערך התצוגה של שדה
   * @param {string} fieldName - שם השדה
   * @returns {string} - ערך התצוגה
   */
  const getDisplayValue = (fieldName) => {
    // אם יש ערך תצוגה גולמי, השתמש בו
    if (displayValues[fieldName] !== undefined) {
      return displayValues[fieldName];
    }
    
    // אחרת, השתמש בערך מהמודל
    const value = inputs[fieldName];
    // אם השדה ריק או 0, החזר ריק כדי שיופיע placeholder
    if (!value && value !== 0) return '';
    if (value === 0) return '';
    
    return value.toString();
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
    <div className="card" style={{ marginBottom: '2rem' }}>
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
              type="text"
              id="propertyValue"
              name="propertyValue"
              className="form-control"
              value={getDisplayValue('propertyValue')}
              onChange={handleCurrencyChange}
              onFocus={handleCurrencyFocus}
              onBlur={handleCurrencyBlur}
              disabled={isCalculating}
              placeholder="סכום הרכישה"
            />
          </div>
          
          {/* אחוז הוצאות רכישה - עמלות, מיסים וכו' */}
          <div className="form-group">
            <label htmlFor="purchaseExpenseRate">אחוז הוצאות רכישה</label>
            <input
              type="text"
              id="purchaseExpenseRate"
              name="purchaseExpenseRate"
              className="form-control"
              value={getDisplayValue('purchaseExpenseRate')}
              onChange={handlePercentageChange}
              onFocus={handlePercentageFocus}
              onBlur={handlePercentageBlur}
              disabled={isCalculating}
              placeholder="אחוז הוצאות רכישה"
            />
          </div>
          
          {/* הון עצמי - כמה כסף המשקיע משקיע מכיסו */}
          <div className="form-group">
            <label htmlFor="equity">הון עצמי</label>
            <input
              type="text"
              id="equity"
              name="equity"
              className="form-control"
              value={getDisplayValue('equity')}
              onChange={handleCurrencyChange}
              onFocus={handleCurrencyFocus}
              onBlur={handleCurrencyBlur}
              disabled={isCalculating}
              placeholder="הון עצמי"
            />
          </div>
          
          {/* השקעה בנכס - שיפוצים וכו' */}
          <div className="form-group">
            <label htmlFor="renovationCost">השקעה בנכס</label>
            <input
              type="text"
              id="renovationCost"
              name="renovationCost"
              className="form-control"
              value={getDisplayValue('renovationCost')}
              onChange={handleCurrencyChange}
              onFocus={handleCurrencyFocus}
              onBlur={handleCurrencyBlur}
              disabled={isCalculating}
              placeholder="השקעה בנכס"
            />
          </div>
          
          {/* מס רכישה - סכום קבוע */}
          <div className="form-group">
            <label htmlFor="purchaseTax">מס רכישה</label>
            <input
              type="text"
              id="purchaseTax"
              name="purchaseTax"
              className="form-control"
              value={getDisplayValue('purchaseTax')}
              onChange={handleCurrencyChange}
              onFocus={handleCurrencyFocus}
              onBlur={handleCurrencyBlur}
              disabled={isCalculating}
              placeholder="מס רכישה"
            />
          </div>
          
          {/* טווח שנים - תקופת ההשקעה/משכנתא */}
          <div className="form-group">
            <label htmlFor="years">טווח שנים</label>
            <select
              id="years"
              name="years"
              className="form-control"
              value={inputs.years ?? ''}
              onChange={handleChange}

              disabled={isCalculating}
              style={{ 
                color: inputs.years ? '#000' : '#999'
              }}
            >
              <option value="" style={{ color: '#999' }}>בחר טווח שנים</option>
              <option value={10} style={{ color: '#000' }}>10 שנים</option>
              <option value={15} style={{ color: '#000' }}>15 שנים</option>
              <option value={20} style={{ color: '#000' }}>20 שנים</option>
              <option value={25} style={{ color: '#000' }}>25 שנים</option>
              <option value={30} style={{ color: '#000' }}>30 שנים</option>
            </select>
          </div>
          
          {/* מחיר שוק - ערך שוק נוכחי של הנכס */}
          <div className="form-group">
            <label htmlFor="marketValue">מחיר שוק</label>
            <input
              type="text"
              id="marketValue"
              name="marketValue"
              className="form-control"
              value={getDisplayValue('marketValue')}
              onChange={handleCurrencyChange}
              onFocus={handleCurrencyFocus}
              onBlur={handleCurrencyBlur}
              disabled={isCalculating}
              placeholder="מחיר שוק"
            />
          </div>
          
          {/* אחוז השבחה שנתי - כמה הנכס צפוי לעלות בערך */}
          <div className="form-group">
            <label htmlFor="annualAppreciationRate">אחוז השבחה שנתי</label>
            <input
              type="text"
              id="annualAppreciationRate"
              name="annualAppreciationRate"
              className="form-control"
              value={getDisplayValue('annualAppreciationRate')}
              onChange={handlePercentageChange}
              onFocus={handlePercentageFocus}
              onBlur={handlePercentageBlur}
              disabled={isCalculating}
              placeholder="אחוז השבחה שנתי"
            />
          </div>
          
          {/* הכנסה משכירות חודשית */}
          <div className="form-group">
            <label htmlFor="monthlyRent">הכנסה משכירות חודשית</label>
            <input
              type="text"
              id="monthlyRent"
              name="monthlyRent"
              className="form-control"
              value={getDisplayValue('monthlyRent')}
              onChange={handleCurrencyChange}
              onFocus={handleCurrencyFocus}
              onBlur={handleCurrencyBlur}
              disabled={isCalculating}
              placeholder="הכנסה משכירות חודשית"
            />
          </div>
          
          {/* אחוז הוצאה שנתית - תחזוקה, ניהול וכו' */}
          <div className="form-group">
            <label htmlFor="expenseRate">אחוז הוצאה שנתית</label>
            <input
              type="text"
              id="expenseRate"
              name="expenseRate"
              className="form-control"
              value={getDisplayValue('expenseRate')}
              onChange={handlePercentageChange}
              onFocus={handlePercentageFocus}
              onBlur={handlePercentageBlur}
              disabled={isCalculating}
              placeholder="אחוז הוצאה שנתית"
            />
          </div>
        </div>
        
        {/* ========================================
            כפתורי פעולה
            ======================================== */}
        <div className="actions">
          {/* כפתור חישוב - מפעיל את החישובים */}
          <button 
            type="submit" 
            className="btn" 
            disabled={isCalculating}
            style={{ opacity: isCalculating ? 0.7 : 1, cursor: isCalculating ? 'not-allowed' : 'pointer' }}
          >
            {isCalculating ? (
              <>
                <span style={{
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid var(--primary)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  animation: 'spin 2s linear infinite',
                  display: 'inline-block',
                  marginLeft: '10px'
                }}></span> מחשב...
              </>
            ) : 'חשב'}
          </button>
          
          {/* כפתור שמירה - שומר את הנתונים הנוכחיים */}
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onSave} 
            disabled={isCalculating}
            style={{ opacity: isCalculating ? 0.7 : 1, cursor: isCalculating ? 'not-allowed' : 'pointer' }}
          >
            שמור
          </button>
          
          {/* כפתור ניקוי - מאפס את כל השדות */}
          <button 
            type="button" 
            className="btn" 
            onClick={onClear} 
            style={{ 
              backgroundColor: '#e74c3c', 
              opacity: isCalculating ? 0.7 : 1, 
              cursor: isCalculating ? 'not-allowed' : 'pointer' 
            }} 
            disabled={isCalculating}
          >
            נקה
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