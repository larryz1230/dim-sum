import React from "react";
import "./Score.css";

export const Score = ({
  gameMode = "singleplayer",
  me,
  opponent,
  opponentScore = 0,
}) => {
  const isMultiplayer = gameMode === "multiplayer";

  if (!isMultiplayer) {
    return (
      <div className="score-panel">
        <div className="score-panel__header">
          <h2 className="score-panel__title">Score</h2>
        </div>

        <div className="score-panel__player score-panel__player--single">
          <div className="score-panel__top-row">
            <span className="score-panel__name">You</span>
            <span className="score-panel__score">{score ?? me?.score ?? 0}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="score-panel">
      <div className="score-panel__header">
        <h2 className="score-panel__title">Match</h2>
      </div>

      <div className="score-panel__players">
        <div className="score-panel__player">
          <div className="score-panel__top-row">
            <div>
              <div className="score-panel__role">You</div>
              <div className="score-panel__name">{me?.name || "You"}</div>
            </div>
            <div className="score-panel__score">{me?.score ?? score ?? 0}</div>
          </div>

          <div className="score-panel__meta">
            <div className="score-panel__meta-item">
              <span className="score-panel__meta-label">Elo</span>
              <span className="score-panel__meta-value">{me?.rating ?? 0}</span>
            </div>
            <div className="score-panel__meta-item">
              <span className="score-panel__meta-label">W-L</span>
              <span className="score-panel__meta-value">
                {me?.wins ?? 0}-{me?.losses ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="score-panel__divider">vs</div>

        <div className="score-panel__player">
          <div className="score-panel__top-row">
            <div>
              <div className="score-panel__role">Opponent</div>
              <div className="score-panel__name">
                {opponent?.name || "Opponent"}
              </div>
            </div>
            <div className="score-panel__score">
              {opponent?.score ?? opponentScore ?? 0}
            </div>
          </div>

          <div className="score-panel__meta">
            <div className="score-panel__meta-item">
              <span className="score-panel__meta-label">Elo</span>
              <span className="score-panel__meta-value">
                {opponent?.rating ?? 0}
              </span>
            </div>
            <div className="score-panel__meta-item">
              <span className="score-panel__meta-label">W-L</span>
              <span className="score-panel__meta-value">
                {opponent?.wins ?? 0}-{opponent?.losses ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};