import "./LeaderboardExpanded.css"

interface Props {
  onBack: () => void
}

const LeaderboardExpanded: React.FC<Props> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default LeaderboardExpanded;