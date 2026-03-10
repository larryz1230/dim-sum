import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { handleSignOut } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import goldBunImg from '../../../imgs/Gold Bun.png';
import './ProfileExpanded.css';

export default function ProfileExpanded() {
  const { email, username, rating, matchesPlayed, wins, losses, ties } = useAuth();
  const navigate = useNavigate();
  // const [bio, setBio] = useState('Editable bio');
  // const [isEditingBio, setIsEditingBio] = useState(false);
  // const handleBioDoubleClick = () => setIsEditingBio(true);
  // const handleBioBlur = () => setIsEditingBio(false);
  // const handleBioChange = (e) => setBio(e.target.value);

  const onSignOut = async () => {
    try {
      await handleSignOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="profile-expanded">
      <div className="profile-expanded__card">
        <div className="profile-expanded__top-row">
          <div className="profile-expanded__avatar">
            <img src={goldBunImg} alt="Profile" />
          </div>
          <div className="profile-expanded__user-info">
            <h2 className="profile-expanded__username">{username ?? 'Username'}</h2>
            <p className="profile-expanded__rank">Rating: {rating ?? '1'}</p>
            <p className="profile-expanded__stat">Matches played: {matchesPlayed ?? 0}</p>
            <p className="profile-expanded__stat">Wins: {wins ?? 0}</p>
            <p className="profile-expanded__stat">Losses: {losses ?? 0}</p>
            <p className="profile-expanded__stat">Ties: {ties ?? 0}</p>
          </div>
        </div>
        {/* Editable bio - commented out for now
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
        */}
        <button className="profile-expanded__signout" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
