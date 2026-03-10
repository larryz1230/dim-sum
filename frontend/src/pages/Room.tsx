import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { connect, type Socket } from "socket.io-client";
import SocketSingleton from "../Socket";

import { MultiplayerGameBoard } from "../components/MultiplayerGameBoard";
import { Settings } from "../components/Settings";
import { Login } from "../components/Login";
import { Timer } from "../components/Timer";
import { GameOver } from "../components/GameOver";
import { Score } from "../components/Score";
import { Leaderboard } from "../components/Leaderboard";
import { MatchPlayersInfo } from "../components/MatchPlayersInfo/MatchPlayersInfo";
import type { Cell, Board, GameStateEmit } from "../../../backend/src/models/GameTypes";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";
import BackToDashboard from "../components/BackToDashboard/BackToDashboard";

import settingsIcon from "../imgs/Settings.png";
import "../App.css";

export default function Room() {
  type GameMode = "singleplayer" | "multiplayer";
  type GameResult = "win" | "lose" | null;

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

  // game info
  const [myName, setMyName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [myRating, setMyRating] = useState(0);
  const [opponentRating, setOpponentRating] = useState(0);
  const [myWins, setMyWins] = useState(0);
  const [myLosses, setMyLosses] = useState(0);
  const [opponentWins, setOpponentWins] = useState(0);
  const [opponentLosses, setOpponentLosses] = useState(0);

  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;

    const s = SocketSingleton.getSocket();
    socketRef.current = s;

    let cancelled = false;
    let joined = false;

    const joinRoom = () => {
      if (cancelled || joined) return;
      joined = true;
      s.emit(SOCKET_EVENTS.ROOM_JOIN, {roomId: matchId});
      setConnected(true);
    }

    const unsubscribe = SocketSingleton.subscribe({
      connect: () => {
        joinRoom();
      },
      disconnect: () => setConnected(false),

      [SOCKET_EVENTS.ROOM_GAME_STATE]: (gameState: GameStateEmit) => {
        // console.log("Received game state update:", gameState);
        if (gameState.roomId !== matchId) return;
        setCells(gameState.board);
        setTimer(gameState.timer);
        // TODO: we need to set both players score and determine winner at end of game.
        const playerList = Object.values(gameState.players);
        const meNumber = SocketSingleton.getPlayerNumber();

        if (!meNumber) return;

        const me = playerList.find((p) => p.playerNumber === meNumber);
        const opponent = playerList.find((p) => p.playerNumber !== meNumber);

        if (me) {
          setMyName(me.username);
          setMyRating(me.rating);
          setMyWins(me.wins);
          setMyLosses(me.losses);
        }

        if (opponent) {
          setOpponentName(opponent.username);
          setOpponentRating(opponent.rating);
          setOpponentWins(opponent.wins);
          setOpponentLosses(opponent.losses);
        }

        if (meNumber === 1) {
          setScore1(gameState.score1);
          setScore2(gameState.score2);
        } else {
          setScore1(gameState.score2);
          setScore2(gameState.score1);
        }
      },

      [SOCKET_EVENTS.ROOM_MESSAGE]: (msg) => setMessages((prev) => [...prev, msg]),
      [SOCKET_EVENTS.ROOM_COUNT]: (newCount) => setCount(newCount),
    });

    const connectAndJoin = async () => {
      try {
        await SocketSingleton.ensureConnected();

        if (cancelled) {
          return;s
        }

        if (s.connected) {
          joinRoom();
        }
      } catch (err) {
        console.error("Failed to connect room socket: ", err);
        setConnected(false);
      }
    };

    connectAndJoin();

    return () => {
      cancelled = true;
      // leave just this room, keep socket alive for other pages
      try {
        if (s.connected) {
          s.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId: matchId });
        }
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
          <Score
            gameMode={gameMode}
            me={{
              name: myName,
              rating: myRating,
              wins: myWins,
              losses: myLosses,
              score: score1,
            }}
            opponent={{
              name: opponentName,
              rating: opponentRating,
              wins: opponentWins,
              losses: opponentLosses,
              score: score2,
            }}
          />
          <Leaderboard gameMode={gameMode} />
        </div>
        </div>

      <BackToDashboard />

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
