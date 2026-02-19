import React, { useState } from 'react';
import happyBun from '../../imgs/Happy Bun.png';
import sadBun from '../../imgs/Sad Bun.png';
import { handleLogin, handleSignUp } from '../../services/api';
import './Login.css';

export const Login = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginClick = async () => {
    setError('');
    setLoading(true);
    
    try {
      const { data, error: loginError } = await handleLogin(email, password);
      
      if (loginError) {
        setError(loginError instanceof Error ? loginError.message : 'Login failed');
        setLoading(false);
      } else if (data) {
        setLoading(false);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch. Please check your connection and Supabase configuration.');
      setLoading(false);
    }
  };

  const handleSignupClick = async () => {
    setError('');
    setLoading(true);
    
    try {
      const { data, error: signupError } = await handleSignUp(email, password);
      
      if (signupError) {
        let errorMessage = signupError instanceof Error ? signupError.message : 'Registration failed';
        
        // Provide helpful message for rate limit errors
        if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          errorMessage = 'Too many signup attempts. Please wait a few minutes and try again, or use a different email address.';
        }
        
        setError(errorMessage);
        setLoading(false);
      } else {
        // Success - even if data is null, no error means signup was initiated
        setLoading(false);
        alert('Registration successful! Please check your email to verify your account before logging in.');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch. Please check your connection and Supabase configuration.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-overlay" onClick={onClose} />
      <div className="login-modal">
        <div className="login-buns">
          <img src={happyBun} alt="Happy Bun" className="login-bun" />
          <img src={sadBun} alt="Sad Bun" className="login-bun" />
          <img src={happyBun} alt="Happy Bun" className="login-bun" />
          <img src={sadBun} alt="Sad Bun" className="login-bun" />
        </div>
        <div className="login-form">
          {error && <div className="login-error">{error}</div>}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input 
              type="email" 
              className="login-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input 
              type="password" 
              className="login-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          <div className="login-buttons">
            <button 
              className="login-button" 
              onClick={handleLoginClick}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
            <button 
              className="login-button" 
              onClick={handleSignupClick}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Signup'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

