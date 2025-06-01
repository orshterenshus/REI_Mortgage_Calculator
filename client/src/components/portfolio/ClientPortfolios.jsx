/**
 * ========================================
 * רכיב תיקי לקוחות (ClientPortfolios Component)
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
import '../../styles/portfolio/ClientPortfolios.css';

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
      <div className="portfolios-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // מצב שגיאה
  if (error) {
    return (
      <div className="portfolios-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="portfolios-container">
      <div className="portfolios-header">
        <h2 className="portfolios-title">תיקי לקוחות</h2>
        <div className="header-actions">
          <input
            type="text"
            className="search-box"
            placeholder="חיפוש לקוח (שם או מייל)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <h3>לא נמצאו לקוחות</h3>
              <p>נסה לשנות את מילות החיפוש</p>
            </>
          ) : (
            <>
              <h3>אין לקוחות עם עסקאות</h3>
              <p>כשלקוחות יבצעו חישובים, הם יופיעו כאן</p>
            </>
          )}
        </div>
      ) : (
        <div className="clients-grid">
          {filteredClients.map((client) => {
            const totalInvestment = calculateTotalInvestment(client.deals);
            const totalPropertyValue = calculateTotalPropertyValue(client.deals);
            const totalMonthlyRent = calculateTotalMonthlyRent(client.deals);
            const averageYield = calculateAverageYield(client.deals);
            const lastDeal = client.deals.length > 0 ? 
              client.deals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

            return (
              <div 
                key={client._id} 
                className="client-card"
                onClick={() => handleClientClick(client)}
              >
                <div className="client-content">
                  <h3 className="client-title">
                    {client.fullName || client._id}
                  </h3>
                  
                  <div className="client-email">{client._id}</div>
                  
                  <div className="client-details">
                    <div className="detail-item">
                      <span className="label">מספר נכסים</span>
                      <span className="value">{client.deals.length}</span>
                    </div>
                    
                    {totalPropertyValue > 0 && (
                      <div className="detail-item">
                        <span className="label">ערך נכסים</span>
                        <span className="value">{formatCurrency(totalPropertyValue)}</span>
                      </div>
                    )}
                    
                    {totalInvestment > 0 && (
                      <div className="detail-item">
                        <span className="label">הון עצמי</span>
                        <span className="value">{formatCurrency(totalInvestment)}</span>
                      </div>
                    )}
                    
                    {totalMonthlyRent > 0 && (
                      <div className="detail-item">
                        <span className="label">הכנסה חודשית</span>
                        <span className="value">{formatCurrency(totalMonthlyRent)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="client-date">
                    {lastDeal ? `עסקה אחרונה: ${formatDate(lastDeal.createdAt)}` : 'אין עסקאות'}
                  </div>
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