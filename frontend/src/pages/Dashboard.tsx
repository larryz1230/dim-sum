import React from 'react';
import useLogout from '../components/Logout/Logout.tsx'

const Dashboard: React.FC = () => {
    const logout = useLogout()

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the Dumpling Destroyer dashboard!</p>
            <button onClick={logout}>Sign Out</button>
        </div>
    );
};

export default Dashboard;
