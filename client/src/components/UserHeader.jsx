import React, { useState, useRef, useEffect } from 'react';
import './UserHeader.css';

const UserHeader = ({ user, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // סגירת התפריט בלחיצה מחוץ לו
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout();
  };

  if (!user) return null;

  return (
    <header className="user-header">
      <div className="header-container">
        <div className="header-content">
          <img 
            src="/assets/logo.png" 
            alt="לוגו החברה" 
            className="header-logo"
            onError={(e) => e.target.style.display = 'none'} 
          />
        </div>
        
        <div className="user-menu-container" ref={userMenuRef}>
          <button 
            className="user-menu-button"
            onClick={toggleUserMenu}
            aria-label="תפריט משתמש"
          >
            <span className="user-icon">👤</span>
          </button>
          
          {isUserMenuOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">{user.fullName || user.name || user.email}</div>
                <div className="user-email">{user.email}</div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="logout-button"
                onClick={handleLogout}
              >
                <span className="logout-icon">🚪</span>
                התנתק
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserHeader; 