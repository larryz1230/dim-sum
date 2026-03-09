import React from 'react';
import './GameOver.css';
import { useNavigate } from 'react-router-dom';
import youWinImg from '../../imgs/YouWin.png';
import youLoseImg from '../../imgs/YouLose.png';

export const GameOver = ({ player1, player2, onClose }) => {
  const navigate = useNavigate();
  const isWin = player1 > player2;
  const isTie = player1 === player2;
  const isLose = player1 < player2;
  const bgImage = isWin || isTie ? youWinImg : youLoseImg;

  return (
    <>
      <div className="game-over-overlay" onClick={onClose} />
      <div
        className="game-over-modal game-over-modal--multiplayer"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="game-over-content">
          <div className="game-over-text">
            <h1 className="game-over-score">{player1}</h1>
            <p className="game-over-title">
              {isWin ? 'You Win!' : isLose ? 'You Lose!' : 'It\'s a tie!'}
            </p>
          </div>
          <button className="game-over-button" onClick={() => navigate('/dashboard')}>
            Return to Lobby
          </button>
        </div>
      </div>
    </>
  );
};

