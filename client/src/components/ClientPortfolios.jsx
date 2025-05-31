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
  color: black;
`;

const ClientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ClientCard = styled.div`
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

const ClientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ClientName = styled.h3`
  font-size: 1.3rem;
  margin: 0;
  color: var(--text);
`;

const DealCount = styled.span`
  background-color: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const ClientInfo = styled.div`
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
`;

const ClientDeals = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const DealsTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text);
`;

const DealsList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const DealItem = styled.div`
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
`;

const DealItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`;

const DealItemName = styled.span`
  font-weight: 500;
  color: var(--text);
`;

const DealItemDate = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const DealItemInfo = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
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

const SearchBox = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  margin-bottom: 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const ClientPortfolios = ({ onOpenDeal, onViewClientPortfolio }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientPortfolios();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const fetchClientPortfolios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/deals/client-portfolios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setClients(response.data.clients);
        setFilteredClients(response.data.clients);
      }
    } catch (err) {
      setError('שגיאה בטעינת תיקי הלקוחות');
      console.error('Error fetching client portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(client => {
      const fullName = (client.fullName || '').toLowerCase();
      const email = client._id.toLowerCase();
      const term = searchTerm.toLowerCase();
      
      return fullName.includes(term) || email.includes(term);
    });

    setFilteredClients(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatClientsCount = (count) => {
    if (count === 1) {
      return 'לקוח 1';
    }
    return `${count} לקוחות`;
  };

  const formatDealsCount = (count) => {
    if (count === 1) {
      return 'עסקה 1';
    }
    return `${count} עסקאות`;
  };

  if (loading) return <LoadingMessage>טוען תיקי לקוחות...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (clients.length === 0) {
    return (
      <PortfolioContainer>
        <Title>תיקי לקוחות</Title>
        <LoadingMessage>אין לקוחות במערכת עדיין</LoadingMessage>
      </PortfolioContainer>
    );
  }

  return (
    <PortfolioContainer>
      <Title>תיקי לקוחות ({formatClientsCount(clients.length)})</Title>
      
      <SearchBox
        type="text"
        placeholder="חפש לפי שם או דוא״ל..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <ClientsGrid>
        {filteredClients.map(client => (
          <ClientCard key={client._id} onClick={() => onViewClientPortfolio && onViewClientPortfolio(client._id)}>
            <ClientHeader>
              <ClientName>
                {client.fullName || client._id}
              </ClientName>
              <DealCount>{formatDealsCount(client.dealCount)}</DealCount>
            </ClientHeader>
            
            <ClientInfo>
              <InfoRow>
                <InfoLabel>דוא״ל:</InfoLabel>
                <InfoValue>{client._id}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>עסקה אחרונה:</InfoLabel>
                <InfoValue>
                  {format(new Date(client.lastDealDate), 'dd/MM/yyyy', { locale: he })}
                </InfoValue>
              </InfoRow>
            </ClientInfo>
          </ClientCard>
        ))}
      </ClientsGrid>
    </PortfolioContainer>
  );
};

export default ClientPortfolios; 