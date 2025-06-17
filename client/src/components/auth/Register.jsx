/**
 * ========================================
 * רכיב הרשמה (Register Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג טופס הרשמה למשתמש חדש
 * יוצר חשבון חדש במערכת עם שם מלא, אימייל וסיסמה
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - onRegister: Function - פונקציה שנקראת בהרשמה מוצלחת (עוברת להתחברות)
 * - switchToLogin: Function - פונקציה למעבר למסך התחברות
 */

import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/auth/Register.css';

/**
 * ========================================
 * רכיב ההרשמה הראשי
 * ========================================
 */
const Register = ({ onRegister, switchToLogin }) => {
  /**
   * State Variables
   */
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * טיפול בהצגת/הסתרת סיסמה
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * טיפול בהצגת/הסתרת אימות סיסמה
   */
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  /**
   * טיפול בשינוי ערכי השדות
   * 
   * @param {Event} e - אירוע השינוי
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // ניקוי שגיאת השדה הספציפי
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // ניקוי הודעות כלליות
    if (error) setError('');
  };

  /**
   * ולידציה מלאה של הטופס
   * 
   * @returns {boolean} האם הטופס תקין
   */
  const validateForm = () => {
    const errors = {};
    
    // בדיקת שם מלא
    if (!formData.fullName.trim()) {
      errors.fullName = 'יש להזין שם מלא';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'השם חייב להכיל לפחות 2 תווים';
    }
    
    // בדיקת אימייל
    if (!formData.email.trim()) {
      errors.email = 'יש להזין כתובת מייל';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'כתובת האימייל אינה תקינה';
      }
    }
    
    // בדיקת סיסמה
    if (!formData.password) {
      errors.password = 'יש להזין סיסמא';
    } else if (formData.password.length < 5) {
      errors.password = 'הסיסמה חייבת להכיל לפחות 5 תווים';
    }
    
    // בדיקת אימות סיסמה
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'יש לאמת את הסיסמא';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * שליחת טופס ההרשמה
   * 
   * @param {Event} e - אירוע השליחה
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ולידציה
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting registration:', { 
        fullName: formData.fullName,
        email: formData.email 
      });
      
      // קריאה לשרת
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('Registration response:', response.data);
      
      // הצגת הודעת הצלחה
      setSuccess('נרשמת בהצלחה! מעביר אותך להתחברות...');
      
      // ניקוי הטופס
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // המתנה קצרה ומעבר להתחברות
      setTimeout(() => {
        switchToLogin();
      }, 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      
      // טיפול בשגיאות
      if (err.response?.status === 400) {
        // שגיאת ולידציה מהשרת
        if (err.response.data.message?.includes('Email already exists')) {
          setFieldErrors({ email: 'כתובת המייל כבר רשומה במערכת' });
        } else if (err.response.data.errors) {
          // שגיאות ולידציה מפורטות
          const serverErrors = {};
          err.response.data.errors.forEach(error => {
            if (error.param === 'password') {
              serverErrors.password = 'הסיסמא חייבת להכיל לפחות 5 תווים';
            } else if (error.param === 'fullName') {
              serverErrors.fullName = 'שם מלא לא תקין';
            } else if (error.param === 'email') {
              serverErrors.email = 'כתובת מייל לא תקינה';
            }
          });
          setFieldErrors(serverErrors);
        } else {
          setError(err.response.data.message || 'שגיאה בהרשמה');
        }
      } else if (err.response?.status === 500) {
        setError('שגיאת שרת. אנא נסה שוב מאוחר יותר');
      } else if (err.request) {
        setError('לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט');
      } else {
        setError('שגיאה בהרשמה. אנא נסה שוב');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * בדיקת חוזק הסיסמה
   * 
   * @returns {Object} מידע על חוזק הסיסמה
   */
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: '', color: '' };
    
    if (password.length < 5) {
      return { strength: 'חלשה מדי', color: '#dc3545' };
    } else if (password.length < 8) {
      return { strength: 'בינונית', color: '#ffc107' };
    } else {
      return { strength: 'חזקה', color: '#28a745' };
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="register-container">
      <h2 className="register-title">הרשמה</h2>
      
      {/* הודעות סטטוס */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form className="register-form" onSubmit={handleSubmit}>
        {/* שדה שם מלא */}
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">שם מלא</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={`form-input ${fieldErrors.fullName ? 'error' : ''}`}
            value={formData.fullName}
            onChange={handleChange}
            placeholder=""
            required
            disabled={isLoading}
            autoComplete="name"
            autoFocus
          />
          {fieldErrors.fullName && (
            <small className="field-help error">{fieldErrors.fullName}</small>
          )}
        </div>
        
        {/* שדה אימייל */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">מייל</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${fieldErrors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            placeholder=""
            required
            disabled={isLoading}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <small className="field-help error">{fieldErrors.email}</small>
          )}
        </div>
        
        {/* שדה סיסמה */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">סיסמא</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className={`form-input ${fieldErrors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder=""
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.12 14.12L9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.88 14.12L14.12 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17C7.5 17 3.5 13.4 3.5 12S7.5 7 12 7 20.5 10.6 20.5 12 16.5 17 12 17Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <small className="field-help error">{fieldErrors.password}</small>
          ) : formData.password ? (
            <small className="field-help" style={{ color: passwordStrength.color }}>
              חוזק הסיסמא: {passwordStrength.strength}
            </small>
          ) : (
            <small className="field-help">מינימום 5 תווים</small>
          )}
        </div>
        
        {/* שדה אימות סיסמה */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">אימות סיסמא</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder=""
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={toggleConfirmPasswordVisibility}
              tabIndex="-1"
            >
              {showConfirmPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.12 14.12L9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.88 14.12L14.12 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17C7.5 17 3.5 13.4 3.5 12S7.5 7 12 7 20.5 10.6 20.5 12 16.5 17 12 17Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <small className="field-help error">{fieldErrors.confirmPassword}</small>
          )}
        </div>
        
        {/* כפתור הרשמה */}
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || success}
        >
          {isLoading ? (
            <>
              נרשם
              <span className="loading-spinner"></span>
            </>
          ) : (
            'הירשם'
          )}
        </button>
      </form>
      
      {/* קישור להתחברות */}
      <p className="switch-link">
        כבר יש לך חשבון? <a onClick={switchToLogin}>התחבר כאן</a>
      </p>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default Register; 