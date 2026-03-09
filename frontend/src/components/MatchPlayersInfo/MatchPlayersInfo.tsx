import React from "react";
import "./MatchPlayersInfo.css";

type PlayerDisplayInfo = {
  name: string;
  rating: number;
  wins: number;
  losses: number;
  score: number;
};

type MatchPlayersInfoProps = {
  me: PlayerDisplayInfo;
  opponent: PlayerDisplayInfo;
};

export function MatchPlayersInfo({
  me,
  opponent,
}: MatchPlayersInfoProps) {
  return (
    <div className="match-players-info">
      <div className="match-players-info__card">
        <div className="match-players-info__label">You</div>
        <div className="match-players-info__name">{me.name || "You"}</div>
        <div className="match-players-info__row">Score: {me.score}</div>
        <div className="match-players-info__row">Elo: {me.rating}</div>
        <div className="match-players-info__row">
          W-L: {me.wins}-{me.losses}
        </div>
      </div>

      <div className="match-players-info__card">
        <div className="match-players-info__label">Opponent</div>
        <div className="match-players-info__name">
          {opponent.name || "Opponent"}
        </div>
        <div className="match-players-info__row">Score: {opponent.score}</div>
        <div className="match-players-info__row">Elo: {opponent.rating}</div>
        <div className="match-players-info__row">
          W-L: {opponent.wins}-{opponent.losses}
        </div>
      </div>
    </div>
  );
}