import React, { useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';

const ForgotContainer = styled.div`
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ErrorMsg = styled.div`
  color: #c00;
  margin-bottom: 1rem;
  text-align: center;
`;

const SuccessMsg = styled.div`
  color: #080;
  margin-bottom: 1rem;
  text-align: center;
`;

const ForgotPassword = ({ switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('אם כתובת הדוא"ל קיימת, נשלח קישור לאיפוס סיסמה');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה בשליחת הבקשה');
    }
  };

  return (
    <ForgotContainer>
      <Title>שכחתי סיסמה</Title>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {success && <SuccessMsg>{success}</SuccessMsg>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">דוא"ל</label>
          <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button type="button" onClick={switchToLogin} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
          חזרה להתחברות
        </button>
      </div>
    </ForgotContainer>
  );
};

export default ForgotPassword; 