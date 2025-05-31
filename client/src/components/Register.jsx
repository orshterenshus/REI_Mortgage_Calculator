import React, { useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';

const RegisterContainer = styled.div`
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

const Register = ({ onRegisterSuccess, switchToLogin }) => {
  const [form, setForm] = useState({
    password: '',
    fullName: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', form);
      setSuccess('נרשמת בהצלחה! אפשר להתחבר');
      setLoading(false);
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <RegisterContainer>
      <Title>הרשמה</Title>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {success && <SuccessMsg>{success}</SuccessMsg>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">שם מלא</label>
          <input id="fullName" name="fullName" type="text" value={form.fullName} onChange={handleChange} required disabled={loading} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="email">דוא"ל</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required disabled={loading} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="password">סיסמה</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required disabled={loading} className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'נרשם...' : 'הרשם'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button type="button" onClick={switchToLogin} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
          יש לך כבר חשבון? התחבר
        </button>
      </div>
    </RegisterContainer>
  );
};

export default Register; 