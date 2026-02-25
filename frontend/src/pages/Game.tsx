import React, { useEffect, useRef, useState } from "react";
import { GameBoard } from "../components/GameBoard";
import { Settings } from "../components/Settings";
import { Login } from "../components/Login";
import { Timer } from "../components/Timer";
import { GameOver } from "../components/GameOver";
import { Score } from "../components/Score";
import { Leaderboard } from "../components/Leaderboard";

// WHY ISN:
import settingsIcon from "../imgs/Settings.png";

import "../App.css";

type GameMode = "singleplayer" | "multiplayer";
type GameResult = "win" | "lose" | null;

type Cell = {
  id: string;
  value: number; // 0 means cleared
  row: number;
  col: number;
};

type Board = Cell[][];

// Create a sample game board
const createSampleBoard = (rows = 12, cols = 10): Board => {
  const cells: Board = [];

  for (let row = 0; row < rows; row++) {
    const rowCells: Cell[] = [];
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

export default function App(): React.ReactElement {
  const [cells, setCells] = useState<Board>(() => createSampleBoard(13, 17));
  const [selectedCellIds, setSelectedCellIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>("singleplayer");
  const [boardWidth, setBoardWidth] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const boardContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectionChange = (newSelection: Set<string>) => {
    setSelectedCellIds(newSelection);
  };

  const handleCellsUpdate = (updatedCells: Board) => {
    const previousCells = cells;
    let clearedCount = 0;

    for (let row = 0; row < previousCells.length; row++) {
      for (let col = 0; col < previousCells[row].length; col++) {
        const prevCell = previousCells[row][col];
        const newCell = updatedCells[row][col];
        if (prevCell.value !== 0 && newCell.value === 0) clearedCount++;
      }
    }

    if (clearedCount > 0) setScore((prev) => prev + clearedCount);
    setCells(updatedCells);
  };

  const handleTimeUp = () => {
    setGameResult("lose");
    setShowGameOver(true);
  };

  const handleReplay = () => {
    setShowGameOver(false);
    setGameResult(null);
    setScore(0);
    setCells(createSampleBoard(13, 17));
    setSelectedCellIds(new Set());
    setGameKey((prev) => prev + 1);
  };

  useEffect(() => {
    const updateBoardWidth = () => {
      const container = boardContainerRef.current;
      if (!container) return;

      const gameBoard = container.querySelector<HTMLElement>(".game-board");
      if (!gameBoard) return;

      setBoardWidth(gameBoard.offsetWidth);
    };

    const t = window.setTimeout(updateBoardWidth, 100);
    window.addEventListener("resize", updateBoardWidth);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", updateBoardWidth);
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
            // If onCellClick is required, keep this:
            onCellClick={() => {}}
            disabled={showSettings || showLogin}
            targetSum={10}
          />

          {boardWidth !== null && !showGameOver && (
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

      {showLogin && <Login onClose={() => setShowLogin(false)} />}

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
