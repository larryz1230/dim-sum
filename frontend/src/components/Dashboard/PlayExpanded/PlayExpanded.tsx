import './PlayExpanded.css'
import { Link } from 'react-router-dom';

const PlayExpanded: React.FC = () => {
  return (
    <div className='play-content'>
      <Link to='/matchmake'>
        <button className='play-button'>
          Multiplayer
          <span className='button-description'>
            Compete Against Others
          </span>
        </button>
      </Link>
      <Link to='/game'>
        <button className='play-button'>
          Singleplayer
          <span className='button-description'>
            Practice Without Pressure
          </span>
        </button>
      </Link>
    </div>
  );
}

export default PlayExpanded;