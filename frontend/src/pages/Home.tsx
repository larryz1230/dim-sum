import React from 'react';
import { Link } from 'react-router-dom';
import tinImg from '../imgs/TIN.png';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <div className="home__content">
        <h1 className="home__title">DIM SUM</h1>
        <p className="home__description">this is placeholder, replace with description later</p>
        <Link to="/login" className="home__play-btn">Play Now!</Link>
      </div>
      <img src={tinImg} alt="" className="home__image" />
    </div>
  );
}
