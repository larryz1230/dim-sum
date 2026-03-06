import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css"
import useLogout from '../Logout/Logout.tsx'

const Header: React.FC = () => {
    const logout = useLogout();

    const [isVisible, setIsVisible] = useState(true);

    const toggleHeader = () => {
        setIsVisible(!isVisible);
    }
    
    return (
        <div className={`link-header ${isVisible ? '' : 'hidden'}`}>
            <nav className="nav">
                <div className="nav-left">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                    <Link className="nav-link" to="/matchmake">Matchmake</Link>
                    <Link className="nav-link" to="/game">Game</Link>
                </div>
                <div className="nav-right">
                    <button className="sign-out-btn" onClick={logout}>Sign-Out</button>
                </div>
            </nav>
            <div className="toggle-arrow" onClick={toggleHeader}>
                {isVisible ? '^' : 'v'}
            </div>
        </div>
    );
};

export default Header;