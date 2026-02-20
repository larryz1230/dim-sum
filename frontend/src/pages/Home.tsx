import React from 'react';
import Logo from '../components/Logo/Logo.tsx'
import { useNavigate } from 'react-router-dom';
import '../App.css'

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className='app'>
            <div className='app__header'>
                <div className='app__logo-wrapper'>
                    <Logo />
                </div>
                <h1>Dumping Destroyer</h1>
                <p>Math Made Fun and Competitive!</p>
                <div className='app__controls'>
                    <button onClick={() => navigate('/dashboard')}>Start Playing</button>
                </div>
            </div>
        </div>
    );
};

export default Home;
