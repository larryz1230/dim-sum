/**
 * GameCell Component
 * Individual cell in the game board that displays a number (1-9)
 */

import React from 'react';
import bunImage from '../../imgs/individual bao 2.png';
import './GameCell.css';

export const GameCell = ({
  cell,
  isSelected,
  isClearing = false,
  isPendingRemoval = false,
  disabled = false,
}) => {
  // If cell has been removed, value should be 0
  if (cell.value === 0) {
    return <div className="game-cell game-cell--empty" />;
  }

  const className = [
    'game-cell',
    isSelected ? 'game-cell--selected' : '',
    isClearing ? 'game-cell--clearing' : '',
    isPendingRemoval ? 'game-cell--pending-removal' : '',
    disabled ? 'game-cell--disabled' : '',
  ].filter(Boolean).join(' ');


  return (
    <div
      className={className}
      aria-label={`Cell ${cell.row}, ${cell.col} with value ${cell.value}`}
      style={{ backgroundImage: `url(${bunImage})` }}
    >
      <span className="game-cell__value">{cell.value}</span>
    </div>
  );
};

