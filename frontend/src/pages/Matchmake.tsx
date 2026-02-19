import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// I recommend an enumeration

type MatchFoundPayload = {
    matchId: string;
    opponentSocketId: string;
}

type Status = "idle" | "searching" | "matched" | "error";

// const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL ?? "http://localhost:9090";
const SOCKET_URL = "http://localhost:9090";

export default function Matchmake() {
    const socketRef = useRef<Socket | null>(null);

    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [matchId, setMatchId] = useState<string>("");
    const [opponentId, setOpponentId] = useState<string>("");
    const [userSocketId, setUserSocketId] = useState<string>("");

    // socket init when matchmake starts (not persistent when page loads)
    // there should only be one, like a singleton
    const getSocket = () => {
        if (socketRef.current) {
            return socketRef.current;
        }

        const s = io(SOCKET_URL, {
            autoConnect: false,
        });

        s.on("connect", () => {
            console.log("Connected to backend: ", s.id);
            setUserSocketId(s.id ?? "");
        })

        s.on("disconnect", () => {
            setUserSocketId("");
            setStatus((prev) => (prev === "searching" ? "idle" : prev));
        });

        s.on("connect_error", (err : any) => {
            console.log("CONNECT ERROR:", err.message);
            setErrorMsg(err?.message ?? "Failed to reach server.");
            setStatus("error");
        });

        s.on("matchmaking:queued", () => {
            setStatus("searching");
            console.log("searching atm");
            setErrorMsg("");
            setMatchId("");
            setOpponentId("");
        });

        s.on("matchmaking:match_found", (payload: MatchFoundPayload) => {
            setStatus("matched");
            setMatchId(payload.matchId);
            setOpponentId(payload.opponentSocketId);
        });

        s.on("matchmaking:canceled", () => {
            setStatus("idle");
        });

        s.on("matchmaking:error", (msg : string) => {
            setErrorMsg(msg || "Matchmaking error.");
            setStatus("error");
        });

        socketRef.current = s;
        return s;
    };

    const startMatchmaking = () => {
        console.log("Start matchmaking clicked.");
        const s = getSocket();

        if (!s.connected) {
            console.log("Connecting socket...");
            s.connect();
        }
        s.emit("matchmaking:start");
    };

    const cancelMatchmaking = () => {
        const s= socketRef.current;
        if (!s) {
            setStatus("idle");
            return;
        }
        s.emit("matchmaking:cancel");
    };

    useEffect(() => {
        return () => {
            const s = socketRef.current;
            if (s) {
                try {
                    s.emit("matchmaking:cancel");
                } catch {}
                s.removeAllListeners();
                s.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // GPT generated temp placeholders and styling. Consider replacing
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
                    Opponent: <code>{opponentId}</code>
                </div>

                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
                    Next step: navigate to your game page and join room <code>{matchId}</code>.
                </div>

                <button
                    onClick={() => {
                    // For now, just reset. Later you can navigate to /game/:matchId
                    setStatus("idle");
                    setMatchId("");
                    setOpponentId("");
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