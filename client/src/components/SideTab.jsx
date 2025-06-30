/**
 * ========================================
 * רכיב סיידטאב (SideTab Component)
 * ========================================
 * 
 * תיאור:
 * רכיב צדדי עם תפריט מורחב
 * כולל קטגוריות שונות וניווט מתקדם
 */

import React, { useState, useEffect } from 'react';
import '../styles/SideTab.css';

const SideTab = ({ onNavigate, user, activeTab, isOpen, onClose, defaultSection, onSectionChange }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  // כשה-sidebar נפתח, קבע את הסקשן בהתאם ל-defaultSection
  useEffect(() => {
    if (isOpen && defaultSection) {
      setExpandedSection(defaultSection);
    } else if (!isOpen) {
      setExpandedSection(null);
    }
  }, [isOpen, defaultSection]);

  const handleCalculatorClick = () => {
    onNavigate('calculator');
    onClose();
  };

  const handlePortfolioSummaryClick = () => {
    onNavigate('portfolio-summary');
    onClose();
  };

  const handleMyPortfolioClick = () => {
    onNavigate('portfolio');
    onClose();
  };

  const handleClientsClick = () => {
    onNavigate('clients');
    onClose();
  };

  const handleInvestClick = () => {
    if (isOpen) {
      // אם הסיידבר פתוח, רק שנה סקשן
      setExpandedSection('invest');
      onSectionChange('invest');
    } else {
      // אם הסיידבר סגור, פתח אותו עם סקשן השקעות
      onSectionChange('invest');
      // הסיידבר יפתח אוטומטית דרך ה-parent
    }
  };

  const handleManageClick = () => {
    if (isOpen) {
      // אם הסיידבר פתוח, רק שנה סקשן
      setExpandedSection('manage');
      onSectionChange('manage');
    } else {
      // אם הסיידבר סגור, פתח אותו עם סקשן ניהול
      onSectionChange('manage');
      // הסיידבר יפתח אוטומטית דרך ה-parent
    }
  };

  const handleClose = () => {
    setExpandedSection(null);
    onClose();
  };

  return (
    <div className={`side-tab-container ${isOpen ? 'expanded' : ''}`}>
      {/* כפתורי הסיידטאב הקטנים */}
      {!isOpen && (
        <div className="side-tab-buttons">
          <div 
            className={`side-tab-button invest ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={handleInvestClick}
            title="השקעה"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13H7L9 21L15 3L17 13H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>השקעה</span>
          </div>

          <div 
            className={`side-tab-button manage ${['portfolio-summary', 'portfolio', 'clients'].includes(activeTab) ? 'active' : ''}`}
            onClick={handleManageClick}
            title="ניהול"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11H15M9 15H12M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>ניהול</span>
          </div>
        </div>
      )}

      {/* תפריט מורחב */}
      {isOpen && (
        <div className="side-tab-expanded">
          {/* כפתור סגירה */}
          <div className="close-button" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* תפריט ראשי */}
          <div className="sidebar-content">
            {expandedSection === 'invest' && (
              /* תפריט השקעות - רק חישוב חדש */
              <div className="sidebar-section">
                <div className={`sidebar-item ${activeTab === 'calculator' ? 'highlighted' : ''}`} onClick={handleCalculatorClick}>
                  <div className="item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span>חישוב חדש</span>
                </div>
              </div>
            )}

            {expandedSection === 'manage' && (
              <>
                {/* סקירה כללית */}
                <div className={`sidebar-item ${activeTab === 'portfolio-summary' ? 'highlighted' : ''}`} onClick={handlePortfolioSummaryClick}>
                  <div className="item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3V21H21V3H3Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M7 7H17M7 11H14M7 15H11" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <span>סקירת תיק השקעות</span>
                </div>

                {/* ניהול נתונים */}
                <div className="sidebar-section">
                  <h3 className="section-title">ניהול נתונים</h3>
                  
                  <div className={`sidebar-item ${activeTab === 'portfolio' ? 'highlighted' : ''}`} onClick={handleMyPortfolioClick}>
                    <div className="item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7H4C2.9 7 2 7.9 2 9V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M22 7L12 13L2 7" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>התיק שלי</span>
                  </div>

                  {user && user.role === 'admin' && (
                    <div className={`sidebar-item ${activeTab === 'clients' ? 'highlighted' : ''}`} onClick={handleClientsClick}>
                      <div className="item-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>תיקי לקוחות</span>
                    </div>
                  )}

                  <div className="sidebar-item">
                    <div className="item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>המסמכים שלי</span>
                  </div>

                  <div className="sidebar-item">
                    <div className="item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>משימות</span>
                  </div>
                </div>

                {/* דוחות */}
                <div className="sidebar-section">
                  <h3 className="section-title">דוחות</h3>
                  
                  <div className="sidebar-item">
                    <div className="item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>תזרים מזומנים</span>
                  </div>

                  <div className="sidebar-item">
                    <div className="item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3V21H21V3H3Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M7 8L17 8M7 12L17 12M7 16L12 16" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>דוחות מפורטים</span>
                  </div>

                  <div className="sidebar-item">
                    <div className="item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>ניתוח ביצועים</span>
                  </div>
                </div>
              </>
            )}

            {/* אם אף סקשן לא נבחר, הצג הודעה או תפריט ברירת מחדל */}
            {!expandedSection && (
              <div className="sidebar-section">
                <div className="sidebar-item" onClick={() => setExpandedSection('invest')}>
                  <div className="item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 13H7L9 21L15 3L17 13H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>השקעות</span>
                </div>
                
                <div className="sidebar-item" onClick={() => setExpandedSection('manage')}>
                  <div className="item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 11H15M9 15H12M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>ניהול</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SideTab; 