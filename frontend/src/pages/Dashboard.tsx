import React from 'react';
import useLogout from '../components/Logout/Logout.tsx'
import '../App.css'

const Dashboard: React.FC = () => {
    const logout = useLogout()

    return (
        <div className='app'>
            <div className='app__header'>
                <h1>Dashboard</h1>
            </div>
            <div className='app__dashboard'>
                <button>Hi</button>
                <button>Bye</button>
            </div>
            <div className='app__settings-button'>
                <button onClick={logout}>Sign Out</button>
            </div>
        </div>
    );
};

export default Dashboard;
