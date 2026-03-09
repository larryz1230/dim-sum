import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { handleSignOut } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './ProfileExpanded.css';

export default function ProfileExpanded() {
  const { user, email, username, rating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Debugging Profile Page:');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Rating:', rating);
  }, [username, email, rating]);

  const onSignOut = async () => {
    await handleSignOut();
    navigate('/login');
  };

  return (
    <div className="profile-expanded">
      <h2>Profile</h2>
      {user ? (
        <div className="profile-details">
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Rating:</strong> {rating}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <button className="profile-expanded__signout" onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
}
