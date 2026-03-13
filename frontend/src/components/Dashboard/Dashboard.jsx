import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSound } from '../../hooks/useSound';
import { getBgMusic, stopBgMusic } from '../../utils/sound';
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
import happyBunImg from '../../imgs/Happy Bun.png';
import settingsIcon from '../../imgs/Settings.png';
import arrowImg from '../../imgs/Arrow.png';
import homeImg from '../../imgs/Home.png';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { soundOn } = useSound();
  const [showMatchmakePopup, setShowMatchmakePopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const handlePanelOpen = (panelName) => {
    setActivePanel(null);
    setTimeout(() => {
      setActivePanel(panelName);
    }, 10);
  };

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

  useEffect(() => {
    if (soundOn) {
      getBgMusic().play().catch(() => {});
    } else {
      stopBgMusic();
    }
    return () => stopBgMusic();
  }, [soundOn]);

  return (
    <div className="app dashboard-page">
      <div className="dashboard">
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
            <button className="dashboard__button" onClick={() => handlePanelOpen('profile')}>
              <span className="dashboard__button-img-wrap">
                <img src={happyBunImg} alt="" />
              </span>
              Profile
            </button>
            <button className="dashboard__button" onClick={() => handlePanelOpen('leaderboard')}>
              <span className="dashboard__button-img-wrap">
                <img src={goldBunImg} alt="" />
              </span>
              Leaderboard
            </button>
          </div>
        ) : (
          <div className="dashboard__expanded fade-in">
            {activePanel === 'profile' && (
              <ProfileExpanded key={`profile-${Date.now()}`} />
            )}
            {activePanel === 'leaderboard' && (
              <LeaderboardExpanded key={`lb-${Date.now()}`} />
            )}
          </div>
        )}
      </div>

      {activePanel !== null ? (
        <button className="dashboard__back" onClick={() => setActivePanel(null)}>
          <img src={arrowImg} alt="Back" />
        </button>
      ) : (
        <button className="dashboard__home" onClick={() => navigate('/')}>
          <img src={homeImg} alt="Home" />
        </button>
      )}

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
          onProfileClick={() => handlePanelOpen('profile')}
          onLeaderboardClick={() => handlePanelOpen('leaderboard')}
          gameMode="singleplayer"
          onGameModeChange={() => {}}
        />
      )}

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
}
