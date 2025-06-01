/**
 * ========================================
 * רכיב תצוגת תיק לקוח (ClientPortfolioView Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג את תיק העסקאות של לקוח ספציפי
 * כולל סיכום כללי ורשימת כל העסקאות
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - clientEmail: string - מייל הלקוח
 * - onOpenDeal: Function - פונקציה לפתיחת עסקה בצפייה
 * - onBack: Function - פונקציה לחזרה לרשימת הלקוחות
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/portfolio/ClientPortfolioView.css';

/**
 * ========================================
 * פונקציות עזר
 * ========================================
 */

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
 * חישוב סטטיסטיקות תיק הלקוח
 * 
 * @param {Array} deals - מערך עסקאות
 * @returns {Object} אובייקט סטטיסטיקות
 */
const calculateStats = (deals) => {
  const totalDeals = deals.length;
  const totalInvestment = deals.reduce((sum, deal) => sum + (deal.equity || 0), 0);
  const totalPropertyValue = deals.reduce((sum, deal) => sum + (deal.propertyValue || 0), 0);
  const totalMonthlyRent = deals.reduce((sum, deal) => sum + (deal.monthlyRent || 0), 0);

  const dealsWithYield = deals.filter(deal => 
    deal.results && 
    deal.results.equityYield !== null && 
    deal.results.equityYield !== undefined
  );

  const averageYield = dealsWithYield.length > 0 
    ? dealsWithYield.reduce((sum, deal) => sum + deal.results.equityYield, 0) / dealsWithYield.length
    : 0;

  return {
    totalDeals,
    totalInvestment,
    totalPropertyValue,
    totalMonthlyRent,
    averageYield
  };
};

/**
 * ========================================
 * רכיב תצוגת תיק הלקוח הראשי
 * ========================================
 */
const ClientPortfolioView = ({ clientEmail, onOpenDeal, onBack }) => {
  /**
   * State Variables
   */
  const [client, setClient] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * טעינת נתוני הלקוח והעסקאות שלו
   */
  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('לא נמצא טוקן אימות');
        return;
      }

      // טעינת פרטי לקוח
      const clientResponse = await axios.get(`http://localhost:5000/api/auth/users/${encodeURIComponent(clientEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (clientResponse.data.success) {
        setClient(clientResponse.data.user);
      }

      // טעינת עסקאות הלקוח
      const dealsResponse = await axios.get(`http://localhost:5000/api/deals/client/${encodeURIComponent(clientEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (dealsResponse.data.success) {
        setDeals(dealsResponse.data.deals || []);
      } else {
        setError(dealsResponse.data.error || 'שגיאה בטעינת עסקאות הלקוח');
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  /**
   * אפקט לטעינת נתונים בטעינה הראשונה
   */
  useEffect(() => {
    if (clientEmail) {
      fetchClientData();
    }
  }, [clientEmail]);

  /**
   * טיפול בלחיצה על עסקה
   * 
   * @param {Object} deal - אובייקט העסקה
   */
  const handleDealClick = (deal) => {
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
        setDeals(deals.filter(deal => deal._id !== dealId));
      } else {
        setError('שגיאה במחיקת העסקה');
      }
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError('שגיאה במחיקת העסקה');
    }
  };

  // מצב טעינה
  if (loading) {
    return (
      <div className="client-view-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // מצב שגיאה
  if (error) {
    return (
      <div className="client-view-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const stats = calculateStats(deals);

  return (
    <div className="client-view-container">
      <div className="view-header">
        <button className="back-button" onClick={onBack}>
          ← חזרה לתיקי לקוחות
        </button>
        
        <div className="client-info">
          <h1>{client?.fullName || clientEmail}</h1>
          <div className="email">{clientEmail}</div>
        </div>
      </div>

      <div className="summary-card">
        <h2>סיכום תיק</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="label">מספר עסקאות</div>
            <div className="value">{stats.totalDeals}</div>
          </div>
          
          <div className="stat-item">
            <div className="label">סך השקעה</div>
            <div className="value">{formatCurrency(stats.totalInvestment)}</div>
          </div>
          
          <div className="stat-item">
            <div className="label">ערך נכסים כולל</div>
            <div className="value">{formatCurrency(stats.totalPropertyValue)}</div>
          </div>
          
          <div className="stat-item">
            <div className="label">הכנסה חודשית</div>
            <div className="value">{formatCurrency(stats.totalMonthlyRent)}</div>
          </div>
          
          <div className="stat-item">
            <div className="label">תשואה ממוצעת</div>
            <div className={`value ${stats.averageYield > 0 ? 'positive' : ''}`}>
              {formatPercentage(stats.averageYield)}
            </div>
          </div>
        </div>
      </div>

      <div className="deals-section">
        <h2 className="section-title">
          עסקאות
          <span className="count-badge">{deals.length}</span>
        </h2>

        {deals.length === 0 ? (
          <div className="empty-state">
            <h3>אין עסקאות</h3>
            <p>הלקוח עדיין לא ביצע חישובים</p>
          </div>
        ) : (
          <div className="deals-grid">
            {deals.map((deal) => (
              <div 
                key={deal._id} 
                className="deal-card"
                onClick={() => handleDealClick(deal)}
              >
                <div className="deal-header">
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
                  <h3 className="deal-title">
                    {deal.address || `עסקה ${deal._id?.slice(-6)}`}
                  </h3>
                </div>
                
                <div className="deal-details">
                  {deal.propertyValue && deal.propertyValue > 0 && (
                    <div className="detail-row">
                      <span className="label">מחיר נכס:</span>
                      <span className="value">{formatCurrency(deal.propertyValue)}</span>
                    </div>
                  )}
                  
                  {deal.equity && deal.equity > 0 && (
                    <div className="detail-row">
                      <span className="label">הון עצמי:</span>
                      <span className="value">{formatCurrency(deal.equity)}</span>
                    </div>
                  )}
                  
                  {deal.monthlyRent && deal.monthlyRent > 0 && (
                    <div className="detail-row">
                      <span className="label">שכירות חודשית:</span>
                      <span className="value">{formatCurrency(deal.monthlyRent)}</span>
                    </div>
                  )}
                </div>
                
                <div className="deal-date">
                  נוצר ב-{formatDate(deal.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default ClientPortfolioView; 