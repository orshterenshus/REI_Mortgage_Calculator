import React from 'react';
import styled from '@emotion/styled';

const FormContainer = styled.div`
  margin-bottom: 2rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 2s linear infinite;
  display: inline-block;
  margin-left: 10px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button = styled.button`
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const InputForm = ({ inputs, setInputs, onCalculate, onSave, onClear, isCalculating }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value === '' ? '' : parseFloat(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCalculating) return;
    await onCalculate();
  };

  return (
    <FormContainer className="card">
      <h2>נתוני השקעה</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-grid">
          <div className="form-group">
            <label htmlFor="propertyValue">סכום הרכישה</label>
            <input
              type="number"
              id="propertyValue"
              name="propertyValue"
              className="form-control"
              value={inputs.propertyValue ?? ''}
              onChange={handleChange}
              min="0"
              step="10000"
              required
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="purchaseExpenseRate">אחוז הוצאות רכישה</label>
            <input
              type="number"
              id="purchaseExpenseRate"
              name="purchaseExpenseRate"
              className="form-control"
              value={inputs.purchaseExpenseRate ?? ''}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="equity">הון עצמי</label>
            <input
              type="number"
              id="equity"
              name="equity"
              className="form-control"
              value={inputs.equity ?? ''}
              onChange={handleChange}
              min="0"
              step="10000"
              required
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="renovationCost">השקעה בנכס</label>
            <input
              type="number"
              id="renovationCost"
              name="renovationCost"
              className="form-control"
              value={inputs.renovationCost ?? ''}
              onChange={handleChange}
              min="0"
              step="5000"
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="purchaseTax">מס רכישה</label>
            <input
              type="number"
              id="purchaseTax"
              name="purchaseTax"
              className="form-control"
              value={inputs.purchaseTax ?? ''}
              onChange={handleChange}
              min="0"
              step="1000"
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="years">טווח שנים</label>
            <input
              type="number"
              id="years"
              name="years"
              className="form-control"
              value={inputs.years ?? ''}
              onChange={handleChange}
              min="1"
              max="50"
              step="1"
              required
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="marketValue">מחיר שוק</label>
            <input
              type="number"
              id="marketValue"
              name="marketValue"
              className="form-control"
              value={inputs.marketValue ?? ''}
              onChange={handleChange}
              min="0"
              step="10000"
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="annualAppreciationRate">אחוז השבחה שנתי</label>
            <input
              type="number"
              id="annualAppreciationRate"
              name="annualAppreciationRate"
              className="form-control"
              value={inputs.annualAppreciationRate ?? ''}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="monthlyRent">הכנסה משכירות חודשית</label>
            <input
              type="number"
              id="monthlyRent"
              name="monthlyRent"
              className="form-control"
              value={inputs.monthlyRent ?? ''}
              onChange={handleChange}
              min="0"
              step="100"
              required
              disabled={isCalculating}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="expenseRate">אחוז הוצאה שנתית</label>
            <input
              type="number"
              id="expenseRate"
              name="expenseRate"
              className="form-control"
              value={inputs.expenseRate ?? ''}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.5"
              disabled={isCalculating}
            />
          </div>
        </div>
        
        <div className="actions">
          <Button type="submit" className="btn" disabled={isCalculating}>
            {isCalculating ? (
              <>
                <LoadingSpinner /> מחשב...
              </>
            ) : 'חשב'}
          </Button>
          <Button type="button" className="btn btn-secondary" onClick={onSave} disabled={isCalculating}>
            שמור
          </Button>
          <Button type="button" className="btn" onClick={onClear} style={{ backgroundColor: '#e74c3c' }} disabled={isCalculating}>
            נקה
          </Button>
        </div>
      </form>
    </FormContainer>
  );
};

export default InputForm; 