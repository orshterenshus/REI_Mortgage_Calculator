/**
 * ========================================
 * רכיב סיכום התיק (Portfolio Summary Component)
 * ========================================
 */

import React, { useState, useEffect } from 'react';
import './PortfolioSummary.css';
import { useDeals } from '../contexts/DealsContext';

const PortfolioSummary = ({ onNavigateToCalculator, onNavigateToPortfolio, onOpenDeal }) => {
  const { deals, loading, error, refreshDeals, isDataStale } = useDeals();

  // פונקציה לחישוב סטטיסטיקות התיק
  const calculatePortfolioStats = () => {
    if (!Array.isArray(deals)) {
      return {
        totalProperties: 0,
        totalValue: 0,
        totalEquity: 0,
        monthlyRent: 0,
        monthlyCashFlow: 0,
        totalYield: 0
      };
    }

    const stats = deals.reduce((acc, deal) => {
      const propertyValue = deal.propertyValue || 0;
      const equity = deal.equity || 0;
      const monthlyRent = deal.monthlyRent || 0;
      
      return {
        totalProperties: acc.totalProperties + 1,
        totalValue: acc.totalValue + propertyValue,
        totalEquity: acc.totalEquity + equity,
        monthlyRent: acc.monthlyRent + monthlyRent,
        monthlyCashFlow: acc.monthlyCashFlow + monthlyRent
      };
    }, {
      totalProperties: 0,
      totalValue: 0,
      totalEquity: 0,
      monthlyRent: 0,
      monthlyCashFlow: 0
    });

    // חישוב תשואה שנתית
    stats.totalYield = stats.totalEquity > 0 
      ? ((stats.monthlyRent * 12) / stats.totalEquity) * 100 
      : 0;

    return stats;
  };

  const stats = calculatePortfolioStats();

  // פונקציה לצפייה בפרטי עסקה
  const handleViewDeal = (deal) => {
    if (onOpenDeal) {
      onOpenDeal(deal);
    }
  };

  // פונקציה לעריכת עסקה  
  const handleEditDeal = (deal) => {
    // שמירת נתוני העסקה ב-sessionStorage לטעינה במחשבון
    sessionStorage.setItem('editDealData', JSON.stringify(deal));
    // ניווט למחשבון
    if (onNavigateToCalculator) {
      onNavigateToCalculator();
    }
  };

  // פונקציה להוספת נכס חדש
  const handleAddProperty = () => {
    // מחיקת נתונים קיימים ופתיחת המחשבון לחישוב חדש
    sessionStorage.removeItem('editDealData');
    if (onNavigateToCalculator) {
      onNavigateToCalculator();
    }
  };

  // פונקציה למעבר לתיק המפורט
  const handleGoToPortfolio = () => {
    if (onNavigateToPortfolio) {
      onNavigateToPortfolio();
    }
  };

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>טוען נתוני התיק...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={refreshDeals} className="retry-btn">נסה שוב</button>
      </div>
    );
  }

  return (
    <div className="portfolio-summary-container">
      
      {/* כותרת ראשית */}
      <div className="portfolio-header">
        <h1>סיכום התיק הנדל"ני</h1>
        <div className="portfolio-count">
          {stats.totalProperties} נכסים בתיק
          {!loading && !isDataStale && (
            <span className="cache-indicator" title="נתונים מהירים מהמטמון">⚡</span>
          )}
        </div>
      </div>

      {/* סטטיסטיקות ראשיות */}
      <div className="main-stats-grid">
        
        <div className="stat-card primary">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProperties > 0 ? stats.totalProperties : '-'}</div>
            <div className="stat-label">נכסים בתיק</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.totalValue > 0 ? `₪${stats.totalValue.toLocaleString()}` : '-'}
            </div>
            <div className="stat-label">סך ערך הנכסים</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.totalEquity > 0 ? `₪${stats.totalEquity.toLocaleString()}` : '-'}
            </div>
            <div className="stat-label">הון עצמי מושקע</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">
              {stats.totalYield > 0 ? `${stats.totalYield.toFixed(1)}%` : '-'}
            </div>
            <div className="stat-label">תשואה שנתית</div>
          </div>
        </div>

      </div>

      {/* הכנסות והוצאות */}
      <div className="income-expenses-section">
        
        <div className="section-header">
          <h2>תזרים מזומנים חודשי</h2>
        </div>

        <div className="cashflow-cards">
          
          <div className="cashflow-card income">
            <div className="cashflow-icon">💵</div>
            <div className="cashflow-content">
              <div className="cashflow-amount">
                {stats.monthlyRent > 0 ? `₪${stats.monthlyRent.toLocaleString()}` : '-'}
              </div>
              <div className="cashflow-label">הכנסות משכירות</div>
            </div>
          </div>

          <div className="cashflow-card neutral">
            <div className="cashflow-icon">⚡</div>
            <div className="cashflow-content">
              <div className="cashflow-amount">
                {stats.monthlyCashFlow !== 0 ? 
                  `${stats.monthlyCashFlow >= 0 ? '+' : ''}₪${stats.monthlyCashFlow.toLocaleString()}` : 
                  '-'
                }
              </div>
              <div className="cashflow-label">תזרים נקי</div>
            </div>
          </div>

        </div>
      </div>

      {/* רשימת נכסים */}
      <div className="properties-section">
        
        <div className="section-header">
          <h2>הנכסים שלי</h2>
          <button className="add-property-btn" onClick={handleAddProperty}>+ הוסף נכס</button>
        </div>

        {!Array.isArray(deals) || deals.length === 0 ? (
          <div className="empty-portfolio">
            <div className="empty-icon">🏘️</div>
            <h3>התיק שלך ריק</h3>
            <p>התחל בהוספת הנכס הראשון שלך</p>
            <button className="start-btn" onClick={handleAddProperty}>התחל עכשיו</button>
          </div>
        ) : (
          <div className="properties-grid">
            {deals.map((deal, index) => (
              <div key={deal._id || index} className="property-card">
                
                <div className="property-header">
                  <h3>{deal.address || deal.name || `נכס ${index + 1}`}</h3>
                  <div className="property-status active">פעיל</div>
                </div>

                <div className="property-details">
                  
                  <div className="detail-row">
                    <span className="detail-label">ערך הנכס:</span>
                    <span className="detail-value">
                      {deal.propertyValue > 0 ? `₪${deal.propertyValue.toLocaleString()}` : '-'}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">הון עצמי:</span>
                    <span className="detail-value">
                      {deal.equity > 0 ? `₪${deal.equity.toLocaleString()}` : '-'}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">שכירות חודשית:</span>
                    <span className="detail-value">
                      {deal.monthlyRent > 0 ? `₪${deal.monthlyRent.toLocaleString()}` : '-'}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">תשואה שנתית:</span>
                    <span className="detail-value highlight">
                      {deal.equity > 0 && deal.monthlyRent > 0 ? 
                        `${((deal.monthlyRent * 12 / deal.equity) * 100).toFixed(1)}%` : 
                        '-'
                      }
                    </span>
                  </div>

                </div>

                <div className="property-actions">
                  <button className="action-btn view" onClick={() => handleViewDeal(deal)}>צפה בפרטים</button>
                  <button className="action-btn edit" onClick={() => handleEditDeal(deal)}>ערוך</button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default PortfolioSummary; 