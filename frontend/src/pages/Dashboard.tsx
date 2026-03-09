import React from 'react';
import { handleSignOut } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();

    const onSignOut = async () => {
        await handleSignOut();
        navigate('/login');
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the Dumpling Destroyer dashboard!</p>
            <button onClick={onSignOut}>Sign Out</button>
        </div>
    );
}
