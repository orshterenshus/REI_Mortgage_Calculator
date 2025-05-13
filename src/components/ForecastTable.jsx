import React from 'react';
import styled from '@emotion/styled';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatting';

const TableContainer = styled.div`
  margin-bottom: 2rem;
  overflow-x: auto;
`;

const ForecastTable = ({ forecast }) => {
  if (!forecast || !forecast.length) return null;
  
  return (
    <TableContainer className="card">
      <h2>תחזית שנתית</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>שנה</th>
              <th>שווי נכס</th>
              <th>מחיר שוק</th>
              <th>יתרת משכנתה</th>
              <th>הון עצמי נצבר</th>
              <th>תזרים שנתי</th>
              <th>תזרים מצטבר</th>
              <th>רווח כולל באחוזים</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>{formatCurrency(item.propertyValue)}</td>
                <td>{formatCurrency(item.marketValue)}</td>
                <td>{formatCurrency(item.remainingLoan)}</td>
                <td>{formatCurrency(item.equity)}</td>
                <td
                  style={{
                    color: item.yearlyCashflow >= 0 ? '#27ae60' : '#e74c3c',
                  }}
                >
                  {formatCurrency(item.yearlyCashflow)}
                </td>
                <td
                  style={{
                    color: item.accumulatedCashflow >= 0 ? '#27ae60' : '#e74c3c',
                  }}
                >
                  {formatCurrency(item.accumulatedCashflow)}
                </td>
                <td
                  style={{
                    color: item.totalProfitPercentage >= 0 ? '#27ae60' : '#e74c3c',
                  }}
                >
                  {formatPercentage(item.totalProfitPercentage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableContainer>
  );
};

export default ForecastTable; 