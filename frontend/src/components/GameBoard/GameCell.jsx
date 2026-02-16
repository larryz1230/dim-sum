/**
 * GameCell Component
 * Individual cell in the game board that displays a number (1-9)
 */

import React from 'react';
import './GameCell.css';

export const GameCell = ({
  cell,
  isSelected,
  disabled = false,
}) => {
  // If cell has been removed, value should be 0
  if (cell.value === 0) {
    return <div className="game-cell game-cell--empty" />;
  }

  return (
    <div
      className={`game-cell ${isSelected ? 'game-cell--selected' : ''}`}
      aria-label={`Cell ${cell.row}, ${cell.col} with value ${cell.value}`}
    >
      <span className="game-cell__value">{cell.value}</span>
    </div>
  );
};

