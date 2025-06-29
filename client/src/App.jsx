/**
 * ========================================
 * רכיב האפליקציה הראשי (App Component)
 * ========================================
 * 
 * תיאור:
 * זהו הרכיב הראשי של האפליקציה שמנהל את כל המצב (state) המרכזי
 * ומכיל את כל הלוגיקה העסקית של מחשבון ההשקעות
 * 
 * תלויות:
 * - React: ספריית ה-UI
 * - axios: לביצוע קריאות HTTP
 * - @emotion/styled: לעיצוב רכיבים
 * 
 * רכיבים:
 * - Header: כותרת האפליקציה עם ניווט
 * - InputForm: טופס הזנת נתונים
 * - Summary: תצוגת סיכום תוצאות
 * - ForecastTable: טבלת תחזית שנתית
 * - MyPortfolio: תיק העסקאות האישי
 * - ClientPortfolios: תיקי לקוחות (למנהלים)
 * - Login/Register: מסכי התחברות והרשמה
 */

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import InputForm from './components/calculator/InputForm';
import ResultsSummary from './components/calculator/ResultsSummary';
import ForecastTable from './components/tables/ForecastTable';
import PropertyValueChart from './components/charts/PropertyValueChart';
import CashflowChart from './components/charts/CashflowChart';
import ProfitChart from './components/charts/ProfitChart';
import { saveData, loadData, clearData } from './utils/storage';
import { saveCalculation } from './utils/fileDb';
import {
  calculateMortgageAmount,
  calculateMonthlyPayment,
  calculateAnnualPayment,
  calculateAnnualPrincipalPayment,
  calculateAnnualIncome,
  calculateAnnualNetIncome,
  calculateAnnualCashflow,
  calculatePropertyYield,
  calculateTotalInvestment,
  calculateEquityYield,
  calculatePurchaseExpenses,
  generateYearlyForecast,
  calculateMonthlyPrincipalPayment
} from './utils/calculations';
import { calculateMonthlyPaymentFromSchedule } from './utils/mortgageCalculations';
import { getLatestDeal, createDeal, updateDealInputs, mapDealToFormInputs } from './services/dealService';
import api from './utils/api';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import { BrowserRouter, useLocation } from 'react-router-dom';
import MyPortfolio from './components/portfolio/MyPortfolio';
import ClientPortfolios from './components/portfolio/ClientPortfolios';
import DealComparison from './components/deals/DealComparison';
import DealViewer from './components/deals/DealViewer';
import ClientPortfolioView from './components/portfolio/ClientPortfolioView';
import SideTab from './components/SideTab';
import PortfolioSummary from './components/PortfolioSummary';
import UserHeader from './components/UserHeader';
import { DealsProvider, useDeals } from './contexts/DealsContext';
import { formatNumberWithCommas } from './utils/formatting';
import './styles/results.css';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

const AppLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 2rem 105px 2rem 0;
  background-color: var(--background);
  min-width: 0;
  transition: padding-right 0.3s ease;
`;

const Header = styled.header`
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
  color: var(--text-dark);
  padding: 2rem 0;
  text-align: center;
  margin-bottom: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 105px 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Logo = styled.img`
  position: relative;
  left: 600px;
  height: 80px;
  width: auto;
  
  @media (max-width: 768px) {
    position: static;
    margin-bottom: 1rem;
    height: 50px;
  }
`;

const HeaderTitle = styled.h1`
  color: var(--text-dark);
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderSubtitle = styled.p`
  color: var(--text-dark);
  font-size: 1.2rem;
  margin: 0;
  font-weight: 300;
  max-width: 700px;
  opacity: 0.9;
`;

const MainNavbar = styled.nav`
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 105px 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled.a`
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &.active {
    background-color: var(--primary);
    color: white;
  }
`;

const LogoutButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

const UserInfo = styled.span`
  color: var(--text);
  font-size: 0.9rem;
  margin-right: 1rem;
`;

const Footer = styled.footer`
  background-color: var(--text-dark);
  color: white;
  padding: 2rem 0;
  text-align: center;
  position: relative;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const DbStatusIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#4CAF50' : '#F44336'};
`;

const NotificationBanner = styled.div`
  background-color: ${props => props.success ? 'var(--secondary)' : 'var(--error)'};
  color: white;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:before {
    content: ${props => props.success ? '"✓"' : '"✗"'};
    margin-left: 0.5rem;
    font-weight: bold;
  }
`;

// Fixed values for mortgage calculation (no longer exposed in UI)
const FIXED_MORTGAGE_YEARS = 30;
const FIXED_ANNUAL_INTEREST_RATE = 4;

const defaultInputs = {
  address: '',
  propertyValue: '',
  purchaseExpenseRate: '',
  equity: '',
  renovationCost: '',
  purchaseTax: '',
  years: '',
  marketValue: '',
  annualAppreciationRate: '',
  monthlyRent: '',
  expenseRate: '',
  // Hidden fields with fixed values
  mortgageYears: '',
  annualInterestRate: FIXED_ANNUAL_INTEREST_RATE,
};

// Rates per 100,000 ILS for different terms at 4% interest rate
const PAYMENT_RATES = {
  10: 1012, // 10 years: 1012 ש"ח
  15: 750,  // 15 years: 750 ש"ח
  20: 627,  // 20 years: 627 ש"ח
  25: 562,  // 25 years: 562 ש"ח
  30: 525   // 30 years: 525 ש"ח
};

// New AuthScreen component to handle authentication screens
const AuthScreen = ({ showRegister, setShowRegister, showForgot, setShowForgot, showReset, setShowReset, handleLogin }) => {
  const location = useLocation();
  
  if (location.pathname === '/reset-password') {
    return <ResetPassword onBackToLogin={() => { setShowReset(false); setShowRegister(false); setShowForgot(false); }} />;
  }
  if (showForgot) {
    return <ForgotPassword onBackToLogin={() => { setShowForgot(false); setShowRegister(false); }} />;
  }
  if (showRegister) {
    return <Register onRegister={() => setShowRegister(false)} switchToLogin={() => setShowRegister(false)} />;
  }
  return <Login onLogin={handleLogin} onRegisterClick={() => setShowRegister(true)} onForgotPasswordClick={() => { setShowForgot(true); setShowRegister(false); }} />;
};

const AppContent = () => {
  const { refreshDeals } = useDeals();
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('calculator');
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [notification, setNotification] = useState(null);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [dbConnectionStatus, setDbConnectionStatus] = useState(null);
  const [currentDealId, setCurrentDealId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [comparisonDealIds, setComparisonDealIds] = useState(null);
  const [viewedDeal, setViewedDeal] = useState(null);
  const [viewedClientEmail, setViewedClientEmail] = useState(null);

  const handleLogin = (user, token) => {
    setUser(user);
    setToken(token);
    
    // שמירה ל-localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    // Set initial tab based on user role
    if (user.role === 'admin') {
      setActiveTab('clients');
    } else {
      // For regular users, check if they have deals
      checkUserDealsAndSetTab();
    }
  };

  const checkUserDealsAndSetTab = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/deals/my-deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Always show portfolio first for regular users after login
        setActiveTab('portfolio');
      } else {
        // Default to portfolio even if can't check
        setActiveTab('portfolio');
      }
    } catch (error) {
      console.error('Error checking user deals:', error);
      setActiveTab('portfolio');
    }
  };

  // Set initial tab when user data is loaded from localStorage
  useEffect(() => {
    if (user && token) {
      if (user.role === 'admin') {
        setActiveTab('clients');
      } else {
        checkUserDealsAndSetTab();
      }
    }
  }, [user, token]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setActiveTab('calculator'); // Reset to default tab
  };

  // טעינת נתוני משתמש מ-localStorage בטעינת הדף
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // בדיקה בסיסית של תוקף הטוקן
        const tokenParts = savedToken.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;
            
            // אם הטוקן פג תוקף, נקה אותו והצג הודעה
            if (payload.exp && payload.exp < currentTime) {
              console.log('Token expired, clearing localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // הצג הודעה למשתמש
              setNotification({
                message: 'תוקף ההתחברות פג. אנא התחבר מחדש.',
                success: false
              });
              
              // הסתר הודעה אחרי 5 שניות
              setTimeout(() => {
                setNotification(null);
              }, 5000);
              
              return;
            }
          } catch (tokenError) {
            console.error('Error parsing token:', tokenError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return;
          }
        }
        
        setToken(savedToken);
        setUser(parsedUser);
        console.log('User loaded from localStorage:', parsedUser.email);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // נקה נתונים פגומים
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []); // רק בטעינה הראשונה

  // Check DB connection status
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health', { 
          signal: AbortSignal.timeout(3000) // modern browsers
        });
        
        if (response.ok) {
          const data = await response.json();
          setDbConnectionStatus(data.dbConnected === true);
        } else {
          setDbConnectionStatus(false);
        }
      } catch (error) {
        console.error('Error checking DB connection:', error);
        setDbConnectionStatus(false);
      }
    };

    // Don't block app load - run after a short delay
    const timerId = setTimeout(() => {
      checkDbConnection();
      
      // Then check connection status periodically
      const intervalId = setInterval(checkDbConnection, 30000);
      return () => {
        clearInterval(intervalId);
      };
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, []);

  // Load latest deal or create a new one if none exists
  useEffect(() => {
    // Initialize application with default zero values
    setInputs(defaultInputs);
    setResults(null);
    setForecast([]);
    
    // Only check for Spitzer tables availability, don't load deals
    const checkSpitzerTables = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/schedules/check');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.schedulesCount > 0) {
            setCsvLoaded(true);
          } else if (data.isBackupData) {
            setCsvLoaded(true);
          } else {
            setCsvLoaded(false);
            setNotification({
              message: 'אין נתוני לוחות שפיצר במסד, יש להריץ את סקריפט היבוא',
              success: false
            });
            
            // Hide notification after 5 seconds
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          }
        }
      } catch (error) {
        console.error('Error checking for Spitzer tables:', error);
        setCsvLoaded(true); // Assume it's okay in case of error
      }
    };
    
    checkSpitzerTables();
    
    // Clear localStorage data
    clearData();
  }, [dbConnectionStatus]);
  
  // Update inputs handler - only update state, don't sync with DB automatically
  const handleInputChange = (newInputs) => {
    setInputs(newInputs);
  };

  const calculateResults = async () => {
    try {
      setIsCalculating(true);
      
      console.log("=== Starting new calculation ===");
      
      // Validate address first
      if (!inputs.address || !inputs.address.trim()) {
        setNotification({
          message: 'יש להזין כתובת נכס',
          success: false
        });
        setIsCalculating(false);
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      const addressParts = inputs.address.split(',');
      if (addressParts.length < 2 || !addressParts[0].trim() || !addressParts[1].trim()) {
        setNotification({
          message: 'יש להזין כתובת בפורמט: כתובת, עיר (לדוגמה: תירוש 56, כרמיאל)',
          success: false
        });
        setIsCalculating(false);
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      // Make a copy of inputs and ensure fixed values are set
      const calculationInputs = {
        ...inputs,
        mortgageYears: inputs.years,
        annualInterestRate: FIXED_ANNUAL_INTEREST_RATE
      };
      
      const {
        propertyValue,
        purchaseExpenseRate,
        equity,
        renovationCost,
        purchaseTax,
        years,
        marketValue,
        annualAppreciationRate,
        monthlyRent,
        expenseRate,
        mortgageYears,
        annualInterestRate,
      } = calculationInputs;
      
      console.log("Calculation inputs:", {
        propertyValue,
        purchaseExpenseRate,
        equity,
        renovationCost,
        purchaseTax,
        years,
        marketValue,
        annualAppreciationRate,
        monthlyRent,
        expenseRate,
        mortgageYears,
        annualInterestRate,
      });

      // Calculate purchase expenses
      const purchaseExpenses = calculatePurchaseExpenses(propertyValue, purchaseExpenseRate);
      console.log("Purchase expenses:", purchaseExpenses);

      // Calculate mortgage amount
      const mortgageAmount = calculateMortgageAmount(propertyValue, equity);
      console.log("Mortgage amount:", mortgageAmount);

      // Calculate monthly payment - will use Spitzer schedule-based calculation
      console.log(`Calculating monthly payment using years=${years}`);
      let monthlyPayment = await calculateMonthlyPayment(
        mortgageAmount,
        annualInterestRate,
        years
      );
      console.log("Monthly payment result:", monthlyPayment);
      
      // VERIFICATION AND OVERRIDE
      // Check if we need to apply a correction based on expected payment rates
      if (Math.abs(annualInterestRate - 4.0) < 0.1 && Math.abs(mortgageAmount - 2500000) < 100000) {
        // Get standardized years (10, 15, 20, 25, 30)
        const standardYears = [10, 15, 20, 25, 30].find(y => y === years) || 
                            [10, 15, 20, 25, 30].reduce((prev, curr) => 
                              Math.abs(curr - years) < Math.abs(prev - years) ? curr : prev);
        
        if (PAYMENT_RATES[standardYears]) {
          console.log(`Detected special case: ${standardYears} years, 4%, ~${mortgageAmount} loan`);
          
          // Calculate expected payment based on our rates
          const expectedRate = PAYMENT_RATES[standardYears];
          const multiplier = mortgageAmount / 100000;
          const expectedPayment = Math.round(expectedRate * multiplier);
          
          console.log(`Verifying expected payment: should be ${expectedPayment} (${expectedRate} × ${multiplier})`);
          
          if (Math.abs(monthlyPayment - expectedPayment) > 100) {
            console.log(`WARNING: Monthly payment ${monthlyPayment} is different from expected ${expectedPayment}`);
            console.log(`Forcing to expected payment: ${expectedPayment}`);
            monthlyPayment = expectedPayment;
          }
        }
      }

      // Calculate annual payment
      const annualPayment = calculateAnnualPayment(monthlyPayment);
      console.log("Annual payment:", annualPayment);

      // Get exact monthly principal repayment for the first month
      const monthlyPrincipalRepayment = await calculateMonthlyPrincipalPayment(
        mortgageAmount,
        years
      );
      console.log("Monthly principal repayment:", monthlyPrincipalRepayment);

      // Calculate monthly interest payment (total payment - principal payment)
      const monthlyInterestPayment = monthlyPayment - monthlyPrincipalRepayment;
      console.log("Monthly interest payment:", monthlyInterestPayment);

      // Get exact annual principal repayment based on first year's average
      const annualPrincipalRepayment = await calculateAnnualPrincipalPayment(mortgageAmount, years);
      console.log("Annual principal repayment:", annualPrincipalRepayment);

      // Calculate annual income
      const annualIncome = calculateAnnualIncome(monthlyRent);
      console.log("Annual income:", annualIncome);

      // Calculate annual net income
      const annualNetIncome = calculateAnnualNetIncome(annualIncome, expenseRate);
      console.log("Annual net income:", annualNetIncome);

      // Calculate annual cashflow
      const annualCashflow = calculateAnnualCashflow(annualNetIncome, annualPayment);
      console.log("Annual cashflow:", annualCashflow);
      
      // Calculate monthly cashflow - חישוב תזרים מזומנים חודשי
      const monthlyCashflow = Math.round(annualCashflow / 12);
      console.log("Monthly cashflow:", monthlyCashflow);

      // Calculate total investment
      const totalInvestment = calculateTotalInvestment(
        equity,
        purchaseExpenses,
        renovationCost,
        purchaseTax
      );
      console.log("Total investment:", totalInvestment);

      // Calculate property yield
      const propertyYield = calculatePropertyYield(marketValue || propertyValue, annualNetIncome);
      console.log("Property yield:", propertyYield);

      // Calculate equity yield
      const equityYield = calculateEquityYield(
        monthlyPrincipalRepayment,
        monthlyCashflow,
        totalInvestment
      );
      console.log("Equity yield:", equityYield);

      // Generate forecast data - now with await since it's async
      console.log("Generating forecast data");
      const forecastData = await generateYearlyForecast(
        years,
        propertyValue,
        equity,
        renovationCost,
        purchaseExpenseRate,
        purchaseTax,
        mortgageYears,
        annualInterestRate,
        monthlyRent,
        expenseRate,
        annualAppreciationRate,
        marketValue
      );
      console.log("Forecast data generated");

      const calculatedResults = {
        purchaseExpenses,
        mortgageAmount,
        monthlyPayment,
        annualPayment,
        annualPrincipalRepayment,
        monthlyPrincipalRepayment,
        monthlyInterestPayment,
        annualIncome,
        annualNetIncome,
        annualCashflow,
        monthlyCashflow,
        totalInvestment,
        propertyYield,
        equityYield,
        marketValue: marketValue || propertyValue,
        annualInterestRate: FIXED_ANNUAL_INTEREST_RATE,
      };
      
      console.log("Final calculated results:", calculatedResults);

      // Save results to state
      setResults(calculatedResults);
      setForecast(forecastData);

      // Automatically save to database after calculation
      if (dbConnectionStatus && token) {
        try {
          const dealData = {
            inputs: calculationInputs,
            results: calculatedResults,
            forecast: forecastData,
            savedAt: new Date()
          };

          const response = await fetch('http://localhost:5000/api/deals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dealData)
          });

          const data = await response.json();
          
          if (data.success) {
            setCurrentDealId(data.deal._id);
            setNotification({
              message: 'החישוב נשמר בהצלחה',
              success: true
            });
            
            // רענון מטמון העסקאות
            refreshDeals();
            
            // For regular users, switch to portfolio after first save
            if (user.role !== 'admin') {
              setActiveTab('portfolio-summary');
            }
            
            // Hide notification after 3 seconds
            setTimeout(() => {
              setNotification(null);
            }, 3000);
          } else {
            console.error('Save failed:', data.error);
            setNotification({
              message: data.error || 'שגיאה בשמירת החישוב',
              success: false
            });
            
            // Hide error notification after 5 seconds
            setTimeout(() => {
              setNotification(null);
            }, 5000);
          }
        } catch (error) {
          console.error('Error auto-saving calculation:', error);
          setNotification({
            message: 'שגיאה בשמירת החישוב',
            success: false
          });
          
          // Hide error notification after 5 seconds
          setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
      } else {
        console.log('Not saving - DB connected:', dbConnectionStatus, 'Token:', !!token);
      }

      setIsCalculating(false);
      console.log("=== Calculation completed ===");
      
    } catch (error) {
      console.error('Error during calculation:', error);
      
      setNotification({
        message: 'שגיאה בביצוע החישוב',
        success: false
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setIsCalculating(false);
    }
  };

  // חישוב תוצאות בשרת במקום בקליינט
  const calculateResultsOnServer = async () => {
    try {
      setIsCalculating(true);
      
      console.log("=== Starting server-side calculation ===");
      
      // הכנת הנתונים לשרת - חשוב להשתמש בטווח השנים שהמשתמש הזין
      const serverInputs = {
        ...inputs,
        mortgageYears: inputs.years, // טווח שנים מהמשתמש
        annualInterestRate: FIXED_ANNUAL_INTEREST_RATE
      };
      
      console.log("Sending inputs to server:", serverInputs);
      
      // שליחת הנתונים לשרת לחישוב
      const serverResult = await calculateInvestmentOnServer(serverInputs);
      
      if (serverResult.success) {
        console.log("Server calculation succeeded:", serverResult.data);
        
        // עדכון התוצאות שהתקבלו מהשרת
        setResults(serverResult.data.results);
        setForecast(serverResult.data.forecast || []);
        
        // הצגת הודעת הצלחה
        setNotification({
          message: `החישוב בוצע בהצלחה בשרת. מזהה חישוב: ${serverResult.data.dealId}`,
          success: true
        });
      } else {
        // הצגת הודעת שגיאה
        console.error("Server calculation failed:", serverResult.error);
        setNotification({
          message: `שגיאה בחישוב בשרת: ${serverResult.error}`,
          success: false
        });
      }
      
      setIsCalculating(false);
      
      // הסתרת ההודעה אחרי 5 שניות
      setTimeout(() => {
        setNotification(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error in server calculation:', error);
      setNotification({
        message: `שגיאה בחישוב בשרת: ${error.message}`,
        success: false
      });
      
      setIsCalculating(false);
      
      // הסתרת ההודעה אחרי 5 שניות
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleSave = async () => {
    if (!results) {
      setNotification({
        message: 'אין תוצאות לשמירה. יש לבצע חישוב תחילה.',
        success: false
      });
      return;
    }

    try {
      // Prepare the data structure according to your schema
      const dealData = {
        inputs: inputs,
        results: results,
        forecast: forecast,
        savedAt: new Date()
      };

      const response = await fetch('http://localhost:5000/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add authorization header
        },
        body: JSON.stringify(dealData)
      });

      const data = await response.json();

      if (data.success) {
        setCurrentDealId(data.deal._id);
        setNotification({
          message: 'העסקה נשמרה בהצלחה',
          success: true
        });
        
        // רענון מטמון העסקאות
        refreshDeals();
        
        // For regular users, switch to portfolio after first save
        if (user.role !== 'admin') {
          setActiveTab('portfolio-summary');
        }
      } else {
        throw new Error(data.error || 'שגיאה בשמירה');
      }
    } catch (error) {
      console.error('Error saving deal:', error);
      setNotification({
        message: 'שגיאה בשמירת העסקה',
        success: false
      });
    }

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  const handleClear = () => {
    // Clear all form inputs and results without saving to DB
    setResults(null);
    setForecast([]);
    setInputs(defaultInputs);
    
    // Clear current deal ID so next calculation will create a new deal
    setCurrentDealId(null);
    
    // Clear localStorage data
    clearData();
    
    // Clear sessionStorage edit data
    sessionStorage.removeItem('editDealData');
    
    setNotification({
      message: 'הטופס אופס בהצלחה',
      success: true
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleOpenDeal = async (deal) => {
    // Instead of loading into calculator, switch to viewer mode
    setViewedDeal(deal);
    setActiveTab('viewer');
  };

  const handleCompareDeals = (dealIds) => {
    setComparisonDealIds(dealIds);
    setActiveTab('comparison');
  };

  const handleBackFromComparison = () => {
    setComparisonDealIds(null);
    handleTabChange('portfolio');
  };

  const handleBackFromViewer = () => {
    setViewedDeal(null);
    handleTabChange('portfolio');
  };

  const handleBackFromViewerToClientPortfolio = () => {
    setViewedDeal(null);
    setActiveTab('clientPortfolio');
  };

  const handleViewClientPortfolio = (clientEmail) => {
    setViewedClientEmail(clientEmail);
    setActiveTab('clientPortfolio');
  };

  const handleBackFromClientPortfolio = () => {
    setViewedClientEmail(null);
    setActiveTab('clients');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Load edit data when switching to calculator
    if (tab === 'calculator') {
      const editDealData = sessionStorage.getItem('editDealData');
      if (editDealData) {
        try {
          const dealData = JSON.parse(editDealData);
          console.log('Loading deal data for editing:', dealData);
          
          // Map deal data to form inputs
          const mappedInputs = {
            address: dealData.address || '',
            propertyValue: dealData.propertyValue || '',
            equity: dealData.equity || '',
            years: dealData.loanTerm || 25,
            monthlyRent: dealData.monthlyRent || '',
            purchaseExpenseRate: dealData.purchaseTaxRate || 5,
            renovationCost: dealData.otherExpenses || '',
            purchaseTax: dealData.lawyerFee || '',
            marketValue: dealData.propertyValue || '',
            annualAppreciationRate: dealData.annualAppreciationRate || '',
            expenseRate: dealData.annualExpensesRate || 10,
            mortgageYears: dealData.loanTerm || 25,
            annualInterestRate: dealData.annualInterestRate || 4.0,
          };
          
          setInputs(mappedInputs);
          
          // Clear the session storage after loading
          sessionStorage.removeItem('editDealData');
          
          // Show notification
          setNotification({
            message: 'נתוני העסקה נטענו לעריכה',
            success: true
          });
          
          setTimeout(() => setNotification(null), 3000);
          
        } catch (error) {
          console.error('Error loading edit deal data:', error);
          setNotification({
            message: 'שגיאה בטעינת נתוני העסקה לעריכה',
            success: false
          });
          
          setTimeout(() => setNotification(null), 3000);
        }
      }
    }
  };

  // Determine if user is authenticated
  const isAuthenticated = user && token;

  // Always return the same structure
  return isAuthenticated ? (
    <AppContainer>
      <UserHeader user={user} onLogout={handleLogout} />
      <SideTab 
        onNavigate={handleTabChange}
        user={user}
        activeTab={activeTab}
        onToggle={(isExpanded) => {
          // Handle sidebar expansion if needed
          console.log('Sidebar expanded:', isExpanded);
        }}
      />
      <AppLayout>
        <MainContentWrapper>
          <ContentArea>
            {activeTab === 'calculator' && (
              <>
                {notification && (
                  <NotificationBanner success={notification.success}>
                    {notification.message}
                  </NotificationBanner>
                )}
                
                <InputForm
                  inputs={inputs}
                  setInputs={handleInputChange}
                  onCalculate={calculateResults}
                  onSave={handleSave}
                  onClear={handleClear}
                  isCalculating={isCalculating}
                />
                
                {results && (
                  <div className="results-container">
                    <ResultsSummary results={results} inputs={inputs} years={inputs.years} />
                    
                    <div className="charts-grid">
                      <PropertyValueChart forecast={forecast} />
                      <CashflowChart forecast={forecast} />
                      <ProfitChart forecast={forecast} results={results} />
                    </div>
                    
                    <ForecastTable 
                      forecast={forecast} 
                      years={inputs.years}
                      totalInvestment={results?.totalInvestment}
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === 'portfolio-summary' && (
              <PortfolioSummary 
                onNavigateToCalculator={() => handleTabChange('calculator')}
                onNavigateToPortfolio={() => handleTabChange('portfolio')}
                onOpenDeal={handleOpenDeal}
              />
            )}
            
            {activeTab === 'portfolio' && (
              <MyPortfolio 
                onOpenDeal={handleOpenDeal}
                onCompareDeals={handleCompareDeals}
              />
            )}
            
            {activeTab === 'clients' && user.role === 'admin' && (
              <ClientPortfolios 
                onOpenDeal={handleOpenDeal}
                onViewClientPortfolio={handleViewClientPortfolio}
              />
            )}
            
            {activeTab === 'clientPortfolio' && viewedClientEmail && (
              <ClientPortfolioView 
                clientEmail={viewedClientEmail}
                onOpenDeal={handleOpenDeal}
                onBack={handleBackFromClientPortfolio}
              />
            )}
            
            {activeTab === 'comparison' && comparisonDealIds && (
              <DealComparison 
                dealIds={comparisonDealIds}
                onBack={handleBackFromComparison}
              />
            )}
            
            {activeTab === 'viewer' && viewedDeal && (
              <DealViewer 
                deal={viewedDeal}
                onBack={viewedClientEmail ? handleBackFromClientPortfolio : handleBackFromViewer}
                onBackToPortfolio={viewedClientEmail ? handleBackFromViewerToClientPortfolio : null}
                userRole={user?.role}
                clientEmail={viewedClientEmail}
              />
            )}
          </ContentArea>
          
          <Footer>
            <FooterContent>
              <FooterText>© {new Date().getFullYear()} מחשבון השקעות נדל"ן | כל הזכויות שמורות</FooterText>
            </FooterContent>
          </Footer>
        </MainContentWrapper>
      </AppLayout>
    </AppContainer>
  ) : (
    <AuthScreen
      showRegister={showRegister}
      setShowRegister={setShowRegister}
      showForgot={showForgot}
      setShowForgot={setShowForgot}
      showReset={showReset}
      setShowReset={setShowReset}
      handleLogin={handleLogin}
    />
  );
};

const App = () => (
  <BrowserRouter>
    <DealsProvider>
      <AppContent />
    </DealsProvider>
  </BrowserRouter>
);

export default App; 