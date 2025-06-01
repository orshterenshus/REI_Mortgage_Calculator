/**
 * ========================================
 * רכיב תיק אישי (MyPortfolio Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג את כל העסקאות השמורות של המשתמש המחובר
 * מאפשר צפייה, עריכה ומחיקה של עסקאות, השוואה בין עסקאות
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - onOpenDeal: Function - פונקציה לפתיחת עסקה בצפייה
 * - onCompareDeals: Function - פונקציה להשוואת עסקאות
 * - refreshTrigger: number - מונה לרענון אוטומטי
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/portfolio/MyPortfolio.css';

/**
 * ========================================
 * פונקציות עזר
 * ========================================
 */

/**
 * פורמט תאריך לעברית
 * 
 * @param {string} dateString - תאריך בפורמט ISO
 * @returns {string} תאריך מפורמט בעברית
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * פורמט מספר למטבע
 * 
 * @param {number} value - הערך לפורמט
 * @returns {string} ערך מפורמט במטבע
 */
const formatCurrency = (value) => {
  if (!value) return '₪0';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * פורמט אחוזים
 * 
 * @param {number} value - הערך לפורמט
 * @returns {string} ערך מפורמט באחוזים
 */
const formatPercentage = (value) => {
  if (!value && value !== 0) return '0%';
  return `${parseFloat(value).toFixed(1)}%`;
};

/**
 * ========================================
 * רכיב התיק האישי הראשי
 * ========================================
 */
const MyPortfolio = ({ onOpenDeal, onCompareDeals, refreshTrigger }) => {
  /**
   * State Variables
   */
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  
  // נתונים סטטיסטיים
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalPropertyValue: 0,
    totalLoansBalance: 0,
    totalEquity: 0,
    totalMonthlyRent: 0,
    averageLTV: 0
  });

  /**
   * טעינת עסקאות מהשרת
   */
  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/deals/my-deals', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const userDeals = response.data.deals || [];
        setDeals(userDeals);
        calculateStats(userDeals);
        
        // שמירה ב-localStorage
        localStorage.setItem('userDeals', JSON.stringify(userDeals));
        localStorage.setItem('userDealsTime', Date.now().toString());
      } else {
        setError(response.data.error || 'שגיאה בטעינת העסקאות');
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('שגיאה בטעינת העסקאות');
    } finally {
      setLoading(false);
    }
  };

  /**
   * חישוב סטטיסטיקות
   * 
   * @param {Array} dealsData - מערך העסקאות
   */
  const calculateStats = (dealsData) => {
    if (!dealsData || dealsData.length === 0) {
      setStats({
        totalDeals: 0,
        totalPropertyValue: 0,
        totalLoansBalance: 0,
        totalEquity: 0,
        totalMonthlyRent: 0,
        averageLTV: 0
      });
      return;
    }

    const totalDeals = dealsData.length;
    const totalPropertyValue = dealsData.reduce((sum, deal) => 
      sum + (deal.propertyValue || 0), 0
    );
    const totalEquity = dealsData.reduce((sum, deal) => 
      sum + (deal.equity || 0), 0
    );
    const totalMonthlyRent = dealsData.reduce((sum, deal) => 
      sum + (deal.monthlyRent || 0), 0
    );
    
    // חישוב יתרת הלוואות
    const totalLoansBalance = totalPropertyValue - totalEquity;
    
    // חישוב LTV ממוצע
    const averageLTV = totalPropertyValue > 0 ? (totalLoansBalance / totalPropertyValue) * 100 : 0;

    setStats({
      totalDeals,
      totalPropertyValue,
      totalLoansBalance,
      totalEquity,
      totalMonthlyRent,
      averageLTV
    });
  };

  /**
   * אפקט לטעינת עסקאות מה-localStorage
   */
  useEffect(() => {
    const cachedDeals = localStorage.getItem('userDeals');
    const cacheTime = localStorage.getItem('userDealsTime');
    
    // בדיקה אם יש נתונים בcache ואם הם עדיין תקפים (5 דקות)
    if (cachedDeals && cacheTime) {
      const cacheAge = Date.now() - parseInt(cacheTime);
      if (cacheAge < 5 * 60 * 1000) { // 5 דקות
        console.log('Loading deals from cache');
        const parsedDeals = JSON.parse(cachedDeals);
        setDeals(parsedDeals);
        calculateStats(parsedDeals);
        setLoading(false);
        return;
      }
    }
    
    // אם אין cache או שהוא לא תקף, טען מהשרת
    fetchDeals();
  }, []);

  /**
   * אפקט לרענון כאשר מתקבל trigger
   */
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refresh triggered, clearing cache and fetching new data');
      localStorage.removeItem('userDeals');
      localStorage.removeItem('userDealsTime');
      fetchDeals();
    }
  }, [refreshTrigger]);

  /**
   * טיפול בפתיחת עסקה לצפייה
   * 
   * @param {Object} deal - אובייקט העסקה
   */
  const handleViewDeal = (deal) => {
    onOpenDeal(deal);
  };

  /**
   * טיפול במחיקת עסקה
   * 
   * @param {string} dealId - מזהה העסקה למחיקה
   */
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק עסקה זו?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/deals/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // עדכון הרשימה המקומית
        const updatedDeals = deals.filter(deal => deal._id !== dealId);
        setDeals(updatedDeals);
        calculateStats(updatedDeals);
        
        // עדכון ה-cache
        localStorage.setItem('userDeals', JSON.stringify(updatedDeals));
        localStorage.setItem('userDealsTime', Date.now().toString());
      } else {
        setError('שגיאה במחיקת העסקה');
      }
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError('שגיאה במחיקת העסקה');
    }
  };

  /**
   * טיפול בבחירת עסקה להשוואה
   * 
   * @param {string} dealId - מזהה העסקה
   */
  const handleSelectDeal = (dealId) => {
    setSelectedDeals(prev => {
      if (prev.includes(dealId)) {
        return prev.filter(id => id !== dealId);
      } else {
        return [...prev, dealId];
      }
    });
  };

  /**
   * הפעלת מצב השוואה
   */
  const toggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedDeals([]);
  };

  /**
   * ביצוע השוואה
   */
  const handleCompare = () => {
    if (selectedDeals.length >= 2) {
      onCompareDeals(selectedDeals);
    }
  };

  // מצב טעינה
  if (loading) {
    return (
      <div className="portfolio-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // מצב שגיאה
  if (error) {
    return (
      <div className="portfolio-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <h2 className="portfolio-title">התיק שלי</h2>
        <div className="header-actions">
          {deals.length > 1 && (
            <button 
              className={`compare-button ${isCompareMode ? 'active' : ''}`}
              onClick={toggleCompareMode}
            >
              {isCompareMode ? 'ביטול השוואה' : 'השוואת עסקאות'}
            </button>
          )}
          {isCompareMode && selectedDeals.length >= 2 && (
            <button 
              className="execute-compare-button"
              onClick={handleCompare}
            >
              השווה ({selectedDeals.length})
            </button>
          )}
        </div>
      </div>

      {/* סיכום התיק */}
      {deals.length > 0 && (
        <div className="portfolio-summary">
          <h3 className="summary-title">סיכום התיק שלי</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">מספר נכסים</div>
              <div className="summary-value">{stats.totalDeals}</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">ערך נכסים</div>
              <div className="summary-value">{formatCurrency(stats.totalPropertyValue)}</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">יתרת הלוואות</div>
              <div className="summary-value">{formatCurrency(stats.totalLoansBalance)}</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">סך הון עצמי</div>
              <div className="summary-value">{formatCurrency(stats.totalEquity)}</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">הכנסה חודשית</div>
              <div className="summary-value">{formatCurrency(stats.totalMonthlyRent)}/חודש</div>
            </div>
            
            <div className="summary-item">
              <div className="summary-label">Portfolio LTV</div>
              <div className="summary-value">{formatPercentage(stats.averageLTV)}</div>
            </div>
          </div>
        </div>
      )}

      {deals.length === 0 ? (
        <div className="empty-state">
          <h3>אין עסקאות שמורות</h3>
          <p>כשתבצע חישוב ותשמור אותו, תוכל לראות אותו כאן</p>
        </div>
      ) : (
        <div className="deals-grid">
          {deals.map((deal) => (
            <div 
              key={deal._id} 
              className={`deal-card ${isCompareMode && selectedDeals.includes(deal._id) ? 'selected' : ''}`}
            >
              {isCompareMode && (
                <div className="deal-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedDeals.includes(deal._id)}
                    onChange={() => handleSelectDeal(deal._id)}
                  />
                </div>
              )}
              
              {!isCompareMode && (
                <div className="deal-actions">
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeal(deal._id);
                    }}
                    title="מחק עסקה"
                  >
                    🗑️
                  </button>
                </div>
              )}
              
              <div className="deal-content" onClick={() => !isCompareMode && handleViewDeal(deal)}>
                <h3 className="deal-title">
                  {deal.address || `עסקה ${deal._id?.slice(-6)}`}
                </h3>
                
                <div className="deal-details">
                  {deal.propertyValue && deal.propertyValue > 0 && (
                    <div className="detail-item">
                      <span className="label">מחיר נכס</span>
                      <span className="value">{formatCurrency(deal.propertyValue)}</span>
                    </div>
                  )}
                  
                  {deal.equity && deal.equity > 0 && (
                    <div className="detail-item">
                      <span className="label">הון עצמי</span>
                      <span className="value">{formatCurrency(deal.equity)}</span>
                    </div>
                  )}
                  
                  {deal.monthlyRent && deal.monthlyRent > 0 && (
                    <div className="detail-item">
                      <span className="label">שכירות חודשית</span>
                      <span className="value">{formatCurrency(deal.monthlyRent)}</span>
                    </div>
                  )}
                </div>
                
                <div className="deal-date">
                  נוצר ב-{formatDate(deal.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default MyPortfolio; 