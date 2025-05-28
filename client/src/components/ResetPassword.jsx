import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import axios from 'axios';

const ResetContainer = styled.div`
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0, 0.08);
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
  color: # 080;
  margin-bottom: 1rem;
  text-align: center;
`;

const ResetPassword = ({ switchToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [loading, setLoading] = useState(false);
 const location = useLocation();
 const navigate = useNavigate();

 useEffect(() => {
  const query = new URLSearchParams(location.search);
  const tokenParam = query.get('token');
  if (tokenParam) {
   setToken(tokenParam);
  } else {
   setError('לא נמצא טוקן איפוס סיסמה. אנא בדוק את הקישור.');
  }
 }, [location]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (newPassword !== confirmPassword) {
   setError('הסיסמאות אינן תואמות');
   return;
  }
  setError('');
  setSuccess('');
  setLoading(true);
  try {
   await axios.post('/api/auth/reset-password', { token, newPassword });
   setSuccess('הסיסמה עודכנה בהצלחה. אנא התחבר מחדש.');
   setTimeout(() => { switchToLogin(); }, 3000);
  } catch (err) {
   setError(err.response?.data?.message || 'שגיאה באיפוס סיסמה');
  } finally {
   setLoading(false);
  }
 };

 return (
  <ResetContainer>
   <Title>איפוס סיסמה</Title>
   {error && <ErrorMsg>{error}</ErrorMsg>}
   {success && <SuccessMsg>{success}</SuccessMsg>}
   <form onSubmit={handleSubmit}>
    <div className="form-group">
     <label htmlFor="newPassword">סיסמה חדשה</label>
     <input id="newPassword" name="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={loading} className="form-control" />
    </div>
    <div className="form-group">
     <label htmlFor="confirmPassword">אימות סיסמה חדשה</label>
     <input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading} className="form-control" />
    </div>
    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
     {loading ? 'מעדכן...' : 'עדכן סיסמה'}
    </button>
   </form>
   <div style={{ textAlign: 'center', marginTop: '1rem' }}>
    <button type="button" onClick={switchToLogin} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
     חזרה להתחברות
    </button>
   </div>
  </ResetContainer>
 );
};

export default ResetPassword; 