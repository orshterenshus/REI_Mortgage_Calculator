/**
 * ========================================
 * נקודת הכניסה הראשית לאפליקציה (Application Entry Point)
 * ========================================
 * 
 * תיאור:
 * קובץ זה הוא נקודת ההתחלה של אפליקציית React
 * הוא מאתחל את האפליקציה ומרנדר אותה לתוך ה-DOM
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - ReactDOM: לרינדור React ל-DOM
 * - axios: הגדרות גלובליות לתקשורת HTTP
 * - App: הרכיב הראשי של האפליקציה
 * - index.css: עיצוב גלובלי
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

/**
 * ========================================
 * הגדרות Axios גלובליות
 * ========================================
 */

/**
 * הגדרת כתובת השרת הבסיסית
 * כל הקריאות ל-API יעשו מול כתובת זו
 */
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * הגדרת Interceptor לבקשות
 * מוסיף אוטומטית את ה-token לכל בקשה אם קיים
 */
axios.interceptors.request.use(
  (config) => {
    // קריאת ה-token מה-localStorage
    const token = localStorage.getItem('token');
    
    // אם יש token, הוסף אותו לכותרת Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // במקרה של שגיאה בהגדרת הבקשה
    return Promise.reject(error);
  }
);

/**
 * הגדרת Interceptor לתגובות
 * מטפל בשגיאות אימות גלובליות
 */
axios.interceptors.response.use(
  (response) => {
    // החזר תגובה תקינה כמו שהיא
    return response;
  },
  (error) => {
    // טיפול בשגיאות
    if (error.response?.status === 401) {
      // משתמש לא מורשה - ה-token פג תוקף או לא תקין
      console.log('Authentication error detected');
      
      // בדוק אם זה לא קריאה למסלול הרגיש של התחברות/הרשמה
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      
      // אם זה לא endpoint של אימות, אל תעשה logout אוטומטי
      if (!isAuthEndpoint) {
        console.log('401 error on non-auth endpoint, not logging out automatically');
        return Promise.reject(error);
      }
      
      // רק עבור endpoints של אימות - נקה ועשה logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

/**
 * ========================================
 * אתחול ורינדור האפליקציה
 * ========================================
 */

/**
 * מציאת אלמנט ה-root ב-DOM
 * זה האלמנט שאליו תרונדר כל האפליקציה
 */
const rootElement = document.getElementById('root');

/**
 * יצירת React Root
 * משתמש ב-API החדש של React 18
 */
const root = ReactDOM.createRoot(rootElement);

/**
 * רינדור האפליקציה
 * StrictMode מפעיל בדיקות נוספות בזמן פיתוח
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * ========================================
 * Web Vitals (אופציונלי)
 * ========================================
 * 
 * אם רוצים למדוד ביצועים של האפליקציה,
 * ניתן להפעיל את reportWebVitals
 * 
 * דוגמה:
 * import reportWebVitals from './reportWebVitals';
 * reportWebVitals(console.log);
 */