import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSignOut } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSound } from '../../hooks/useSound';
import './Settings.css';

export const Settings = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const { soundOn, setSoundOn } = useSound();
  const [showRules, setShowRules] = useState(false);

  const onSignOut = async () => {
    onClose?.();
    try {
      await handleSignOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const onLoginClick = () => {
    onClose?.();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-modal">
        <h1 className="settings-title">SETTINGS</h1>
        <div className="settings-content">
          <div className="settings-segmented-control">
            <button
              className={`settings-segment ${!darkMode ? 'settings-segment--active' : ''}`}
              onClick={() => setDarkMode(false)}
            >
              Light
            </button>
            <button
              className={`settings-segment ${darkMode ? 'settings-segment--active' : ''}`}
              onClick={() => setDarkMode(true)}
            >
              Dark
            </button>
          </div>
          <div className="settings-segmented-control">
            <button
              className={`settings-segment ${!soundOn ? 'settings-segment--active' : ''}`}
              onClick={() => setSoundOn(false)}
            >
              Sound Off
            </button>
            <button
              className={`settings-segment ${soundOn ? 'settings-segment--active' : ''}`}
              onClick={() => setSoundOn(true)}
            >
              Sound On
            </button>
          </div>
          <button className="settings-button" onClick={() => setShowRules(true)}>Rules</button>
          <button className="settings-button" onClick={user ? onSignOut : onLoginClick}>
            {user ? 'Sign Out' : 'Login'}
          </button>
        </div>
      </div>

      {showRules && (
        <>
          <div className="settings-overlay settings-rules-overlay" onClick={() => setShowRules(false)} />
          <div className="settings-rules-modal">
            <h2 className="settings-rules-title">Rules</h2>
            <div className="settings-rules-content">
              <p><strong>Find Numbers that Match the Target Sum</strong><br />
              Look at the grid of numbers and the target sum (10) shown on the screen.</p>
              <p><strong>Draw a Box Around Numbers</strong><br />
              Click and drag your cursor to select a rectangular group of numbers on the grid.</p>
              <p><strong>Make the Sum Equal the Target</strong><br />
              If the numbers inside your box add up exactly to the target sum, they will disappear and you will earn points.</p>
              <p><strong>Score Points</strong><br />
              You gain points based on how many numbers you clear from the board.</p>
              <p><strong>Play Faster Than Your Opponent</strong><br />
              In multiplayer mode, another player is solving the board at the same time. Clear numbers quickly to earn more points than them before time runs out.</p>
              <p><strong>Win the Match</strong><br />
              When the timer ends, the player with the highest score wins.</p>
            </div>
            <button className="settings-button settings-rules-close" onClick={() => setShowRules(false)}>Close</button>
          </div>
        </>
      )}
    </>
  );
};

