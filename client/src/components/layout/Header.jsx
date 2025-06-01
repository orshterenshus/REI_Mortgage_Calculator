/**
 * ========================================
 * רכיב כותרת (Header Component)
 * ========================================
 * 
 * תיאור:
 * רכיב זה מציג את כותרת האפליקציה וסרגל הניווט
 * כולל ניהול טאבים, מידע משתמש וכפתורי התחברות/התנתקות
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - @emotion/styled: לעיצוב הרכיב
 * 
 * Props:
 * - activeTab: string - הטאב הפעיל כרגע
 * - setActiveTab: Function - פונקציה לשינוי הטאב הפעיל
 * - user: Object - פרטי המשתמש המחובר (null אם לא מחובר)
 * - onLogout: Function - פונקציה להתנתקות
 * - onLoginClick: Function - פונקציה להצגת מסך התחברות
 */

import React from 'react';
import styled from '@emotion/styled';

/**
 * ========================================
 * Styled Components - עיצוב הרכיב
 * ========================================
 */

/**
 * מיכל הכותרת הראשי
 * רקע כהה עם צל קל
 */
const HeaderContainer = styled.header`
  background-color: var(--primary);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

/**
 * תוכן הכותרת
 * מגביל רוחב ומרכז את התוכן
 */
const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/**
 * לוגו האפליקציה
 */
const Logo = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

/**
 * סרגל ניווט
 */
const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

/**
 * רשימת טאבים
 */
const TabList = styled.ul`
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

/**
 * טאב בודד
 */
const Tab = styled.li`
  position: relative;
`;

/**
 * כפתור טאב
 * משנה עיצוב לפי מצב פעיל/לא פעיל
 */
const TabButton = styled.button`
  background: none;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  opacity: ${props => props.active ? '1' : '0.8'};
  
  &:hover {
    opacity: 1;
  }
  
  /* קו תחתון לטאב פעיל */
  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: white;
    transform: scaleX(${props => props.active ? '1' : '0'});
    transition: transform 0.3s ease;
  }
`;

/**
 * אזור פרטי משתמש
 */
const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

/**
 * מידע משתמש
 */
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 1rem;
`;

/**
 * שם המשתמש
 */
const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
`;

/**
 * תפקיד המשתמש
 */
const UserRole = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
  text-transform: capitalize;
`;

/**
 * כפתור פעולה (התחברות/התנתקות)
 */
const ActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

/**
 * תג מנהל
 */
const AdminBadge = styled.span`
  background-color: #27ae60;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
`;

/**
 * ========================================
 * רכיב הכותרת הראשי
 * ========================================
 */
const Header = ({ activeTab, setActiveTab, user, onLogout, onLoginClick }) => {
  
  /**
   * מעבר לטאב הראשי (מחשבון)
   * מופעל בלחיצה על הלוגו
   */
  const handleLogoClick = () => {
    setActiveTab('calculator');
  };

  /**
   * קביעת הטאבים הזמינים לפי סטטוס המשתמש
   * 
   * @returns {Array} רשימת הטאבים להצגה
   */
  const getAvailableTabs = () => {
    const tabs = [
      { id: 'calculator', label: 'מחשבון', requiresAuth: false }
    ];

    // טאב תיק אישי - רק למשתמשים מחוברים
    if (user) {
      tabs.push({ id: 'portfolio', label: 'התיק שלי', requiresAuth: true });
    }

    // טאב לקוחות - רק למנהלים
    if (user && user.role === 'admin') {
      tabs.push({ id: 'clients', label: 'תיקי לקוחות', requiresAuth: true });
    }

    return tabs;
  };

  /**
   * קבלת שם תצוגה של המשתמש
   * 
   * @returns {string} השם להצגה
   */
  const getDisplayName = () => {
    if (!user) return '';
    
    // העדפה לשם מלא, אחרת אימייל
    return user.fullName || user.email || 'משתמש';
  };

  /**
   * קבלת תצוגת התפקיד בעברית
   * 
   * @returns {string} התפקיד בעברית
   */
  const getRoleDisplay = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'admin':
        return 'מנהל';
      case 'user':
        return 'משתמש';
      default:
        return user.role;
    }
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        {/* לוגו האפליקציה */}
        <Logo onClick={handleLogoClick}>
          מחשבון השקעות נדל"ן
        </Logo>

        {/* אזור ניווט ומשתמש */}
        <Nav>
          {/* רשימת טאבים */}
          <TabList>
            {getAvailableTabs().map(tab => (
              <Tab key={tab.id}>
                <TabButton
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </TabButton>
              </Tab>
            ))}
          </TabList>

          {/* אזור משתמש */}
          <UserSection>
            {user ? (
              <>
                {/* מידע משתמש מחובר */}
                <UserInfo>
                  <UserName>
                    {user.role === 'admin' && <AdminBadge>מנהל</AdminBadge>}
                    {getDisplayName()}
                  </UserName>
                  <UserRole>{getRoleDisplay()}</UserRole>
                </UserInfo>

                {/* כפתור התנתקות */}
                <ActionButton onClick={onLogout}>
                  התנתק
                </ActionButton>
              </>
            ) : (
              /* כפתור התחברות */
              <ActionButton onClick={onLoginClick}>
                התחבר
              </ActionButton>
            )}
          </UserSection>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

/**
 * ========================================
 * ייצוא הרכיב
 * ========================================
 */
export default Header; 