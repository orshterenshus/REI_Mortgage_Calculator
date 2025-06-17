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

const SideTab = ({ onNavigate, user, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null); // 'invest' או 'manage'

  // עדכון מצב הסיידבר ברכיב האב
  useEffect(() => {
    if (onToggle) {
      onToggle(isExpanded);
    }
  }, [isExpanded, onToggle]);

  const handleCalculatorClick = () => {
    onNavigate('calculator');
    setIsExpanded(false);
    setExpandedSection(null);
  };

  const handlePortfolioSummaryClick = () => {
    onNavigate('portfolio-summary');
    setIsExpanded(false);
    setExpandedSection(null);
  };

  const handleMyPortfolioClick = () => {
    onNavigate('my-portfolio');
    setIsExpanded(false);
    setExpandedSection(null);
  };

  const handleInvestClick = () => {
    setIsExpanded(true);
    setExpandedSection('invest');
  };

  const handleManageClick = () => {
    setIsExpanded(true);
    setExpandedSection('manage');
  };

  return (
    <div className={`side-tab-container ${isExpanded ? 'expanded' : ''}`}>
      {/* כפתור הרחבה/כיווץ */}
      <div 
        className="side-tab-toggle"
        onClick={() => {
          if (isExpanded) {
            setIsExpanded(false);
            setExpandedSection(null);
          } else {
            setIsExpanded(true);
            setExpandedSection('manage');
          }
        }}
      >
        {isExpanded ? (
          // חץ לסגירה
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          // 3 קווים לפתיחה
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
            <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )}
      </div>

      {/* כפתורי הסיידטאב הקטנים */}
      {!isExpanded && (
        <div className="side-tab-buttons">
          <div 
            className="side-tab-button invest"
            onClick={handleInvestClick}
            title="השקעה"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13H7L9 21L15 3L17 13H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>השקעה</span>
          </div>

          <div 
            className="side-tab-button manage"
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
      {isExpanded && (
        <div className="side-tab-expanded">
          {/* תפריט ראשי */}
          <div className="sidebar-content">
            {expandedSection === 'invest' && (
              /* תפריט השקעות - רק חישוב חדש */
              <div className="sidebar-section">
                <div className="sidebar-item" onClick={handleCalculatorClick}>
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
                <div className="sidebar-item highlighted" onClick={handlePortfolioSummaryClick}>
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
                  
                  <div className="sidebar-item" onClick={handleMyPortfolioClick}>
                    <div className="item-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7H4C2.9 7 2 7.9 2 9V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M22 7L12 13L2 7" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <span>התיק שלי</span>
                  </div>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default SideTab; 