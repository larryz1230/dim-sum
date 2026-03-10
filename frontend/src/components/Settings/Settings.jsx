import React, { useState } from 'react';
import './Settings.css';

export const Settings = ({ onClose, onLoginClick, onProfileClick, onLeaderboardClick, gameMode, onGameModeChange }) => {
  const [isMultiplayer, setIsMultiplayer] = useState(gameMode === 'multiplayer');

  const handleProfileClick = () => {
    onClose?.();
    onProfileClick?.();
  };

  const handleLeaderboardClick = () => {
    onClose?.();
    onLeaderboardClick?.();
  };

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-modal">
        <h1 className="settings-title">SETTINGS</h1>
        <div className="settings-content">
          <div className="settings-column">
            <button className="settings-button" onClick={handleProfileClick}>Profile</button>
            <button className="settings-button" onClick={handleLeaderboardClick}>Leaderboard</button>
            <button className="settings-button" onClick={onLoginClick}>login</button>
            <button className="settings-button">placeholder</button>
          </div>
          <div className="settings-column">
            <div className="settings-segmented-control">
              <button 
                className={`settings-segment ${!isMultiplayer ? 'settings-segment--active' : ''}`}
                onClick={() => {
                  setIsMultiplayer(false);
                  if (onGameModeChange) {
                    onGameModeChange('singleplayer');
                  }
                }}
              >
                Singleplayer
              </button>
              <button 
                className={`settings-segment ${isMultiplayer ? 'settings-segment--active' : ''}`}
                onClick={() => {
                  setIsMultiplayer(true);
                  if (onGameModeChange) {
                    onGameModeChange('multiplayer');
                  }
                }}
              >
                Multiplayer
              </button>
            </div>
            <button className="settings-button">placeholder</button>
            <button className="settings-button">placeholder</button>
            <button className="settings-button">placeholder</button>
          </div>
        </div>
      </div>
    </>
  );
};

