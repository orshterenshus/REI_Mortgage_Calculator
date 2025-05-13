import React from 'react';
import styled from '@emotion/styled';
import { formatCurrency, formatPercentage } from '../utils/formatting';

const SummaryContainer = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: var(--primary-dark);
  font-size: 1.2rem;
`;

const NoteText = styled.p`
  font-size: 0.8rem;
  color: var(--text-light);
  font-style: italic;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ResultsSummary = ({ results, inputs }) => {
  if (!results) return null;
  
  const { 
    purchaseExpenses,
    mortgageAmount,
    monthlyPayment,
    annualPayment,
    annualPrincipalRepayment,
    monthlyPrincipalRepayment,
    annualIncome,
    annualNetIncome,
    annualCashflow,
    totalInvestment,
    propertyYield,
    equityYield,
    marketValue
  } = results;
  
  // Check if interest rate is around 4%
  const isUsingTableData = Math.abs(inputs.annualInterestRate - 4.0) < 0.1;
  
  return (
    <SummaryContainer className="card">
      <h2>תוצאות חישוב</h2>
      
      <SectionTitle>אומדן השקעה</SectionTitle>
      <div className="results-grid">
        <div className="result-card">
          <h3>סכום הרכישה</h3>
          <div className="value">{formatCurrency(inputs.propertyValue)}</div>
        </div>
        <div className="result-card">
          <h3>הוצאות רכישה</h3>
          <div className="value">{formatCurrency(purchaseExpenses)}</div>
        </div>
        <div className="result-card">
          <h3>הון עצמי</h3>
          <div className="value">{formatCurrency(inputs.equity)}</div>
        </div>
        <div className="result-card">
          <h3>משכנתא</h3>
          <div className="value">{formatCurrency(mortgageAmount)}</div>
        </div>
        <div className="result-card">
          <h3>סך השקעה</h3>
          <div className="value">{formatCurrency(totalInvestment)}</div>
        </div>
      </div>
      
      <SectionTitle>מימון</SectionTitle>
      {isUsingTableData && (
        <NoteText>* ההחזר החודשי מחושב לפי טבלת החזרים מדויקת לריבית 4.00%</NoteText>
      )}
      <div className="results-grid">
        <div className="result-card">
          <h3>החזר חודשי</h3>
          <div className="value">{formatCurrency(monthlyPayment)}</div>
        </div>
        <div className="result-card">
          <h3>החזר שנתי</h3>
          <div className="value">{formatCurrency(annualPayment)}</div>
        </div>
        <div className="result-card">
          <h3>החזר קרן חודשי</h3>
          <div className="value">{formatCurrency(monthlyPrincipalRepayment)}</div>
        </div>
        <div className="result-card">
          <h3>החזר קרן שנתי</h3>
          <div className="value">{formatCurrency(annualPrincipalRepayment)}</div>
        </div>
      </div>
      
      <SectionTitle>השבחת הנכס</SectionTitle>
      <div className="results-grid">
        <div className="result-card">
          <h3>מחיר שוק</h3>
          <div className="value">{formatCurrency(marketValue)}</div>
        </div>
        <div className="result-card">
          <h3>אחוז השבחה שנתי</h3>
          <div className="value">{formatPercentage(inputs.annualAppreciationRate)}</div>
        </div>
      </div>
      
      <SectionTitle>הכנסות ורווחיות</SectionTitle>
      <div className="results-grid">
        <div className="result-card">
          <h3>הכנסה משכירות חודשית</h3>
          <div className="value">{formatCurrency(inputs.monthlyRent)}</div>
        </div>
        <div className="result-card">
          <h3>הכנסה שנתית</h3>
          <div className="value">{formatCurrency(annualIncome)}</div>
        </div>
        <div className="result-card">
          <h3>הכנסה שנתית נטו</h3>
          <div className="value">{formatCurrency(annualNetIncome)}</div>
        </div>
        <div className="result-card">
          <h3>תזרים מזומנים שנתי</h3>
          <div className="value" style={{ color: annualCashflow >= 0 ? '#27ae60' : '#e74c3c' }}>
            {formatCurrency(annualCashflow)}
          </div>
        </div>
        <div className="result-card">
          <h3>תשואת נכס</h3>
          <div className="value">{formatPercentage(propertyYield)}</div>
        </div>
        <div className="result-card">
          <h3>תשואה על הון</h3>
          <div className="value" style={{ color: equityYield >= 0 ? '#27ae60' : '#e74c3c' }}>
            {formatPercentage(equityYield)}
          </div>
        </div>
      </div>
    </SummaryContainer>
  );
};

export default ResultsSummary;
