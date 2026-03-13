import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import tinImg from '../imgs/TIN.png';
import settingsIcon from '../imgs/Settings.png';
import { Settings } from '../components/Settings/Settings';
import '../App.css';
import './Home.css';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="home">
      <div className="home__content">
        <h1 className="home__title">DIM SUM</h1>
        <p className="home__description">a game to play with your friends! math made fun</p>
        <Link to="/login" className="home__play-btn">Play Now!</Link>
      </div>
      <img src={tinImg} alt="" className="home__image" />

      <button
        className="app__settings-button"
        onClick={() => setShowSettings(true)}
      >
        <img src={settingsIcon} alt="Settings" />
      </button>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
