import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import ResultsSummary from '../calculator/ResultsSummary';
import ForecastTable from '../tables/ForecastTable';
import PropertyValueChart from '../charts/PropertyValueChart';
import CashflowChart from '../charts/CashflowChart';
import ProfitChart from '../charts/ProfitChart';
import axios from 'axios';

const ViewerContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const ViewerHeader = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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

const DealTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary);
`;

const DealInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
`;

const DealDate = styled.div`
  font-size: 0.9rem;
  color: black;
  margin-top: 1rem;
  text-align: right;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  direction: rtl;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: black;
  margin: 0;
  text-align: right;
`;

const ClientSubtitle = styled.div`
  font-size: 1.2rem;
  color: black;
  margin-top: 0.5rem;
  text-align: right;
  font-weight: 500;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 1rem;
  direction: ltr;
`;

const DealViewer = ({ deal, onBack, onBackToPortfolio, userRole, clientEmail }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [clientInfo, setClientInfo] = useState(null);

  useEffect(() => {
    if (userRole === 'admin' && clientEmail) {
      fetchClientInfo();
    }
  }, [userRole, clientEmail]);

  const fetchClientInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/auth/users/${encodeURIComponent(clientEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setClientInfo(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
    }
  };

  if (!deal) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value || 0).toFixed(2)}%`;
  };

  // Get client name for admin view
  const getClientDisplayName = () => {
    if (userRole === 'admin' && clientEmail) {
      if (clientInfo && clientInfo.fullName) {
        return clientInfo.fullName;
      }
      return clientEmail; // Fallback to email
    }
    return null;
  };

  const clientName = getClientDisplayName();

  // Convert deal data to inputs format for components that expect it
  const inputs = {
    propertyValue: deal.propertyValue || 0,
    purchaseExpenseRate: deal.purchaseTaxRate || 0,
    equity: deal.equity || 0,
    annualInterestRate: deal.annualInterestRate || 4.0,
    years: deal.loanTerm || 0,
    monthlyRent: deal.monthlyRent || 0,
    expenseRate: deal.annualExpensesRate || 0,
    annualAppreciationRate: deal.annualAppreciationRate || 0,
    renovationCost: deal.otherExpenses || 0
  };

  return (
    <ViewerContainer>
      <Header>
        <div>
          <Title>
            {deal.address || deal.name || `עסקה מ-${format(new Date(deal.createdAt), 'dd/MM/yyyy')}`}
          </Title>
          {clientName && (
            <ClientSubtitle>לקוח: {clientName}</ClientSubtitle>
          )}
        </div>
        
        <NavigationButtons>
          {userRole === 'admin' && clientEmail ? (
            <>
              <BackButton onClick={onBackToPortfolio || onBack}>← חזרה לתיק הלקוח</BackButton>
              <BackButton onClick={onBack}>← חזרה לכל הלקוחות</BackButton>
            </>
          ) : (
            <BackButton onClick={onBack}>← חזרה לתיק שלי</BackButton>
          )}
        </NavigationButtons>
      </Header>
      
      <ViewerHeader>
        <DealInfo>
          <InfoCard>
            <InfoLabel>מחיר נכס</InfoLabel>
            <InfoValue>{formatCurrency(deal.propertyValue)}</InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>הון עצמי</InfoLabel>
            <InfoValue>{formatCurrency(deal.equity)}</InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>שכירות חודשית</InfoLabel>
            <InfoValue>{formatCurrency(deal.monthlyRent)}</InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>תקופת המשכנתא</InfoLabel>
            <InfoValue>{deal.loanTerm} שנים</InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>ריבית שנתית</InfoLabel>
            <InfoValue>{deal.annualInterestRate}%</InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>תשואה שנתית</InfoLabel>
            <InfoValue>
              {deal.results && typeof deal.results.equityYield === 'number'
                ? deal.results.equityYield.toFixed(2) + '%'
                : '-'}
            </InfoValue>
          </InfoCard>
        </DealInfo>
        
        <DealDate>
          נוצר ב-{format(new Date(deal.createdAt), 'dd/MM/yyyy HH:mm', { locale: he })}
        </DealDate>
      </ViewerHeader>

      {deal.results && (
        <>
          <ResultsSummary 
            results={deal.results} 
            inputs={inputs} 
            years={inputs.years} 
          />
          
          {deal.forecast && deal.forecast.length > 0 && (
            <>
              <ChartsGrid>
                <PropertyValueChart forecast={deal.forecast} />
                <CashflowChart forecast={deal.forecast} />
                <ProfitChart forecast={deal.forecast} results={deal.results} />
              </ChartsGrid>
              
              <ForecastTable 
                forecast={deal.forecast} 
                years={inputs.years}
                totalInvestment={deal.results?.totalInvestment}
              />
            </>
          )}
        </>
      )}
    </ViewerContainer>
  );
};

export default DealViewer; 