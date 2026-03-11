import React from 'react';
import goldBun from '../../imgs/Gold Bun.png';
import silverBun from '../../imgs/Silver Bun.png';
import bronzeBun from '../../imgs/Bronze Bun.png';
import './Leaderboard.css';

export const Leaderboard = ({ gameMode }) => {
  // Placeholder data - will be replaced with backend data later
  const getLeaderboardData = () => {
    // In real implementation, this would fetch different data based on gameMode
    // For now, return placeholder data
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      username: 'User',
      score: 1000,
    }));
  };

  const leaderboardData = getLeaderboardData();
  const topThree = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="leaderboard-panel">
      <h2 className="leaderboard-title">LEADERBOARD</h2>
      
      {/* Top 3 with bun images */}
      <div className="leaderboard-top-three">
        {topThree.map((entry, index) => {
          let bunImage;
          let bunClass = 'leaderboard-bun';
          // Order: Silver (2nd), Gold (1st), Bronze (3rd)
          if (index === 0) {
            bunImage = silverBun;
            bunClass = 'leaderboard-bun leaderboard-bun--silver';
          } else if (index === 1) {
            bunImage = goldBun;
            bunClass = 'leaderboard-bun leaderboard-bun--gold';
          } else {
            bunImage = bronzeBun;
            bunClass = 'leaderboard-bun leaderboard-bun--bronze';
          }

          return (
            <div key={entry.id} className="leaderboard-top-entry">
              <img src={bunImage} alt={`${index + 1} place bun`} className={bunClass} />
              <div className="leaderboard-top-info">
                <div className="leaderboard-username">{entry.username}</div>
                <div className="leaderboard-score">{entry.score}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of top 10 - scrollable */}
      <div className="leaderboard-list-scroll">
        <div className="leaderboard-list">
        {rest.map((entry) => (
          <div key={entry.id} className="leaderboard-entry">
            <span className="leaderboard-entry-rank">{entry.id}.</span>
            <span className="leaderboard-entry-username">{entry.username}</span>
            <span className="leaderboard-entry-score">{entry.score}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

