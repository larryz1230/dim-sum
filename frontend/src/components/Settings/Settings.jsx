import React from 'react';
import './Settings.css';

export const Settings = ({ onClose, onLoginClick }) => {
  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-modal">
        <h1 className="settings-title">SETTINGS</h1>
        <div className="settings-content">
          <div className="settings-column">
            <button className="settings-button">placeholder</button>
            <button className="settings-button">placeholder</button>
            <button className="settings-button" onClick={onLoginClick}>login</button>
            <button className="settings-button">placeholder</button>
          </div>
          <div className="settings-column">
            <button className="settings-button">placeholder</button>
            <button className="settings-button">placeholder</button>
            <button className="settings-button">placeholder</button>
            <button className="settings-button">placeholder</button>
          </div>
        </div>
      </div>
    </>
  );
};

