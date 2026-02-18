import React from 'react';
import './GameOver.css';

export const GameOver = ({ result, score, onReplay, onClose }) => {
  return (
    <>
      <div className="game-over-overlay" onClick={onClose} />
      <div className="game-over-modal">
        <h1 className="game-over-title">
          You scored: {score}
        </h1>
        <button className="game-over-button" onClick={onReplay}>
          Replay
        </button>
      </div>
    </>
  );
};

