import React from 'react';
import { Leaderboard } from '../../Leaderboard/Leaderboard';

export default function LeaderboardExpanded() {
  return (
    <div className="leaderboard-expanded">
      <Leaderboard gameMode="singleplayer" />
    </div>
  );
}
