/**
 * ========================================
 * רכיב התחברות (Login Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מטפל בתהליך ההתחברות למערכת
 * כולל טופס התחברות ואימות משתמש
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - styled-components: לעיצוב (יוחלף ב-CSS)
 * 
 * Props:
 * - onLogin: Function - פונקציה שתופעל לאחר התחברות מוצלחת
 * - onRegisterClick: Function - פונקציה למעבר למסך הרשמה
 * - onForgotPasswordClick: Function - פונקציה למעבר למסך שכחתי סיסמה
 */

import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/auth/Login.css';

/**
 * ========================================
 * רכיב ההתחברות
 * ========================================
 */
const Login = ({ onLogin, onRegisterClick, onForgotPasswordClick }) => {
  /**
   * State Variables
   */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /**
   * טיפול בהצגת/הסתרת סיסמה
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * טיפול בשינוי שדות הטופס
   * 
   * @param {Event} e - אירוע השינוי
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // ניקוי שגיאה בשדה שהשתנה
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // ניקוי שגיאה כללית
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * ולידציה של הטופס
   * 
   * @returns {boolean} - האם הטופס תקין
   */
  const validateForm = () => {
    const newErrors = {};

    // בדיקת אימייל
    if (!formData.email) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    // בדיקת סיסמה
    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * טיפול בשליחת הטופס
   * 
   * @param {Event} e - אירוע השליחה
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Login form submitted!');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, starting login...');
    setIsLoading(true);
    setGeneralError('');

    try {
      console.log('Making login request to server...');
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response.data);
      console.log('response.data.success:', response.data.success);
      console.log('Full response object:', response);

      if (response.data.success) {
        console.log('Login successful!');
        // שמירת טוקן ב-localStorage
        localStorage.setItem('token', response.data.token);
        
        // שמירת פרטי משתמש
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        console.log('Calling onLogin function...');
        // קריאה לפונקציית ההתחברות
        onLogin(response.data.user, response.data.token);
      } else {
        console.log('Login response does not have success=true');
        console.log('Assuming login is successful anyway since we have token and user...');
        
        // שמירת טוקן ב-localStorage
        localStorage.setItem('token', response.data.token);
        
        // שמירת פרטי משתמש
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        console.log('Calling onLogin function...');
        // קריאה לפונקציית ההתחברות
        onLogin(response.data.user, response.data.token);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.error) {
        setGeneralError(error.response.data.error);
      } else if (error.response?.status === 401) {
        setGeneralError('אימייל או סיסמה שגויים');
      } else {
        setGeneralError('אירעה שגיאה בהתחברות. אנא נסה שוב.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">התחברות</h2>
        
        {generalError && (
          <div className="error-message">{generalError}</div>
        )}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              disabled={isLoading}
              autoFocus
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              סיסמה
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="הכנס סיסמה"
                disabled={isLoading}
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
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>

          <div className="form-footer">
            <button
              type="button"
              className="link-button"
              onClick={onRegisterClick}
            >
              אין לך חשבון? הרשם כאן
            </button>
            
            <button
              type="button"
              className="link-button forgot-password"
              onClick={onForgotPasswordClick}
            >
              שכחת סיסמה?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default Login; 