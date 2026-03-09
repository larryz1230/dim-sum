import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { handleLogin } from '../services/api'
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate])

  const onLoginSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: loginError } = await handleLogin(email, password)

    if (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
      setLoading(false)
    } else if (data) {
      navigate('/dashboard')
    }
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
            {loading ? 'Verifying...' : 'Login'}
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