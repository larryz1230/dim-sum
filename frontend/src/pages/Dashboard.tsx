import React, { useState } from 'react';
import '../App.css'
import PlayExpanded from '../components/Dashboard/PlayExpanded/PlayExpanded.tsx'
import ProfileExpanded from '../components/Dashboard/ProfileExpanded/ProfileExpanded.tsx'
import LeaderboardExpanded from '../components/Dashboard/LeaderboardExpanded/LeaderboardExpanded.tsx'
import SettingsExpanded from '../components/Dashboard/SettingsExpanded/SettingsExpanded.tsx'
import PlayIcon from '../imgs/play.png'
import CrownIcon from '../imgs/crown.png'
import SettingsIcon from '../imgs/settings2.png'
import UserIcon from '../imgs/user-round.png'

interface Props {
  onBack: () => void
}

const Dashboard: React.FC<Props> = ({onBack}) => {
    type Panel = 'play' | 'profile' | 'leaderboard' | 'settings' | null;
    const [activePanel, setActivePanel] = useState<Panel>(null);

    return (
        <div className='app'>
            <div className='app__dashboard'>
                <div className='app__dashboard-header'>
                    <h1>Dashboard</h1>
                </div>
                {activePanel === null ? (
                    <div className='app__dashboard-buttons fade-in'>
                        <div className='app__dashboard-row'>
                            <button className='app__dashboard-button' onClick={() => setActivePanel('play')}>
                                <img src={PlayIcon} />
                                Play
                            </button>

                            <button className='app__dashboard-button' onClick={() => setActivePanel('profile')}>
                                <img src={UserIcon} />
                                Profile
                            </button>
                        </div>

                        <div className='app__dashboard-row'>
                            <button className='app__dashboard-button' onClick={() => setActivePanel('leaderboard')}>
                                <img src={CrownIcon} />
                                Leaderboard
                            </button>

                            <button className='app__dashboard-button' onClick={() => setActivePanel('settings')}>
                                <img src={SettingsIcon} />
                                Settings
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='app__dashboard-expanded fade-in'>
                        {activePanel === 'play' && (
                            <PlayExpanded />
                        )}

                        {activePanel === 'profile' && (
                            <ProfileExpanded />
                        )}

                        {activePanel === 'leaderboard' && (
                            <LeaderboardExpanded />
                        )}

                        {activePanel === 'settings' && (
                            <SettingsExpanded />
                        )}
                        <button className='app__dashboard-back' onClick={() => setActivePanel(null)}>
                            Back <span className="app__dashboard-back-arrow">&gt;</span>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Dashboard;