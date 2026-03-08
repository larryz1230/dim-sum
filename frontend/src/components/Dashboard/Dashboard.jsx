import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import './Dashboard.css';
import ProfileExpanded from './ProfileExpanded/ProfileExpanded';
import LeaderboardExpanded from './LeaderboardExpanded/LeaderboardExpanded';
import MatchmakePopup from '../MatchmakePopup/MatchmakePopup';
import PlayIcon from '../../imgs/Happy Bun.png';
import CrownIcon from '../../imgs/Gold Bun.png';
import UserIcon from '../../imgs/individual bao 2.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showMatchmakePopup, setShowMatchmakePopup] = useState(false);
  const [activePanel, setActivePanel] = useState(
    null // 'profile' | 'leaderboard'
  );

  return (
    <div className="app">
      <div className="dashboard">
        <div className="dashboard__header">
          <h1>Dashboard</h1>
        </div>
        {activePanel === null ? (
          <div className="dashboard__buttons fade-in">
            <div className="dashboard__row">
              <button className="dashboard__button" onClick={() => navigate('/game')}>
                <img src={PlayIcon} alt="" />
                Play
              </button>
              <button className="dashboard__button" onClick={() => setActivePanel('profile')}>
                <img src={UserIcon} alt="" />
                Profile
              </button>
            </div>
            <div className="dashboard__row">
              <button className="dashboard__button" onClick={() => setActivePanel('leaderboard')}>
                <img src={CrownIcon} alt="" />
                Leaderboard
              </button>
              <button className="dashboard__button" onClick={() => setShowMatchmakePopup(true)}>
                <img src={PlayIcon} alt="" />
                Multiplayer
              </button>
            </div>
          </div>
        ) : (
          <div className="dashboard__expanded fade-in">
            {activePanel === 'profile' && <ProfileExpanded />}
            {activePanel === 'leaderboard' && <LeaderboardExpanded />}
            <button className="dashboard__back" onClick={() => setActivePanel(null)}>
              Back <span className="dashboard__back-arrow">&gt;</span>
            </button>
          </div>
        )}
      </div>

      {showMatchmakePopup && (
        <MatchmakePopup onClose={() => setShowMatchmakePopup(false)} />
      )}
    </div>
  );
}
