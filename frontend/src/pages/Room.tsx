import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { GameBoard } from "../components/GameBoard";
import { Settings } from "../components/Settings";
import { Login } from "../components/Login";
import { Timer } from "../components/Timer";
import { GameOver } from "../components/GameOver";
import { Score } from "../components/Score";
import { Leaderboard } from "../components/Leaderboard";

// TODO: fix this linting issue, it shows up but gives an error.
import settingsIcon from "../imgs/Settings.png";

import "../App.css";
const SOCKET_URL = "http://localhost:9090";

export default function Room() {
  type GameMode = "singleplayer" | "multiplayer";
  type GameResult = "win" | "lose" | null;

  type Cell = {
    id: string;
    value: number; // 0 means cleared
    row: number;
    col: number;
  };

  type Board = Cell[][];
  type GameStateEmit = {
    roomId: string;
    Board: Board;
    score1: number;
    score2: number;
    timer: number;
  };

  const { matchId } = useParams<{ matchId: string }>();

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!matchId) return;

    const s = io(SOCKET_URL);
    socketRef.current = s;

    s.on("connect", () => {
      setConnected(true);
      s.emit("room:join", { roomId: matchId });
    });

    s.on("room:game_state", (gameState: GameStateEmit) => {
      console.log("Received game state for room:", matchId);
      setCells(gameState.Board);
    });

    // receive chat messages
    s.on("room:message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    // receive counter updates
    s.on("room:count", (newCount: number) => {
      setCount(newCount);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [matchId]);

  const increment = () => {
    if (!socketRef.current) return;
    console.log("Incrementing count for room:", matchId);
    socketRef.current.emit("room:increment", { roomId: matchId });
  };

  const [cells, setCells] = useState<Board | null>(() => null);
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
    console.log("Selected cells: ", newSelection);
  };

  const handleCellsUpdate = (updatedCells: Board) => {
    if (!cells) return;
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
    // setCells(createSampleBoard(13, 17));
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

  if (!cells) {
    return <div>Loading game...</div>;
  }

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
            socketRef={socketRef as any}
            matchId={matchId as any}
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
