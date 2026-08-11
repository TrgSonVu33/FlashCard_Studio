import './AnswerCheck.css';

export default function AnswerCheck({ currentAnswer, onAnswerChange }) {
  return (
    <div className="answerCheck-container">
      <p className="answerCheck-title">Did you get it right ?</p>
      <div className="answerCheck-options">
        <label className="answerCheck-label">
          <input
            type="checkbox"
            className="answerCheck-checkbox-yes"
            checked={currentAnswer === 'yes'}
            onChange={() => onAnswerChange('yes')}
          /> Yes
        </label>
        <label className="answerCheck-label">
          <input
            type="checkbox"
            className="answerCheck-checkbox-no"
            checked={currentAnswer === 'no'}
            onChange={() => onAnswerChange('no')}
          /> No
        </label>
      </div>
    </div>
  );
}
