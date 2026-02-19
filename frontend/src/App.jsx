import React, { useState, useRef, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Timer } from './components/Timer';
import { GameOver } from './components/GameOver';
import { Score } from './components/Score';
import { Leaderboard } from './components/Leaderboard';
import settingsIcon from './imgs/Settings.png';
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
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState('singleplayer'); // 'singleplayer' or 'multiplayer'
  const [boardWidth, setBoardWidth] = useState(null);
  const [gameKey, setGameKey] = useState(0); // Key to reset timer on replay
  const boardContainerRef = useRef(null);

  const handleSelectionChange = (newSelection) => {
    setSelectedCellIds(newSelection);
  };

  const handleCellsUpdate = (updatedCells) => {
    // Count how many cells were cleared (value changed to 0)
    const previousCells = cells;
    let clearedCount = 0;
    
    for (let row = 0; row < previousCells.length; row++) {
      for (let col = 0; col < previousCells[row].length; col++) {
        const prevCell = previousCells[row][col];
        const newCell = updatedCells[row][col];
        if (prevCell.value !== 0 && newCell.value === 0) {
          clearedCount++;
        }
      }
    }
    
    // Update score: +1 point per number cleared
    if (clearedCount > 0) {
      setScore(prevScore => prevScore + clearedCount);
    }
    
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
    setScore(0);
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
      <div className="app__main-content">
        <div className="app__game-container" ref={boardContainerRef}>
        <GameBoard
          cells={cells}
          selectedCellIds={selectedCellIds}
          onSelectionChange={handleSelectionChange}
          onCellsUpdate={handleCellsUpdate}
          disabled={disabled || showSettings || showLogin}
          targetSum={10}
        />
          {boardWidth && !showGameOver && (
            <Timer 
              key={gameKey} 
              boardWidth={boardWidth} 
              onTimeUp={handleTimeUp}
              isPaused={showSettings || showLogin}
            />
          )}
        </div>
        <div className="app__sidebar">
          <Score score={score} gameMode={gameMode} />
          <Leaderboard gameMode={gameMode} />
        </div>
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
          gameMode={gameMode}
          onGameModeChange={setGameMode}
        />
      )}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}
      {showGameOver && (
        <GameOver 
          result={gameResult}
          score={score}
          onReplay={handleReplay}
          onClose={() => setShowGameOver(false)}
        />
      )}
    </div>
  );
}

export default App;

