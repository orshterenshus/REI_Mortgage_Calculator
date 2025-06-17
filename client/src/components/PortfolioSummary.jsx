/**
 * ========================================
 * רכיב סיכום התיק (Portfolio Summary Component)
 * ========================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PortfolioSummary.css';

const PortfolioSummary = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolioSummary();
  }, []);

  const fetchPortfolioSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/deals/my-deals', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const deals = response.data;
      
      // חישוב סטטיסטיקות
      const totalInvestment = deals.reduce((sum, deal) => sum + (deal.propertyPrice || 0), 0);
      const totalProperties = deals.length;
      const avgROI = deals.length > 0 ? 
        deals.reduce((sum, deal) => sum + (deal.roi || 0), 0) / deals.length : 0;
      
      // חישוב ערך נוכחי משוער
      const currentValue = deals.reduce((sum, deal) => {
        const appreciationRate = 0.03; // 3% שנתי
        const yearsOwned = deal.yearsOwned || 1;
        return sum + (deal.propertyPrice || 0) * Math.pow(1 + appreciationRate, yearsOwned);
      }, 0);

      setPortfolioData({
        deals,
        totalInvestment,
        totalProperties,
        avgROI,
        currentValue,
        totalProfit: currentValue - totalInvestment
      });
      
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('שגיאה בטעינת נתוני התיק');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="portfolio-summary-container">
        <div className="loading-spinner">טוען נתונים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-summary-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="portfolio-summary-container">
      <div className="summary-header">
        <h1 className="summary-title">סיכום התיק שלי</h1>
        <p className="summary-subtitle">סקירה כללית של כל ההשקעות שלך</p>
      </div>

      {/* כרטיסי סטטיסטיקה */}
      <div className="stats-grid">
        <div className="stat-card total-properties">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{portfolioData?.totalProperties || 0}</div>
            <div className="stat-label">נכסים בתיק</div>
          </div>
        </div>

        <div className="stat-card total-investment">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(portfolioData?.totalInvestment || 0)}</div>
            <div className="stat-label">סך השקעה</div>
          </div>
        </div>

        <div className="stat-card current-value">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(portfolioData?.currentValue || 0)}</div>
            <div className="stat-label">ערך נוכחי משוער</div>
          </div>
        </div>

        <div className="stat-card profit">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value profit-positive">{formatCurrency(portfolioData?.totalProfit || 0)}</div>
            <div className="stat-label">רווח משוער</div>
          </div>
        </div>
      </div>

      {/* תרשים ROI ממוצע */}
      <div className="roi-section">
        <h3>ROI ממוצע</h3>
        <div className="roi-display">
          <div className="roi-circle">
            <span className="roi-percentage">{(portfolioData?.avgROI || 0).toFixed(1)}%</span>
          </div>
          <p className="roi-description">תשואה שנתית ממוצעת על ההשקעה</p>
        </div>
      </div>

      {/* רשימת נכסים מקוצרת */}
      <div className="properties-preview">
        <h3>הנכסים שלי</h3>
        <div className="properties-list">
          {portfolioData?.deals?.slice(0, 3).map((deal, index) => (
            <div key={index} className="property-card">
              <div className="property-info">
                <h4>{deal.address || `נכס ${index + 1}`}</h4>
                <p className="property-price">{formatCurrency(deal.propertyPrice || 0)}</p>
              </div>
              <div className="property-roi">
                <span className="roi-badge">{(deal.roi || 0).toFixed(1)}% ROI</span>
              </div>
            </div>
          ))}
          
          {portfolioData?.deals?.length > 3 && (
            <div className="more-properties">
              <span>ועוד {portfolioData.deals.length - 3} נכסים...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary; 