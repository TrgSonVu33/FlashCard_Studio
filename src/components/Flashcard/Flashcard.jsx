import { useState } from 'react';
import './Flashcard.css';

const SRS_RATINGS = [
  { value: 1, label: 'Again', className: 'srs-btn--again' },
  { value: 2, label: 'Hard',  className: 'srs-btn--hard' },
  { value: 3, label: 'Good',  className: 'srs-btn--good' },
  { value: 4, label: 'Easy',  className: 'srs-btn--easy' },
];

export default function Flashcard({ question, answer, onSrsRating, showRating = false }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleRating = (rating) => {
    if (onSrsRating) {
      onSrsRating(rating);
      setIsFlipped(false); // Reset flip for next card
    }
  };

  return (
    <div className="flashcard-wrapper">
      <div
        className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <p>{question}</p>
            {!isFlipped && (
              <span className="flashcard-hint">Click to reveal answer</span>
            )}
          </div>

          <div className="flashcard-back">
            <p>{answer}</p>
          </div>
        </div>
      </div>

      {/* SRS Rating Buttons — shown only when card is flipped */}
      {showRating && isFlipped && (
        <div className="srs-rating-bar">
          <p className="srs-rating-title">How well did you know this?</p>
          <div className="srs-rating-buttons">
            {SRS_RATINGS.map(({ value, label, className }) => (
              <button
                key={value}
                className={`srs-btn ${className}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRating(value);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
