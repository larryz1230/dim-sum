import "./ProfileExpanded.css"

interface Props {
  onBack: () => void
}

const ProfileExpanded: React.FC<Props> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default ProfileExpanded;