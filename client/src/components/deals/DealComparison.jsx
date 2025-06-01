import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ComparisonContainer = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--primary);
`;

const DealsInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
`;

const DealCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: var(--primary);
  }
  
  p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: var(--text);
  }
`;

const MetricsTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  th, td {
    padding: 1rem;
    text-align: right;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: var(--primary);
    color: white;
    font-weight: 500;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  td:first-child {
    font-weight: 500;
    color: var(--text-secondary);
  }
`;

const BackButton = styled.button`
  background-color: var(--secondary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
    background-color: var(--secondary-dark);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
`;

const DealComparison = ({ dealIds, onBack }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, [dealIds]);

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const dealPromises = dealIds.map(id => 
        axios.get(`/api/deals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      
      const responses = await Promise.all(dealPromises);
      const fetchedDeals = responses.map(res => res.data.deal || res.data);
      setDeals(fetchedDeals);
    } catch (err) {
      setError('שגיאה בטעינת העסקאות להשוואה');
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getChartColors = () => [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#16a085', '#27ae60', '#2980b9'
  ];

  if (loading) return <LoadingMessage>טוען עסקאות להשוואה...</LoadingMessage>;
  if (error) return <LoadingMessage>{error}</LoadingMessage>;
  if (deals.length === 0) return <LoadingMessage>לא נמצאו עסקאות להשוואה</LoadingMessage>;

  const colors = getChartColors();

  // Prepare data for charts
  const dealNames = deals.map((deal, idx) => deal.name || `עסקה ${idx + 1}`);
  
  const purchasePriceData = {
    labels: dealNames,
    datasets: [{
      label: 'מחיר רכישה',
      data: deals.map(deal => deal.propertyValue || 0),
      backgroundColor: colors.slice(0, deals.length),
      borderWidth: 1
    }]
  };

  const annualReturnData = {
    labels: dealNames,
    datasets: [{
      label: 'תשואה שנתית (%)',
      data: deals.map(deal => deal.results?.annualReturn || 0),
      backgroundColor: colors.slice(0, deals.length),
      borderWidth: 1
    }]
  };

  const monthlyIncomeData = {
    labels: dealNames,
    datasets: [{
      label: 'הכנסה חודשית נטו',
      data: deals.map(deal => deal.results?.netMonthlyIncome || 0),
      backgroundColor: colors.slice(0, deals.length),
      borderWidth: 1
    }]
  };

  const cashflowData = {
    labels: Array.from({ length: 10 }, (_, i) => `שנה ${i + 1}`),
    datasets: deals.map((deal, idx) => ({
      label: dealNames[idx],
      data: deal.forecast?.slice(0, 10).map(year => year.netCashFlow) || [],
      borderColor: colors[idx],
      backgroundColor: colors[idx] + '20',
      tension: 0.1
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        rtl: true,
        labels: {
          font: {
            family: 'Heebo'
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Heebo'
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Heebo'
          }
        }
      }
    }
  };

  return (
    <ComparisonContainer>
      <BackButton onClick={onBack}>חזרה לתיק</BackButton>
      
      <PageTitle>השוואת {deals.length} עסקאות</PageTitle>
      
      <DealsInfo>
        {deals.map((deal, idx) => (
          <DealCard key={deal._id}>
            <h4 style={{ color: colors[idx] }}>{dealNames[idx]}</h4>
            <p>מחיר: {formatCurrency(deal.propertyValue)}</p>
            <p>שכירות חודשית: {formatCurrency(deal.monthlyRent)}</p>
            <p>תשואה שנתית: {deal.results?.annualReturn?.toFixed(2)}%</p>
          </DealCard>
        ))}
      </DealsInfo>

      <ChartsGrid>
        <ChartCard>
          <h3>מחירי רכישה</h3>
          <div style={{ height: '300px' }}>
            <Bar data={purchasePriceData} options={chartOptions} />
          </div>
        </ChartCard>

        <ChartCard>
          <h3>תשואה שנתית</h3>
          <div style={{ height: '300px' }}>
            <Bar data={annualReturnData} options={chartOptions} />
          </div>
        </ChartCard>

        <ChartCard>
          <h3>הכנסה חודשית נטו</h3>
          <div style={{ height: '300px' }}>
            <Bar data={monthlyIncomeData} options={chartOptions} />
          </div>
        </ChartCard>

        <ChartCard style={{ gridColumn: 'span 2' }}>
          <h3>תזרים מזומנים לאורך 10 שנים</h3>
          <div style={{ height: '300px' }}>
            <Line data={cashflowData} options={chartOptions} />
          </div>
        </ChartCard>
      </ChartsGrid>

      <MetricsTable>
        <thead>
          <tr>
            <th>מדד</th>
            {dealNames.map((name, idx) => (
              <th key={idx}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>מחיר רכישה</td>
            {deals.map((deal, idx) => (
              <td key={idx}>{formatCurrency(deal.propertyValue)}</td>
            ))}
          </tr>
          <tr>
            <td>הון עצמי</td>
            {deals.map((deal, idx) => (
              <td key={idx}>{formatCurrency(deal.equity)}</td>
            ))}
          </tr>
          <tr>
            <td>משכנתא</td>
            {deals.map((deal, idx) => (
              <td key={idx}>{formatCurrency((deal.propertyValue || 0) - (deal.equity || 0))}</td>
            ))}
          </tr>
          <tr>
            <td>שכירות חודשית</td>
            {deals.map((deal, idx) => (
              <td key={idx}>{formatCurrency(deal.monthlyRent)}</td>
            ))}
          </tr>
          <tr>
            <td>תשואה שנתית</td>
            {deals.map((deal, idx) => (
              <td key={idx}>{deal.results?.annualReturn?.toFixed(2)}%</td>
            ))}
          </tr>
          <tr>
            <td>תזרים חודשי נטו</td>
            {deals.map((deal, idx) => (
              <td key={idx}>{formatCurrency(deal.results?.netMonthlyIncome)}</td>
            ))}
          </tr>
          <tr>
            <td>סה״כ רווח ב-10 שנים</td>
            {deals.map((deal, idx) => (
              <td key={idx}>{formatCurrency(deal.forecast?.[9]?.cumulativeProfit || 0)}</td>
            ))}
          </tr>
        </tbody>
      </MetricsTable>
    </ComparisonContainer>
  );
};

export default DealComparison; 