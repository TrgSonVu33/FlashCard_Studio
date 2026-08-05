import { useState } from 'react';
import './Flashcard.css';

export default function Flashcard({ question, answer }) {

  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner">

        <div className="flashcard-front">
          <p>{question}</p>
        </div>

        <div className="flashcard-back">
          <p>{answer}</p>
        </div>
        
      </div>
    </div>
  );
}