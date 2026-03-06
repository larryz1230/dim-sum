import "./PlayExpanded.css"

interface Props {
  onBack: () => void
}

const PlayExpanded: React.FC<Props> = ({ onBack }) => {
  return (
    <div>
      <h1>Quick Play</h1>
      <h2>Practice Mode</h2>
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default PlayExpanded;