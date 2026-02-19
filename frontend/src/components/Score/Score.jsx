import React from 'react';
import './Score.css';

export const Score = ({ score, gameMode = 'singleplayer', opponentScore = 0 }) => {
  const isMultiplayer = gameMode === 'multiplayer';

  return (
    <div className="score-panel">
      <div className="score-panel__row">
        <span className="score-panel__label">My score:</span>
        <span className="score-panel__value">{score}</span>
      </div>
      {isMultiplayer && (
        <div className="score-panel__row">
          <span className="score-panel__label">Opponent's score:</span>
          <span className="score-panel__value">{opponentScore}</span>
        </div>
      )}
    </div>
  );
};

