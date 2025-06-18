/**
 * ========================================
 * רכיב תיקי לקוחות מודרני (Modern Client Portfolios)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מיועד למנהלים בלבד ומאפשר צפייה בתיקי כל הלקוחות
 * מציג רשימת לקוחות עם סיכום העסקאות שלהם
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - CSS: לעיצוב הרכיב
 * 
 * Props:
 * - onOpenDeal: Function - פונקציה לפתיחת עסקה בצפייה
 * - onViewClientPortfolio: Function - פונקציה לצפייה בתיק לקוח ספציפי
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientPortfolios.css';

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
    day: 'numeric'
  });
};

/**
 * חישוב סך השקעה כולל
 * 
 * @param {Array} deals - מערך עסקאות
 * @returns {number} סך ההשקעה
 */
const calculateTotalInvestment = (deals) => {
  return deals.reduce((total, deal) => total + (deal.equity || 0), 0);
};

/**
 * חישוב ערך נכסים כולל
 * 
 * @param {Array} deals - מערך עסקאות
 * @returns {number} סך ערך הנכסים
 */
const calculateTotalPropertyValue = (deals) => {
  return deals.reduce((total, deal) => total + (deal.propertyValue || 0), 0);
};

/**
 * חישוב הכנסות חודשיות
 * 
 * @param {Array} deals - מערך עסקאות
 * @returns {number} סך הכנסות חודשיות
 */
const calculateTotalMonthlyRent = (deals) => {
  return deals.reduce((total, deal) => total + (deal.monthlyRent || 0), 0);
};

/**
 * חישוב תשואה ממוצעת
 * 
 * @param {Array} deals - מערך עסקאות
 * @returns {number} תשואה ממוצעת
 */
const calculateAverageYield = (deals) => {
  const dealsWithYield = deals.filter(deal => 
    deal.results && 
    deal.results.equityYield !== null && 
    deal.results.equityYield !== undefined
  );
  
  if (dealsWithYield.length === 0) return 0;
  
  const totalYield = dealsWithYield.reduce((sum, deal) => 
    sum + deal.results.equityYield, 0
  );
  
  return totalYield / dealsWithYield.length;
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
 * רכיב תיקי הלקוחות הראשי
 * ========================================
 */
const ClientPortfolios = ({ onOpenDeal, onViewClientPortfolio }) => {
  /**
   * State Variables
   */
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalValue'); // totalValue, name, deals, yield

  /**
   * טעינת תיקי לקוחות מהשרת
   */
  const fetchClientPortfolios = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/deals/client-portfolios', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setClients(response.data.clients || []);
      } else {
        setError(response.data.error || 'שגיאה בטעינת תיקי הלקוחות');
      }
    } catch (err) {
      console.error('Error fetching client portfolios:', err);
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  /**
   * אפקט לטעינת נתונים בטעינה הראשונה
   */
  useEffect(() => {
    fetchClientPortfolios();
  }, []);

  /**
   * טיפול בלחיצה על לקוח
   * 
   * @param {Object} client - אובייקט הלקוח
   */
  const handleClientClick = (client) => {
    console.log('Clicking on client:', client);
    console.log('Client email:', client._id);
    onViewClientPortfolio(client._id);
  };

  /**
   * סינון לקוחות לפי חיפוש
   */
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(searchLower) ||
      client._id?.toLowerCase().includes(searchLower)
    );
  });

  // מצב טעינה
  if (loading) {
    return (
      <div className="client-portfolios-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>טוען תיקי לקוחות...</p>
        </div>
      </div>
    );
  }

  // מצב שגיאה
  if (error) {
    return (
      <div className="client-portfolios-container">
        <div className="error-section">
          <div className="error-icon">⚠️</div>
          <h2>שגיאה בטעינת תיקי הלקוחות</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchClientPortfolios}>
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // סינון וסידור לקוחות
  const filteredAndSortedClients = filteredClients
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.fullName || a._id).localeCompare(b.fullName || b._id);
        case 'deals':
          return b.totalDeals - a.totalDeals;
        case 'yield':
          return calculateAverageYield(b.deals) - calculateAverageYield(a.deals);
        case 'totalValue':
        default:
          return calculateTotalPropertyValue(b.deals) - calculateTotalPropertyValue(a.deals);
      }
    });

  // חישוב סטטיסטיקות כלליות
  const totalClients = clients.length;
  const totalDeals = clients.reduce((sum, client) => sum + client.totalDeals, 0);
  const totalPortfolioValue = clients.reduce((sum, client) => 
    sum + calculateTotalPropertyValue(client.deals), 0);
  const totalInvestment = clients.reduce((sum, client) => 
    sum + calculateTotalInvestment(client.deals), 0);

  return (
    <div className="client-portfolios-container">
      
      {/* כותרת ראשית */}
      <div className="portfolios-header">
        <div className="header-content">
          <h1>ניהול תיקי לקוחות</h1>
          <p>מערכת ניהול מתקדמת לכל תיקי הלקוחות במערכת</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{totalClients}</span>
            <span className="stat-label">לקוחות פעילים</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{totalDeals}</span>
            <span className="stat-label">עסקאות כולל</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatCurrency(totalPortfolioValue)}</span>
            <span className="stat-label">שווי כולל</span>
          </div>
        </div>
      </div>

      {/* כלי ניהול */}
      <div className="management-tools">
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="חפש לקוח לפי שם או אימייל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="sort-section">
          <label htmlFor="sort-select">מיין לפי:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="totalValue">שווי תיק</option>
            <option value="name">שם לקוח</option>
            <option value="deals">מספר עסקאות</option>
            <option value="yield">תשואה ממוצעת</option>
          </select>
        </div>
      </div>

      {/* רשימת לקוחות */}
      {filteredAndSortedClients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>לא נמצאו לקוחות</h3>
          <p>אין לקוחות התואמים לחיפוש שלך</p>
        </div>
      ) : (
        <div className="clients-grid">
          {filteredAndSortedClients.map((client) => {
            const totalValue = calculateTotalPropertyValue(client.deals);
            const totalInvestment = calculateTotalInvestment(client.deals);
            const monthlyRent = calculateTotalMonthlyRent(client.deals);
            const avgYield = calculateAverageYield(client.deals);

            return (
              <div 
                key={client._id} 
                className="client-card"
                onClick={() => handleClientClick(client)}
              >
                
                {/* כותרת לקוח */}
                <div className="client-header">
                  <div className="client-avatar">
                    {client.fullName ? client.fullName.charAt(0) : client._id.charAt(0)}
                  </div>
                  <div className="client-info">
                    <h3>{client.fullName || 'לא נרשם שם'}</h3>
                    <p className="client-email">{client._id}</p>
                  </div>
                  <div className="client-badge">
                    {client.totalDeals} עסקאות
                  </div>
                </div>

                {/* מטריקות לקוח */}
                <div className="client-metrics">
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">שווי תיק:</span>
                      <span className="metric-value primary">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">השקעה:</span>
                      <span className="metric-value">{formatCurrency(totalInvestment)}</span>
                    </div>
                  </div>
                  
                  <div className="metric-row">
                    <div className="metric">
                      <span className="metric-label">הכנסה חודשית:</span>
                      <span className="metric-value success">{formatCurrency(monthlyRent)}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">תשואה ממוצעת:</span>
                      <span className="metric-value accent">{formatPercentage(avgYield)}</span>
                    </div>
                  </div>
                </div>

                {/* עסקאות אחרונות */}
                <div className="recent-deals">
                  <h4>עסקאות אחרונות</h4>
                  {client.deals.slice(0, 2).map((deal, index) => (
                    <div key={index} className="deal-preview">
                      <span className="deal-address">{deal.address || 'כתובת לא זמינה'}</span>
                      <span className="deal-value">{formatCurrency(deal.propertyValue)}</span>
                    </div>
                  ))}
                  {client.totalDeals > 2 && (
                    <p className="more-deals">ועוד {client.totalDeals - 2} עסקאות...</p>
                  )}
                </div>

                {/* כפתור פעולה */}
                <div className="card-action">
                  <button className="view-portfolio-btn">
                    <span className="btn-icon">👁️</span>
                    צפה בתיק המלא
                  </button>
                </div>

              </div>
            );
          })}
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
export default ClientPortfolios; 