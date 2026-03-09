import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import './Dashboard.css';
import ProfileExpanded from './ProfileExpanded/ProfileExpanded';
import LeaderboardExpanded from './LeaderboardExpanded/LeaderboardExpanded';
import MatchmakePopup from '../MatchmakePopup/MatchmakePopup';
import { Settings } from '../Settings/Settings';
import { Login } from '../Login/Login';
import bunsChopstickImg from '../../imgs/BunsChopstick.png';
import fightingBunsImg from '../../imgs/FightingBuns.png';
import goldBunImg from '../../imgs/Gold Bun.png';
import individualBaoImg from '../../imgs/individual bao 2.png';
import settingsIcon from '../../imgs/Settings.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMatchmakePopup, setShowMatchmakePopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activePanel, setActivePanel] = useState(
    null // 'profile' | 'leaderboard'
  );

  useEffect(() => {
    const panel = location.state?.panel;
    if (panel === 'leaderboard' || panel === 'profile') {
      setActivePanel(panel);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="app dashboard-page">
      <div className="dashboard">
        {/* <div className="dashboard__header">
          <h1>Dashboard</h1>
        </div> */}
        {activePanel === null ? (
          <div className="dashboard__buttons fade-in">
            <button className="dashboard__button" onClick={() => navigate('/game')}>
              <span className="dashboard__button-img-wrap">
                <img src={bunsChopstickImg} alt="" />
              </span>
              Singleplayer
            </button>
            <button className="dashboard__button" onClick={() => setShowMatchmakePopup(true)}>
              <span className="dashboard__button-img-wrap">
                <img src={fightingBunsImg} alt="" />
              </span>
              Multiplayer
            </button>
            <button className="dashboard__button" onClick={() => setActivePanel('profile')}>
              <span className="dashboard__button-img-wrap">
                <img src={individualBaoImg} alt="" />
              </span>
              Profile
            </button>
            <button className="dashboard__button" onClick={() => setActivePanel('leaderboard')}>
              <span className="dashboard__button-img-wrap">
                <img src={goldBunImg} alt="" />
              </span>
              Leaderboard
            </button>
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

      <button
        className="app__settings-button"
        onClick={() => setShowSettings(true)}
      >
        <img src={settingsIcon} alt="Settings" />
      </button>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onLoginClick={() => {
            setShowSettings(false);
            setShowLogin(true);
          }}
          onProfileClick={() => setActivePanel('profile')}
          onLeaderboardClick={() => setActivePanel('leaderboard')}
          gameMode="singleplayer"
          onGameModeChange={() => {}}
        />
      )}

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
}
