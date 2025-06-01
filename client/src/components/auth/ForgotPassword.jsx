/**
 * ========================================
 * רכיב שכחתי סיסמה (ForgotPassword Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מאפשר למשתמש לבקש איפוס סיסמה באמצעות אימייל
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - onBackToLogin: Function - פונקציה לחזרה למסך התחברות
 */

import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/auth/ForgotPassword.css';

/**
 * ========================================
 * רכיב שכחתי סיסמה
 * ========================================
 */
const ForgotPassword = ({ onBackToLogin }) => {
  /**
   * State Variables
   */
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * טיפול בשליחת הטופס
   * 
   * @param {Event} e - אירוע השליחה
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('אנא הזן כתובת אימייל');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email
      });

      if (response.data.success) {
        setMessage('קישור לאיפוס סיסמה נשלח לאימייל שלך');
        setEmail('');
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('אירעה שגיאה בשליחת הבקשה');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">שכחת סיסמה?</h2>
      <p className="forgot-password-subtitle">
        הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
      </p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">אימייל</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            disabled={isLoading}
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'שולח...' : 'שלח קישור לאיפוס'}
        </button>

        <button
          type="button"
          className="back-link"
          onClick={onBackToLogin}
        >
          חזרה להתחברות
        </button>
      </form>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default ForgotPassword; 