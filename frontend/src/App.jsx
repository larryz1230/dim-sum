import React, { useState, useRef, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Timer } from './components/Timer';
import { GameOver } from './components/GameOver';
import settingsIcon from '../../imgs/Settings.png';
import './App.css';

// Create a sample game board
const createSampleBoard = (rows = 12, cols = 10) => {
  const cells = [];
  
  for (let row = 0; row < rows; row++) {
    const rowCells = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push({
        id: `cell-${row}-${col}`,
        value: Math.floor(Math.random() * 9) + 1, // Random 1-9
        row,
        col,
      });
    }
    cells.push(rowCells);
  }
  
  return cells;
};

function App() {
  const [cells, setCells] = useState(createSampleBoard(13, 17));
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [disabled, setDisabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null); // 'win' or 'lose'
  const [boardWidth, setBoardWidth] = useState(null);
  const [gameKey, setGameKey] = useState(0); // Key to reset timer on replay
  const boardContainerRef = useRef(null);

  const handleSelectionChange = (newSelection) => {
    setSelectedCellIds(newSelection);
  };

  const handleCellsUpdate = (updatedCells) => {
    setCells(updatedCells);
  };

  const handleTimeUp = () => {
    // Check if player won (all cells cleared or some win condition)
    // For now, just show lose screen when time runs out
    setGameResult('lose');
    setShowGameOver(true);
  };

  const handleReplay = () => {
    setShowGameOver(false);
    setGameResult(null);
    setCells(createSampleBoard(13, 17));
    setSelectedCellIds(new Set());
    setGameKey(prev => prev + 1); // Reset timer by changing key
  };

  useEffect(() => {
    const updateBoardWidth = () => {
      if (boardContainerRef.current) {
        // Find the GameBoard element within the container
        const gameBoard = boardContainerRef.current.querySelector('.game-board');
        if (gameBoard) {
          const width = gameBoard.offsetWidth;
          setBoardWidth(width);
        }
      }
    };

    // Use a small delay to ensure the board is rendered
    const timer = setTimeout(updateBoardWidth, 100);
    window.addEventListener('resize', updateBoardWidth);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateBoardWidth);
    };
  }, [cells]);

  return (
    <div className="app">
      <div className="app__game-container" ref={boardContainerRef}>
        <GameBoard
          cells={cells}
          selectedCellIds={selectedCellIds}
          onSelectionChange={handleSelectionChange}
          onCellsUpdate={handleCellsUpdate}
          disabled={disabled}
          targetSum={10}
        />
        {boardWidth && !showGameOver && (
          <Timer key={gameKey} boardWidth={boardWidth} onTimeUp={handleTimeUp} />
        )}
      </div>
      <button 
        className="app__settings-button"
        onClick={() => setShowSettings(true)}
      >
        <img src={settingsIcon} alt="Settings" />
      </button>
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)}
          onLoginClick={() => {
            setShowSettings(false);
            setShowLogin(true);
          }}
        />
      )}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}
      {showGameOver && (
        <GameOver 
          result={gameResult}
          onReplay={handleReplay}
          onClose={() => setShowGameOver(false)}
        />
      )}
    </div>
  );
}

export default App;

