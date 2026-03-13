import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { handleLogin } from '../services/api'
import { useAuth } from '../hooks/useAuth';
import './Login.css'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      console.log('[Login] Session detected, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const onLoginSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: loginError } = await handleLogin(email, password)

      if (loginError) {
        setError(loginError instanceof Error ? loginError.message : 'Login failed')
        setIsSubmitting(false)
      } 
    } catch (err) {
      setError('Unexpected error occurred')
      setIsSubmitting(false)
    }
  }
  if (authLoading) {
    return <div className="auth-wrapper">Loading session...</div>;
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Dumpling Destroyer</h2>
        <p className="auth-subtitle">Login to start clearing the board</p>
        
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={onLoginSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          New player? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

export default Login