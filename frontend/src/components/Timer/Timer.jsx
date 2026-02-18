import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';

export const Timer = ({ boardWidth, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (onTimeUp) {
      onTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, onTimeUp]);

  const progress = (timeLeft / 60) * 100;

  return (
    <div className="timer-bar" style={{ width: boardWidth || 'auto' }}>
      <div className="timer-bar__fill" style={{ width: `${progress}%` }} />
      <div className="timer-bar__text">{timeLeft}</div>
    </div>
  );
};

