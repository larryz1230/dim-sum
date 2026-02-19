import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { handleSignUp } from '../services/api';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onRegisterSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await handleSignUp(email, password);

    if (signUpError) {
      setError(signUpError instanceof Error ? signUpError.message : 'Registration failed');
      setLoading(false);
    } else {
      alert('Registration successful! Please check your email to verify your account before logging in.');
      navigate('/login');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Create a New Account</h2>
        <p className="auth-subtitle">Join Dumpling Destroyer and start learning!</p>
        
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={onRegisterSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
