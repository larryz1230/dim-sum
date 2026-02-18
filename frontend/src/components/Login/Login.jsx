import React from 'react';
import happyBun from '../../../../imgs/Happy Bun.png';
import sadBun from '../../../../imgs/Sad Bun.png';
import './Login.css';

export const Login = ({ onClose }) => {
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
          <div className="login-field">
            <label className="login-label">Username</label>
            <input type="text" className="login-input" />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input type="password" className="login-input" />
          </div>
          <div className="login-buttons">
            <button className="login-button">Login</button>
            <button className="login-button">Signup</button>
          </div>
        </div>
      </div>
    </>
  );
};

