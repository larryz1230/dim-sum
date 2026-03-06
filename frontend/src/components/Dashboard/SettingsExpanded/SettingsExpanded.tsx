import "./SettingsExpanded.css"

interface Props {
  onBack: () => void
}

const SettingsExpanded: React.FC<Props> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default SettingsExpanded;