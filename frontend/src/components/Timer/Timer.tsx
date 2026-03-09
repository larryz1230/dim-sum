import React, { useEffect } from "react";
import "./Timer.css";

type TimerProps = {
  boardWidth: number | string;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  initialTime?: number;
  isPaused?: boolean;
  onTimeUp?: () => void;
};

export const Timer: React.FC<TimerProps> = ({
  boardWidth,
  time,
  setTime,
  initialTime = 120,
  isPaused = false,
  onTimeUp,
}) => {
  useEffect(() => {
    if (typeof setTime !== "function") return; // prevents crash + tells you it's wrong

    if (isPaused) return;

    if (time <= 0) {
      onTimeUp?.();
      return;
    }

    const t = window.setTimeout(() => {
      setTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearTimeout(t);
  }, [time, isPaused, setTime, onTimeUp]);

  const displayTime = typeof time === "number" ? time : 0;
  const fillPercent = Math.max(0, Math.min(100, (displayTime / initialTime) * 100));

  return (
    <div className="timer-bar" style={{ width: boardWidth || "auto" }}>
      <div
        className="timer-bar__fill"
        style={{ width: `${fillPercent}%` }}
        aria-hidden
      />
      <div className="timer-bar__text">{displayTime}</div>
    </div>
  );
};