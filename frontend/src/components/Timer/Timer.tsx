import React, { useEffect } from "react";
import "./Timer.css";

type TimerProps = {
  boardWidth: number | string;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  isPaused?: boolean;
  onTimeUp?: () => void;
};

export const Timer: React.FC<TimerProps> = ({
  boardWidth,
  time,
  setTime,
  isPaused = false,
  onTimeUp,
}) => {
  // Debug once on mount
  useEffect(() => {
    console.log("Timer props:", { time, setTimeType: typeof setTime });
  }, []);

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

  return (
    <div className="timer-bar" style={{ width: boardWidth || "auto" }}>
      <div className="timer-bar__text">{time}</div>
    </div>
  );
};