import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocketSingleton from '../../Socket';
import { SOCKET_EVENTS } from '../../../../shared/SocketEvents';
import './MatchmakePopup.css';

const SOCKET_URL = 'https://cs130-group4.onrender.com'

export default function MatchmakePopup({ onClose }) {
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // 'idle' | 'searching' | 'matched' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [userSocketId, setUserSocketId] = useState('');

  useEffect(() => {
    const s = SocketSingleton.getSocket();
    socketRef.current = s;

    const unsubscribe = SocketSingleton.subscribe({
      connect: (id) => setUserSocketId(id),
      connect_error: (msg) => {
        setErrorMsg(msg || 'Failed to reach server.');
        setStatus('error');
      },
      [SOCKET_EVENTS.MATCH_QUEUED]: () => {
        setStatus('searching');
        setErrorMsg('');
      },
      [SOCKET_EVENTS.MATCH_FOUND]: (payload) => {
        setStatus('matched');
        navigate(`/room/${payload.matchId}?player=${payload.playerNumber}`);
      },
      [SOCKET_EVENTS.MATCH_CANCELED]: () => setStatus('idle'),
      [SOCKET_EVENTS.MATCH_ERROR]: (msg) => {
        setErrorMsg(msg || 'Matchmaking error.');
        setStatus('error');
      },
    });

    return () => {
      try {
        s.emit(SOCKET_EVENTS.MATCH_CANCEL);
      } catch (_) {}
      unsubscribe();
      socketRef.current = null;
    };
  }, [navigate]);

  const startMatchmaking = () => {
    SocketSingleton.ensureConnected();
    SocketSingleton.getSocket().emit(SOCKET_EVENTS.MATCH_START);
  };

  const cancelMatchmaking = () => {
    SocketSingleton.getSocket().emit(SOCKET_EVENTS.MATCH_CANCEL);
  };

  return (
    <>
      <div className="matchmake-overlay" onClick={onClose} />
      <div className="matchmake-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="matchmake-title">Matchmaking</h2>

        <div className="matchmake-info">
          Server: {SOCKET_URL}
          <br />
          Your socket: {userSocketId || '(not connected)'}
        </div>

        {status === 'idle' && (
          <button className="matchmake-btn" onClick={startMatchmaking}>
            Start Matchmaking
          </button>
        )}

        {status === 'searching' && (
          <div className="matchmake-box">
            <div className="matchmake-box-content">
              <strong>Searching for an opponent…</strong>
              <div className="matchmake-hint">
                Open this in a second browser/tab to match.
              </div>
            </div>
            <button className="matchmake-btn" onClick={cancelMatchmaking}>
              Cancel
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="matchmake-box">
            <strong className="matchmake-error">Error</strong>
            <div className="matchmake-errormsg">{errorMsg}</div>
            <button
              className="matchmake-btn"
              onClick={() => {
                setStatus('idle');
                setErrorMsg('');
              }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </>
  );
}
