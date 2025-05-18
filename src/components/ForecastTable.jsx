import React from 'react';
import styled from '@emotion/styled';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatting';

const TableContainer = styled.div`
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: center;
    border: 1px solid #e0e0e0;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  
  tr:nth-of-type(even) {
    background-color: #f9f9f9;
  }
`;

const ForecastTable = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;
  
  return (
    <TableContainer className="card">
      <h2>תחזית שנתית</h2>
      <div className="table-container">
        <StyledTable>
          <thead>
            <tr>
              <th>תשואה הונית</th>
              <th>הון עצמי</th>
              <th>יתרת הלוואה</th>
              <th>שווי נכס</th>
              <th>השקעת נכס</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((item) => (
              <tr key={item.year}>
                <td dir="ltr" className={item.equityPercentage >= 0 ? 'profit-value' : 'loss-value'}>
                  {formatPercentage(item.equityPercentage)}%
                </td>
                <td dir="ltr">{formatCurrency(item.equity)}</td>
                <td dir="ltr">{formatCurrency(item.remainingLoan)}</td>
                <td dir="ltr">{formatCurrency(item.marketValue)}</td>
                <td>{item.year}</td>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </div>
    </TableContainer>
  );
};

export default ForecastTable; 