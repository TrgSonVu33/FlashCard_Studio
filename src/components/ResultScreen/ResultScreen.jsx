import './ResultScreen.css';

export default function ResultScreen({ correctCount, total, onReset }) {
  return (
    <div className="result-container">
      <p className="result-text">You got {correctCount} / {total} correct!</p>
      <button className="reset-button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}