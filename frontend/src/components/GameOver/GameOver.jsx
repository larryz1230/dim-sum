import React from 'react';
import './GameOver.css';

export const GameOver = ({ result, onReplay, onClose }) => {
  return (
    <>
      <div className="game-over-overlay" onClick={onClose} />
      <div className="game-over-modal">
        <h1 className="game-over-title">
          {result === 'win' ? 'You Won!' : 'You Lost!'}
        </h1>
        <button className="game-over-button" onClick={onReplay}>
          Replay
        </button>
      </div>
    </>
  );
};

