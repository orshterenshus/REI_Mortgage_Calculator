import React, { createContext, useContext, useState, useEffect } from 'react';

const DealsContext = createContext();

export const useDeals = () => {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error('useDeals must be used within a DealsProvider');
  }
  return context;
};

export const DealsProvider = ({ children }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // Cache validity - 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchDeals = async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('❌ No token found');
      setDeals([]);
      setCurrentUserEmail(null);
      return [];
    }

    // בדיקת מייל המשתמש הנוכחי
    let userEmail = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userEmail = payload.email;
    } catch (e) {
      console.error('Error parsing token:', e);
      setDeals([]);
      setCurrentUserEmail(null);
      return [];
    }

    // אם המשתמש השתנה, נקה את הקאש
    if (currentUserEmail && currentUserEmail !== userEmail) {
      console.log(`🔄 User changed from ${currentUserEmail} to ${userEmail}, clearing cache`);
      setDeals([]);
      setLastFetch(null);
      setCurrentUserEmail(userEmail);
    } else if (!currentUserEmail) {
      setCurrentUserEmail(userEmail);
    }

    // Check if we have valid cached data for the current user
    if (!forceRefresh && deals.length > 0 && lastFetch && 
        (Date.now() - lastFetch < CACHE_DURATION) && 
        currentUserEmail === userEmail) {
      console.log('✅ Using cached deals data - no server request needed');
      return deals;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching deals from server for user: ${userEmail}...`);

      const response = await fetch('http://localhost:5000/api/deals/my-deals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('אין הרשאה לצפות בנתונים');
        }
        throw new Error(`שגיאה בשרת: ${response.status}`);
      }

      const data = await response.json();
      console.log('Deals API response:', data);

      if (data.success && Array.isArray(data.deals)) {
        setDeals(data.deals);
        setLastFetch(Date.now());
        setCurrentUserEmail(userEmail);
        setError(null);
        return data.deals;
      } else {
        console.error('Invalid deals data structure:', data);
        setDeals([]);
        return [];
      }

    } catch (error) {
      console.error('Error fetching deals:', error);
      setError(error.message || 'שגיאה בטעינת נתוני התיק');
      setDeals([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch deals on mount and when refresh is triggered
  useEffect(() => {
    fetchDeals();
  }, [refreshTrigger]);

  const refreshDeals = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const forceRefreshDeals = () => {
    fetchDeals(true);
  };

  const addDeal = (newDeal) => {
    setDeals(prev => [...prev, newDeal]);
    setLastFetch(Date.now());
  };

  const updateDeal = (dealId, updatedDeal) => {
    setDeals(prev => prev.map(deal => 
      deal._id === dealId ? { ...deal, ...updatedDeal } : deal
    ));
    setLastFetch(Date.now());
  };

  const removeDeal = (dealId) => {
    setDeals(prev => prev.filter(deal => deal._id !== dealId));
    setLastFetch(Date.now());
  };

  const value = {
    deals,
    loading,
    error,
    fetchDeals,
    refreshDeals,
    forceRefreshDeals,
    addDeal,
    updateDeal,
    removeDeal,
    isDataStale: lastFetch && (Date.now() - lastFetch > CACHE_DURATION)
  };

  return (
    <DealsContext.Provider value={value}>
      {children}
    </DealsContext.Provider>
  );
}; 