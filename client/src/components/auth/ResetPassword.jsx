/**
 * ========================================
 * רכיב איפוס סיסמה (ResetPassword Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מאפשר למשתמש לאפס את הסיסמה שלו באמצעות טוקן
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - react-router-dom: לניהול ניתוב
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - onBackToLogin: Function - פונקציה לחזרה למסך התחברות
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../../styles/auth/ResetPassword.css';

/**
 * ========================================
 * רכיב איפוס סיסמה
 * ========================================
 */
const ResetPassword = ({ onBackToLogin }) => {
  /**
   * קבלת הטוקן מה-URL
   */
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  /**
   * State Variables
   */
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    // ולידציה
    if (!password || !confirmPassword) {
      setError('אנא מלא את כל השדות');
      return;
    }

    if (password.length < 5) {
      setError('הסיסמה חייבת להכיל לפחות 5 תווים');
      return;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (!token) {
      setError('טוקן לא תקין');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password
      });

      if (response.data.success) {
        setMessage('הסיסמה אופסה בהצלחה! מעביר אותך להתחברות...');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('אירעה שגיאה באיפוס הסיסמה');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2 className="reset-password-title">איפוס סיסמה</h2>
      <p className="reset-password-subtitle">
        הזן סיסמה חדשה לחשבון שלך
      </p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="reset-password-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="password">סיסמה חדשה</label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="הזן סיסמה חדשה"
            disabled={isLoading}
            autoFocus
          />
          <small className="field-help">מינימום 5 תווים</small>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">אימות סיסמה</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="הזן שוב את הסיסמה"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'מאפס...' : 'אפס סיסמה'}
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
export default ResetPassword; 