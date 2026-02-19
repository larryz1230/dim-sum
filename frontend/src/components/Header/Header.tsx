import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"
import useLogout from '../Logout/Logout.tsx'

const Header: React.FC = () => {
    const logout = useLogout();
    
    return (
    <div className="link-header">
        <nav className="nav">
        <div className="nav-left">
            <Link className="nav-link" to="/dashboard">Dashboard</Link>
            <Link className="nav-link" to="/matchmake">Matchmake</Link>
            <Link className="nav-link" to="/game">Game</Link>
        </div>
        <div className="nav-right">
            <Link className="nav-link" to="/game" onClick={logout}>Sign-Out</Link>
        </div>
        </nav>
    </div>
    );
};

export default Header;