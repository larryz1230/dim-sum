import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { Socket } from "socket.io-client";
import SocketSingleton from "../Socket";

import { MultiplayerGameBoard } from "../components/MultiplayerGameBoard";
import { Settings } from "../components/Settings";
import { Login } from "../components/Login";
import { Timer } from "../components/Timer";
import { GameOver } from "../components/GameOver";
import { Score } from "../components/Score";
import { Leaderboard } from "../components/Leaderboard";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";

// TODO: fix this linting issue, it shows up but gives an error.
import settingsIcon from "../imgs/Settings.png";
import "../App.css";

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
    board: Board;
    score1: number;
    score2: number;
    timer: number;
    players: Record<string, 1 | 2>;
  };

  const { matchId } = useParams<{ matchId: string }>();

  const socketRef = useRef<Socket | null>(null);

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState<number>(0);

  const [cells, setCells] = useState<Board | null>(() => null);
  const [selectedCellIds, setSelectedCellIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>("multiplayer");
  const [boardWidth, setBoardWidth] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;

    const s = SocketSingleton.getSocket();
    socketRef.current = s;

    const unsubscribe = SocketSingleton.subscribe({
      connect: () => {
        s.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId: matchId });
        setConnected(true);
      },
      disconnect: () => setConnected(false),

      [SOCKET_EVENTS.ROOM_GAME_STATE]: (gameState: GameStateEmit) => {
        console.log("Received game state update:", gameState);
        if (gameState.roomId !== matchId) return;
        setCells(gameState.board);
        setTimer(gameState.timer);
        // TODO: we need to set both players score and determine winner at end of game.
        const pn = SocketSingleton.getPlayerNumber();
        if (pn === 1) {
          setScore1(gameState.score1);
          setScore2(gameState.score2);
        } else if (pn === 2) {
          setScore1(gameState.score2);
          setScore2(gameState.score1);
        }
      },

      [SOCKET_EVENTS.ROOM_MESSAGE]: (msg) => setMessages((prev) => [...prev, msg]),
      [SOCKET_EVENTS.ROOM_COUNT]: (newCount) => setCount(newCount),
    });

    SocketSingleton.ensureConnected();

    // if already connected (hot reload), join immediately
    if (s.connected) {
      s.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId: matchId });
      setConnected(true);
    }

    return () => {
      // leave just this room, keep socket alive for other pages
      try {
        s.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId: matchId });
      } catch {}
      unsubscribe();
      socketRef.current = null;
    };
  }, [matchId]);

  const handleSelectionChange = (newSelection: Set<string>) => {
    setSelectedCellIds(newSelection);
    console.log("Selected cells: ", newSelection);
  };

  // submit a selection intent.
  const submitSelection = (cellIds: string[]) => {
    const s = socketRef.current;
    if (!s || !matchId) return;

    const clearedCells = cellIds.map((id) => {
      const [, row, col] = id.split("-");
      return { row: Number(row), col: Number(col) };
    });

    s.emit(SOCKET_EVENTS.GAME_UPDATE, {
      roomId: matchId,
      clearedCells,
    });

    setSelectedCellIds(new Set());
  };

  const handleTimeUp = () => {
    setGameResult("lose");
    setShowGameOver(true);
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
          <MultiplayerGameBoard
            cells={cells}
            selectedCellIds={selectedCellIds}
            onSelectionChange={handleSelectionChange}
            onSelectionEnd={submitSelection}
            socketRef={socketRef as any}
            matchId={matchId as any}
            disabled={showSettings || showLogin}
            targetSum={10}
          />

          {boardWidth !== null && !showGameOver && (
            <Timer
              boardWidth={boardWidth}
              time={timer}
              setTime={setTimer}
              isPaused={showSettings || showLogin}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>

        <div className="app__sidebar">
          <Score score={score1} opponentScore={score2} gameMode={gameMode} />
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
          // TODO: add player names here too
          player1={score1}
          player2={score2}
          onClose={() => setShowGameOver(false)}
        />
      )}
    </div>
  );
}
