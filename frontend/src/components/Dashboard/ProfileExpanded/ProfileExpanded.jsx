import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import React, { useState } from 'react';
import { handleSignOut } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import goldBunImg from '../../../imgs/Gold Bun.png';
import './ProfileExpanded.css';

export default function ProfileExpanded() {
  const { user, email, username, rating } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState('Editable bio');
  const [isEditingBio, setIsEditingBio] = useState(false);

  useEffect(() => {
    console.log('Debugging Profile Page:');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Rating:', rating);
  }, [username, email, rating]);

  const onSignOut = async () => {
    try {
      await handleSignOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleBioDoubleClick = () => setIsEditingBio(true);
  const handleBioBlur = () => setIsEditingBio(false);
  const handleBioChange = (e) => setBio(e.target.value);

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
      <div className="profile-expanded__card">
        <div className="profile-expanded__top-row">
          <div className="profile-expanded__avatar">
            <img src={goldBunImg} alt="Profile" />
          </div>
          <div className="profile-expanded__user-info">
            <h2 className="profile-expanded__username">Username</h2>
            <p className="profile-expanded__rank">Rank: 1</p>
            <p className="profile-expanded__rank">Feature 1</p>
            <p className="profile-expanded__rank">Feature 2</p>
          </div>
        </div>
        <div className="profile-expanded__bio-section">
          {isEditingBio ? (
            <textarea
              className="profile-expanded__bio-input"
              value={bio}
              onChange={handleBioChange}
              onBlur={handleBioBlur}
              autoFocus
            />
          ) : (
            <p
              className="profile-expanded__bio"
              onDoubleClick={handleBioDoubleClick}
            >
              {bio}
            </p>
          )}
        </div>
        <button className="profile-expanded__signout" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
