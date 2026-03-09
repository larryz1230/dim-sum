import React from 'react';
import { useNavigate } from 'react-router-dom';
import arrowImg from '../../imgs/Arrow.png';
import './BackToDashboard.css';

export default function BackToDashboard() {
  const navigate = useNavigate();

  return (
    <button
      className="back-to-dashboard"
      onClick={() => navigate('/dashboard')}
      aria-label="Back to dashboard"
    >
      <img src={arrowImg} alt="" />
    </button>
  );
}
