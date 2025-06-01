/**
 * ========================================
 * רכיב כותרת האפליקציה (AppHeader Component)
 * ========================================
 * 
 * תיאור:
 * רכיב מעטפת לכותרת האפליקציה
 * מנהל את ההתממשקות עם פונקציות האפליקציה הראשית
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - Header: רכיב הכותרת עצמו
 * 
 * Props:
 * - activeTab: string - הטאב הפעיל כרגע ('calculator', 'portfolio', 'clients')
 * - setActiveTab: Function - פונקציה לשינוי הטאב הפעיל
 * - user: Object - אובייקט המשתמש המחובר או null
 * - onLogout: Function - פונקציה להתנתקות
 * - onLoginClick: Function - פונקציה להצגת מסך התחברות
 */

import React from 'react';
import Header from './Header';

/**
 * ========================================
 * רכיב כותרת האפליקציה
 * ========================================
 * 
 * רכיב זה משמש כמעטפת לוגית לרכיב Header
 * ומעביר את כל ה-props הנדרשים
 */
const AppHeader = ({ activeTab, setActiveTab, user, onLogout, onLoginClick }) => {
  /**
   * העברת כל ה-props לרכיב Header
   * 
   * הרכיב הזה משמש כשכבת ביניים שיכולה בעתיד
   * להוסיף לוגיקה נוספת לפני העברת הנתונים לכותרת
   */
  return (
    <Header
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={onLogout}
      onLoginClick={onLoginClick}
    />
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default AppHeader; 