import './ResultScreen.css';

export default function ResultScreen({ correctCount, total, mode, onReset, onViewHistory }) {
  const displayMode = mode && mode !== 'standard' 
    ? mode.charAt(0).toUpperCase() + mode.slice(1) 
    : 'Standard';

  return (
    <div className="result-container">
      <div className="result-icon">🎉</div>
      <h2 className="result-title">Session Complete!</h2>
      <p className="result-text">
        You scored <strong>{correctCount}</strong> out of <strong>{total}</strong> in <strong>{displayMode}</strong> Mode.
      </p>
      
      <div className="result-actions">
        <button className="result-btn-primary" onClick={onViewHistory}>
          View History
        </button>
        <button className="result-btn-secondary" onClick={onReset}>
          Start New Session
        </button>
      </div>
    </div>
  );
}