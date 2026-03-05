import React from 'react';
import './GameOver.css';
import { useNavigate } from 'react-router-dom';

export const GameOver = ({ player1, player2, onClose }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="game-over-overlay" onClick={onClose} />
      <div className="game-over-modal">
        <h1 className="game-over-title">
          You scored: {player1} {player1 > player2 ? ' - You win!' : player1 < player2 ? ' - You lose!' : ' - It\'s a tie!'}
        </h1>
        <button className="game-over-button" onClick={() => navigate('/matchmake')}>
          Return to Lobby
        </button>
      </div>
    </>
  );
};

