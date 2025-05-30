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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  direction: rtl;
`;

const BackButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  margin: 0;
  color: black;
  text-align: right;
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

const ClientPortfolioView = ({ clientEmail, onOpenDeal, onBack }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    if (clientEmail) {
      fetchClientDeals();
    }
  }, [clientEmail]);

  const fetchClientDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/deals/client/${encodeURIComponent(clientEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDeals(response.data.deals);
        
        // Get client info from User model separately
        const userResponse = await axios.get(`/api/auth/users/${encodeURIComponent(clientEmail)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userResponse.data.success) {
          setClientInfo({
            email: clientEmail,
            firstName: userResponse.data.user.firstName || '',
            lastName: userResponse.data.user.lastName || ''
          });
        } else {
          // Fallback - use email as display name
          setClientInfo({
            email: clientEmail,
            firstName: '',
            lastName: ''
          });
        }
      }
    } catch (err) {
      setError('שגיאה בטעינת עסקאות הלקוח');
      console.error('Error fetching client deals:', err);
      
      // Set basic client info even if there's an error
      setClientInfo({
        email: clientEmail,
        firstName: '',
        lastName: ''
      });
    } finally {
      setLoading(false);
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

  if (loading) return <LoadingMessage>טוען עסקאות הלקוח...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  const clientName = clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName}`.trim() : clientEmail;

  return (
    <PortfolioContainer>
      <Header>
        <Title>תיק של {clientName} ({formatDealsCount(deals.length)})</Title>
        <BackButton onClick={onBack}>← חזרה לתיקי לקוחות</BackButton>
      </Header>
      
      {deals.length === 0 ? (
        <LoadingMessage>אין עסקאות שמורות עבור לקוח זה</LoadingMessage>
      ) : (
        <DealsGrid>
          {deals.map(deal => (
            <DealCard key={deal._id} onClick={() => onOpenDeal(deal)}>
              <DealHeader>
                <DealName>
                  {deal.name || `עסקה מ-${format(new Date(deal.createdAt), 'dd/MM/yyyy', { locale: he })}`}
                </DealName>
                <DealDate>
                  {format(new Date(deal.createdAt), 'dd/MM/yyyy HH:mm', { locale: he })}
                </DealDate>
              </DealHeader>
              
              <DealInfo>
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
            </DealCard>
          ))}
        </DealsGrid>
      )}
    </PortfolioContainer>
  );
};

export default ClientPortfolioView; 