import React from 'react';
import { handleSignOut } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './ProfileExpanded.css';

export default function ProfileExpanded() {
  const navigate = useNavigate();

  const onSignOut = async () => {
    await handleSignOut();
    navigate('/login');
  };

  return (
    <div className="profile-expanded">
      <h2>Profile</h2>
      <p>Your profile settings will appear here.</p>
      <button className="profile-expanded__signout" onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
}
