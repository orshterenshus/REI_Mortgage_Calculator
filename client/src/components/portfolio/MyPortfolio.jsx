/**
 * ========================================
 * רכיב התיק האישי המודרני (Modern Portfolio Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג את התיק האישי של המשתמש עם סיכום מפורט,
 * תצוגת מפה, וניתוח ביצועים מעמיק
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: תקשורת עם השרת
 * - PropertyMap: רכיב המפה
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyMap from '../map/PropertyMap';
import { useDeals } from '../../contexts/DealsContext';
import './MyPortfolio.css';

/**
 * ========================================
 * פונקציות עזר לפורמט
 * ========================================
 */

/**
 * פורמט מטבע
 */
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₪0';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * פורמט תאריך
 */
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('he-IL');
};

/**
 * פורמט אחוזים
 */
const formatPercentage = (value) => {
  if (!value && value !== 0) return '0.00%';
  if (value === Infinity || value === -Infinity) return 'Infinity%';
  return `${value.toFixed(2)}%`;
};

/**
 * ========================================
 * רכיב הראשי
 * ========================================
 */
const MyPortfolio = ({ onOpenDeal, onCompareDeals }) => {
  // השתמש ב-Context לנתונים
  const { deals, loading, error, refreshDeals } = useDeals();
  
  // States עיקריים
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  
  // States למצבי השוואה
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);

  /**
   * ========================================
   * פונקציות לטעינת נתונים
   * ========================================
   */

  /**
   * חישוב סטטיסטיקות מפורטות
   */
  const calculateStats = (dealsData) => {
    if (!dealsData || dealsData.length === 0) {
      setStats({
        numberOfProperties: 0,
        propertiesValue: 0,
        loansBalance: 0,
        totalEquity: 0,
        propertyAppreciation: 0,
        portfolioLTV: 0,
        rentalIncome: 0,
        mortgageCost: 0,
        grossCashflow: 0,
        occupancyLevel: 50.00,
        last12MonthsNetCashFlow: 0,
        next12MonthsNetCashFlow: 0,
        last12MonthsCashOnCash: 0,
        next12MonthsCashOnCash: 0,
        cashInvestment: 0,
        tenYearsROI: 0,
        tenYearsEquity: 0
      });
      return;
    }

    // חישובים בסיסיים
    const numberOfProperties = dealsData.length;
    const propertiesValue = dealsData.reduce((sum, deal) => sum + (deal.propertyValue || 0), 0);
    const totalEquity = dealsData.reduce((sum, deal) => sum + (deal.equity || 0), 0);
    const rentalIncome = dealsData.reduce((sum, deal) => sum + (deal.monthlyRent || 0), 0);
    
    // חישוב יתרת הלוואות (מחיר נכס פחות הון עצמי)
    const loansBalance = dealsData.reduce((sum, deal) => {
      return sum + ((deal.propertyValue || 0) - (deal.equity || 0));
    }, 0);
    
    // חישוב LTV (Loan to Value)
    const portfolioLTV = propertiesValue > 0 ? (loansBalance / propertiesValue) * 100 : 0;
    
    // חישוב תשלומי משכנתא חודשיים
    const mortgageCost = dealsData.reduce((sum, deal) => {
      if (deal.results && deal.results.monthlyPayment) {
        return sum + deal.results.monthlyPayment;
      }
      return sum;
    }, 0);
    
    // חישוב תזרים גולמי
    const grossCashflow = rentalIncome - mortgageCost;
    
    // חישוב השבחה (אם קיימת בתחזית)
    const propertyAppreciation = dealsData.reduce((sum, deal) => {
      if (deal.forecast && deal.forecast.length > 0) {
        const firstYear = deal.forecast[0];
        return sum + ((firstYear.propertyValue || deal.propertyValue || 0) - (deal.propertyValue || 0));
      }
      return sum;
    }, 0);

    // חישובים מתקדמים לטאבים נוספים
    const cashInvestment = totalEquity;
    const last12MonthsNetCashFlow = grossCashflow * 12;
    const next12MonthsNetCashFlow = last12MonthsNetCashFlow; // הנחה שזהה
    
    // חישוב Cash on Cash
    const last12MonthsCashOnCash = cashInvestment > 0 ? (last12MonthsNetCashFlow / cashInvestment) * 100 : 0;
    const next12MonthsCashOnCash = last12MonthsCashOnCash;
    
    // חישוב תחזית 10 שנים
    const tenYearsROI = dealsData.reduce((sum, deal) => {
      if (deal.forecast && deal.forecast[9]) { // שנה 10
        const year10 = deal.forecast[9];
        return sum + (year10.totalProfitPercentage || 0);
      }
      return sum + 100; // הנחת ברירת מחדל
    }, 0) / numberOfProperties;
    
    const tenYearsEquity = dealsData.reduce((sum, deal) => {
      if (deal.forecast && deal.forecast[9]) {
        return sum + (deal.forecast[9].equity || 0);
      }
      return sum + (deal.equity || 0) * 1.5; // הנחת ברירת מחדל
    }, 0);

    setStats({
      numberOfProperties,
      propertiesValue,
      loansBalance,
      totalEquity: propertiesValue - loansBalance,
      propertyAppreciation,
      portfolioLTV: portfolioLTV === Infinity ? Infinity : portfolioLTV,
      rentalIncome,
      mortgageCost,
      grossCashflow,
      occupancyLevel: 50.00, // נתון קבוע לעת עתה
      last12MonthsNetCashFlow,
      next12MonthsNetCashFlow,
      last12MonthsCashOnCash,
      next12MonthsCashOnCash,
      cashInvestment,
      tenYearsROI,
      tenYearsEquity
    });
  };

  /**
   * ========================================
   * Effects
   * ========================================
   */

  // עדכון סטטיסטיקות כאשר הנתונים משתנים
  useEffect(() => {
    if (Array.isArray(deals)) {
      calculateStats(deals);
    }
  }, [deals]);

  /**
   * ========================================
   * פונקציות טיפול באירועים
   * ========================================
   */

  /**
   * טיפול במחיקת עסקה
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
        // עדכון ה-Context במקום state מקומי
        refreshDeals();
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

  /**
   * ========================================
   * רכיבי תצוגה
   * ========================================
   */

  /**
   * כותרת עם כפתורי פעולה
   */
  const renderHeader = () => (
    <div className="portfolio-header">
      <h1 className="portfolio-title">התיק האישי שלי</h1>
      <div className="header-buttons">
        <button 
          className="header-btn primary"
          onClick={() => window.location.href = '#calculator'}
          title="עבור למחשבון להוספת נכס חדש"
        >
          + הוסף נכס
        </button>
        <button 
          className="header-btn secondary"
          onClick={() => setActiveTab('deals')}
          title="צפה בפרטי עסקאות"
        >
          📄 פרטי עסקאות
        </button>
        <button 
          className="header-btn secondary"
          onClick={() => setActiveTab('performance')}
          title="צפה בניתוח ביצועים"
        >
          📊 ביצועים
        </button>
        {isCompareMode ? (
          <button 
            className="header-btn tertiary"
            onClick={toggleCompareMode}
          >
            ✕ בטל השוואה
          </button>
        ) : (
          <button 
            className="header-btn secondary"
            onClick={toggleCompareMode}
            disabled={deals.length < 2}
            title={deals.length < 2 ? 'נדרשות לפחות 2 עסקאות להשוואה' : 'השווה בין עסקאות'}
          >
            ⚖️ השווה עסקאות
          </button>
        )}
        {isCompareMode && selectedDeals.length >= 2 && (
          <button 
            className="header-btn primary"
            onClick={handleCompare}
          >
            השווה ({selectedDeals.length})
          </button>
        )}
      </div>
    </div>
  );

  /**
   * סיכום סטטיסטיקות עליון
   */
  const renderTopStats = () => {
    // התאמת סטטיסטיקות לפי הטאב הפעיל
    switch (activeTab) {
      case 'map':
        return null; // אין צורך בסטטיסטיקות במפה
        
      case 'performance':
        return (
          <div className="stats-grid top-stats">
            <div className="stat-card">
              <div className="stat-label">מספר נכסים</div>
              <div className="stat-value">{stats.numberOfProperties}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">תזרים נטו חודשי</div>
              <div className="stat-value">{formatCurrency(stats.grossCashflow)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">תשואה על הון עצמי</div>
              <div className="stat-value">{formatPercentage(stats.last12MonthsCashOnCash)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">סך הון עצמי</div>
              <div className="stat-value">{formatCurrency(stats.totalEquity)}</div>
            </div>
          </div>
        );
        
      case 'equity':
        return (
          <div className="stats-grid top-stats">
            <div className="stat-card">
              <div className="stat-label">מספר נכסים</div>
              <div className="stat-value">{stats.numberOfProperties}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">סך הון עצמי</div>
              <div className="stat-value">{formatCurrency(stats.totalEquity)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">יחס מימון ממוצע</div>
              <div className="stat-value">{formatPercentage(stats.portfolioLTV)}</div>
            </div>
          </div>
        );
        
      default: // overview, deals
        return (
          <div className="stats-grid top-stats">
            <div className="stat-card">
              <div className="stat-label">מספר נכסים</div>
              <div className="stat-value">{stats.numberOfProperties}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">שווי נכסים</div>
              <div className="stat-value blue">{formatCurrency(stats.propertiesValue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">הכנסה חודשית</div>
              <div className="stat-value">{formatCurrency(stats.rentalIncome)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">תזרים חודשי</div>
              <div className="stat-value">{formatCurrency(stats.grossCashflow)}</div>
            </div>
          </div>
        );
    }
  };

  /**
   * סיכום סטטיסטיקות תחתון
   */
  const renderBottomStats = () => {
    // הסטטיסטיקות התחתונות יוצגו רק בטאב ברירת מחדל
    if (activeTab !== 'overview') {
      return null;
    }
    
    return (
      <div className="stats-grid bottom-stats">
        <div className="stat-card">
          <div className="stat-label">יתרת משכנתאות</div>
          <div className="stat-value pink">{formatCurrency(stats.loansBalance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">עלות משכנתא חודשית</div>
          <div className="stat-value">{formatCurrency(stats.mortgageCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">יחס מימון</div>
          <div className="stat-value">{formatPercentage(stats.portfolioLTV)}</div>
        </div>
      </div>
    );
  };

  /**
   * טאבים לניווט
   */
  const renderTabs = () => (
    <div className="tabs-container">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          נתונים כלליים
        </button>
        <button 
          className={`tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          תצוגת מפה
        </button>
        <button 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          ביצועים
        </button>
        <button 
          className={`tab ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          פרטי עסקאות
        </button>
      </div>
      <div className="tab-actions">
        <button className="manage-views-btn">⚙️ ניהול תצוגות</button>
      </div>
    </div>
  );

  /**
   * תצוגת מפה
   */
  const renderMapView = () => (
    <div className="map-container">
      <PropertyMap 
        deals={deals} 
        onDealClick={(deal) => onOpenDeal && onOpenDeal(deal)}
      />
    </div>
  );

  /**
   * תצוגת Default
   */
  const renderDefaultView = () => (
    <div className="properties-table">
      <table>
        <thead>
          <tr>
            <th>📍</th>
            <th>כתובת</th>
            <th>שווי נכס</th>
            <th>מחיר רכישה</th>
            <th>הכנסה חודשית</th>
            <th>יתרת משכנתא</th>
            <th>ריבית נוכחית</th>
            <th>תאריך פקיעת ריבית</th>
            <th>עלות חודשית</th>
            <th>יחס מימון</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal._id} onClick={() => onOpenDeal(deal)}>
              <td>🏠</td>
              <td>{deal.address}</td>
              <td>{formatCurrency(deal.propertyValue)}</td>
              <td>{formatCurrency(deal.propertyValue)}</td>
              <td>{formatCurrency(deal.monthlyRent)}</td>
              <td>{formatCurrency((deal.propertyValue || 0) - (deal.equity || 0))}</td>
              <td>4.0%</td>
              <td>-</td>
              <td>{deal.results ? formatCurrency(deal.results.monthlyPayment) : '-'}</td>
              <td>{((((deal.propertyValue || 0) - (deal.equity || 0)) / (deal.propertyValue || 1)) * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /**
   * תצוגת Performance
   */
  const renderPerformanceView = () => (
    <div className="performance-container">
      <div className="performance-stats">
        <div className="stat-card">
          <div className="stat-label">מספר נכסים</div>
          <div className="stat-value">{stats.numberOfProperties}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">תזרים נטו 12 חודשים אחרונים</div>
          <div className="stat-value">{formatCurrency(stats.last12MonthsNetCashFlow)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">תזרים נטו 12 חודשים הבאים</div>
          <div className="stat-value">{formatCurrency(stats.next12MonthsNetCashFlow)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">תשואה על הון 12 חודשים אחרונים</div>
          <div className="stat-value">{formatPercentage(stats.last12MonthsCashOnCash)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">תשואה על הון 12 חודשים הבאים</div>
          <div className="stat-value">{formatPercentage(stats.next12MonthsCashOnCash)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">סך הון עצמי</div>
          <div className="stat-value">{formatCurrency(stats.totalEquity)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">השקעה במזומן</div>
          <div className="stat-value">{formatCurrency(stats.cashInvestment)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">תשואה 10 שנים</div>
          <div className="stat-value">{formatPercentage(stats.tenYearsROI)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">הון עצמי בעוד 10 שנים</div>
          <div className="stat-value">{formatCurrency(stats.tenYearsEquity)}</div>
        </div>
      </div>
      
      <div className="performance-table">
        <table>
          <thead>
            <tr>
              <th>📍</th>
              <th>כתובת</th>
              <th>השקעה במזומן</th>
              <th>תזרים נטו 12 חודשים אחרונים</th>
              <th>תשואה על הון 12 חודשים אחרונים</th>
              <th>תשואה גולמי 12 חודשים אחרונים</th>
              <th>תזרים נטו 12 חודשים הבאים</th>
              <th>תשואה על הון 12 חודשים הבאים</th>
              <th>תשואה 12 חודשים הבאים</th>
              <th>שיעור הוון 12 חודשים הבאים</th>
              <th>הון עצמי בעוד 10 שנים</th>
              <th>תשואה 10 שנים</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal._id}>
                <td>🏠</td>
                <td>{deal.address}</td>
                <td>{formatCurrency(deal.equity)}</td>
                <td>{formatCurrency((deal.monthlyRent || 0) * 12 - (deal.results?.monthlyPayment || 0) * 12)}</td>
                <td>{formatPercentage(deal.equity > 0 ? (((deal.monthlyRent || 0) * 12 - (deal.results?.monthlyPayment || 0) * 12) / deal.equity) * 100 : 0)}</td>
                <td>{formatPercentage(deal.propertyValue > 0 ? ((deal.monthlyRent || 0) * 12 / deal.propertyValue) * 100 : 0)}</td>
                <td>{formatCurrency((deal.monthlyRent || 0) * 12 - (deal.results?.monthlyPayment || 0) * 12)}</td>
                <td>{formatPercentage(deal.equity > 0 ? (((deal.monthlyRent || 0) * 12 - (deal.results?.monthlyPayment || 0) * 12) / deal.equity) * 100 : 0)}</td>
                <td>-</td>
                <td>-</td>
                <td>{deal.forecast && deal.forecast[9] ? formatCurrency(deal.forecast[9].equity) : '-'}</td>
                <td>{deal.forecast && deal.forecast[9] ? formatPercentage(deal.forecast[9].totalProfitPercentage) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /**
   * תצוגת Equity
   */
  const renderEquityView = () => (
    <div className="equity-table">
      <table>
        <thead>
          <tr>
            <th>📍</th>
            <th>כתובת</th>
            <th>הון עצמי</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal._id}>
              <td>🏠</td>
              <td>{deal.address}</td>
              <td>{formatCurrency(deal.equity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /**
   * תצוגת Deal Details
   */
  const renderDealDetailsView = () => (
    <div className="deal-details-table">
      <table>
        <thead>
          <tr>
            <th>📍</th>
            <th>כתובת</th>
            <th>שם סוכן</th>
            <th>טלפון סוכן</th>
            <th>אימייל סוכן</th>
            <th>תאריך צפייה</th>
            <th>קישור נכס 1</th>
            <th>קישור נכס 2</th>
            <th>הערות</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal._id}>
              <td>🏠</td>
              <td>{deal.address}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /**
   * בחירת תצוגה לפי טאב פעיל
   */
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'map':
        return renderMapView();
      case 'overview':
        return renderDefaultView();
      case 'performance':
        return renderPerformanceView();
      case 'deals':
        return renderDealDetailsView();
      default:
        return renderDefaultView();
    }
  };

  /**
   * ========================================
   * רכיב הראשי המוחזר
   * ========================================
   */

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
      {renderHeader()}
      {renderTopStats()}
      {renderBottomStats()}
      {renderTabs()}
      <div className="tab-content">
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default MyPortfolio; 