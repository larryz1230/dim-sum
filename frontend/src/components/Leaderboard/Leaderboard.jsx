import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import goldBun from '../../imgs/Gold Bun.png';
import silverBun from '../../imgs/Silver Bun.png';
import bronzeBun from '../../imgs/Bronze Bun.png';
import './Leaderboard.css';

export const Leaderboard = ({ gameMode }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // SQL query to fetch top 10 players
        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('id, username, rating')
          .order('rating', { ascending: false })
          .limit(10);

        if (supabaseError) throw supabaseError;

        const formattedData = data.map((player, index) => ({
          id: player.id,
          rank: index + 1,
          username: player.username || 'Unknown Player',
          score: player.rating || 0,
        }));

        setLeaderboardData(formattedData);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameMode]);

  if (loading) return <div className="leaderboard-panel">Loading scores...</div>;
  if (error) return <div className="leaderboard-panel">{error}</div>;
  if (leaderboardData.length === 0) return <div className="leaderboard-panel">No scores yet!</div>;

  // Podium Logic
  const rawTopThree = leaderboardData.slice(0, 3);
  const topThree = [];
  if (rawTopThree.length > 0) {
    if (rawTopThree[1]) topThree.push(rawTopThree[1]); // 2nd place (Silver)
    topThree.push(rawTopThree[0]);                     // 1st place (Gold)
    if (rawTopThree[2]) topThree.push(rawTopThree[2]); // 3rd place (Bronze)
  }

  const rest = leaderboardData.slice(3);

  

  return (
    <div className="leaderboard-panel">
      <h2 className="leaderboard-title">LEADERBOARD</h2>
      
      {/* Top 3 with bun images */}
      <div className="leaderboard-top-three">
        {topThree.map((entry, index) => {
          let bunImage;
          let bunClass = 'leaderboard-bun';
          
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
            <div key={`top-${entry.id}`} className="leaderboard-top-entry">
              <img src={bunImage} alt={`Bun place`} className={bunClass} />
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
          <div key={`rest-${entry.id}`} className="leaderboard-entry">
            <span className="leaderboard-entry-rank">{entry.rank}.</span>
            <span className="leaderboard-entry-username">{entry.username}</span>
            <span className="leaderboard-entry-score">{entry.score}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};