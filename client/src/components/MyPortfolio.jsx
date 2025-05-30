import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const PortfolioContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--primary);
`;

const DealsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DealCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const DealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const DealName = styled.h3`
  font-size: 1.2rem;
  margin: 0;
  color: var(--text);
`;

const DealDate = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const DealInfo = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
`;

const InfoLabel = styled.span`
  color: var(--text-secondary);
`;

const InfoValue = styled.span`
  color: var(--text);
  font-weight: 500;
`;

const CompareButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  cursor: pointer;
  
  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #c00;
`;

const MyPortfolio = ({ onOpenDeal, onCompareDeals }) => {
  const [deals, setDeals] = useState([]);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyDeals();
  }, []);

  const fetchMyDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/deals/my-deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDeals(response.data.deals);
      }
    } catch (err) {
      setError('שגיאה בטעינת העסקאות');
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDealSelection = (dealId) => {
    setSelectedDeals(prev => {
      if (prev.includes(dealId)) {
        return prev.filter(id => id !== dealId);
      } else {
        return [...prev, dealId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedDeals.length >= 2 && onCompareDeals) {
      onCompareDeals(selectedDeals);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDealsCount = (count) => {
    if (count === 1) {
      return 'עסקה 1';
    }
    return `${count} עסקאות`;
  };

  if (loading) return <LoadingMessage>טוען עסקאות...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (deals.length === 0) {
    return (
      <PortfolioContainer>
        <Title>התיק שלי</Title>
        <LoadingMessage>אין עסקאות שמורות עדיין</LoadingMessage>
      </PortfolioContainer>
    );
  }

  return (
    <PortfolioContainer>
      <Title>התיק שלי ({formatDealsCount(deals.length)})</Title>
      
      <DealsGrid>
        {deals.map(deal => (
          <DealCard key={deal._id}>
            <DealHeader>
              <DealName onClick={() => onOpenDeal(deal)}>
                {deal.name || `עסקה מ-${format(new Date(deal.createdAt), 'dd/MM/yyyy', { locale: he })}`}
              </DealName>
              <DealDate>
                {format(new Date(deal.createdAt), 'dd/MM/yyyy HH:mm', { locale: he })}
              </DealDate>
            </DealHeader>
            
            <DealInfo onClick={() => onOpenDeal(deal)}>
              <InfoRow>
                <InfoLabel>מחיר נכס:</InfoLabel>
                <InfoValue>{formatCurrency(deal.propertyValue)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>הון עצמי:</InfoLabel>
                <InfoValue>{formatCurrency(deal.equity)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>שכירות חודשית:</InfoLabel>
                <InfoValue>{formatCurrency(deal.monthlyRent)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>תשואה שנתית:</InfoLabel>
                <InfoValue>
                  {deal.results && typeof deal.results.equityYield === 'number'
                    ? deal.results.equityYield.toFixed(2) + '%'
                    : '-'}
                </InfoValue>
              </InfoRow>
            </DealInfo>
            
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={selectedDeals.includes(deal._id)}
                onChange={() => toggleDealSelection(deal._id)}
              />
              <span>בחר להשוואה</span>
            </CheckboxLabel>
          </DealCard>
        ))}
      </DealsGrid>
      
      {selectedDeals.length >= 2 && (
        <CompareButton onClick={handleCompare}>
          השווה {selectedDeals.length} עסקאות
        </CompareButton>
      )}
    </PortfolioContainer>
  );
};

export default MyPortfolio; 