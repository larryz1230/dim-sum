import './ProfileExpanded.css'
import DefaultAvatar from '../../../imgs/default-avatar.jpeg'

const ProfileExpanded: React.FC = () => {
  return (
    <div className="profile-content">
      <div className='profile-container'>
        <img src={DefaultAvatar}></img>
      </div>
      <div className='profile-name'>
        Hello, Username!
      </div>
      <div className='profile-stats'>
        <div className='profile-stat'>
          Wins:
        </div>
        <div className='profile-stat'>
          Losses:
        </div>
      </div>
    </div>
  );
}

export default ProfileExpanded;