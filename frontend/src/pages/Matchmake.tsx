import React, { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import SocketSingleton from "../Socket";
import type { MatchFoundPayload } from "../../../shared/SocketTypes";
import { SOCKET_EVENTS } from "../../../shared/SocketEvents";

type Status = "idle" | "searching" | "matched" | "error";

// shown in UI only (the singleton can use its own SOCKET_URL internally)
const SOCKET_URL = "http://localhost:9090";

export default function Matchmake() {
  const socketRef = useRef<Socket | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [matchId, setMatchId] = useState<string>("");
  const [opponentId, setOpponentId] = useState<string>(""); // optional (if server sends it)
  const [userSocketId, setUserSocketId] = useState<string>("");
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | -1>(-1);

  const navigate = useNavigate();

  useEffect(() => {
    const s = SocketSingleton.getSocket(); // or getInstance() depending on your singleton
    socketRef.current = s;

    // Subscribe using your singleton helper (clean + safe)
    const unsubscribe = SocketSingleton.subscribe({
      connect: (id) => setUserSocketId(id),
      connect_error: (msg) => {
        setErrorMsg(msg || "Failed to reach server.");
        setStatus("error");
      },

      [SOCKET_EVENTS.MATCH_QUEUED] : () => {
        setStatus("searching");
        setErrorMsg("");
        setMatchId("");
        setOpponentId("");
        setPlayerNumber(-1);
      },

      [SOCKET_EVENTS.MATCH_FOUND]: (
        payload: MatchFoundPayload & { opponentId?: string },
      ) => {
        setStatus("matched");
        setMatchId(payload.matchId);
        setPlayerNumber(payload.playerNumber);
        setOpponentId(payload.opponentId ?? "");
      },

      [SOCKET_EVENTS.MATCH_CANCELED]: () => setStatus("idle"),

      [SOCKET_EVENTS.MATCH_ERROR]: (msg) => {
        setErrorMsg(msg || "Matchmaking error.");
        setStatus("error");
      },
    });

    // keep this if you want auto-connect on mount;
    // remove if you only want to connect on "Start Matchmaking"
    // SocketSingleton.ensureConnected();

    return () => {
      // auto-cancel if leaving mid-search (optional)
      try {
        s.emit(SOCKET_EVENTS.MATCH_CANCEL);
      } catch {}

      unsubscribe();
      socketRef.current = null;
    };
  }, []);

  const startMatchmaking = () => {
    SocketSingleton.ensureConnected();
    SocketSingleton.getSocket().emit(SOCKET_EVENTS.MATCH_START);
  };

  const cancelMatchmaking = () => {
    SocketSingleton.getSocket().emit(SOCKET_EVENTS.MATCH_CANCEL);
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>Matchmaking Test</h2>

      <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.8 }}>
        Server: {SOCKET_URL}
        <br />
        Your socket: {userSocketId || "(not connected)"}
      </div>

      {status === "idle" && (
        <button onClick={startMatchmaking} style={btnStyle}>
          Start Matchmaking
        </button>
      )}

      {status === "searching" && (
        <div style={boxStyle}>
          <div style={{ marginBottom: 12 }}>
            <strong>Searching for an opponent…</strong>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Open this page in a second browser/tab to match.
            </div>
          </div>

          <button onClick={cancelMatchmaking} style={btnStyle}>
            Cancel
          </button>
        </div>
      )}

      {status === "matched" && (
        <div style={boxStyle}>
          <div style={{ marginBottom: 8 }}>
            <strong>Match found</strong>
          </div>

          <div style={{ fontSize: 14 }}>
            Match ID: <code>{matchId}</code>
            <br />
            Opponent: <code>{opponentId || "(unknown)"}</code>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
            Next step: navigate to your game page and join room{" "}
            <code>{matchId}</code>. You are{" "}
            <strong>Player {playerNumber}</strong>
          </div>

          <button
            onClick={() => {
              if (!matchId) return;
              navigate(`/room/${matchId}?player=${playerNumber}`);
            }}
            style={{ ...btnStyle, marginTop: 12 }}
          >
            Join
          </button>

          <button
            onClick={() => {
              setStatus("idle");
              setMatchId("");
              setOpponentId("");
              setPlayerNumber(-1);
            }}
            style={{ ...btnStyle, marginTop: 12 }}
          >
            Back
          </button>
        </div>
      )}

      {status === "error" && (
        <div style={boxStyle}>
          <strong style={{ color: "crimson" }}>Error</strong>
          <div style={{ marginTop: 8 }}>{errorMsg}</div>

          <button
            onClick={() => {
              setStatus("idle");
              setErrorMsg("");
            }}
            style={{ ...btnStyle, marginTop: 12 }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const boxStyle: React.CSSProperties = {
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 8,
  maxWidth: 420,
};
