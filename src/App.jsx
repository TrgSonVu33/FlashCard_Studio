import { useState } from 'react';
import Flashcard from './components/Flashcard/Flashcard';
import AnswerCheck from './components/AnswerCheck/AnswerCheck';
import ResultScreen from './components/ResultScreen/ResultScreen';
import './App.css';

const FLASHCARDS = [
  { id: 1, q: "Horse", a: "Con Ngựa" },
  { id: 2, q: "Goat", a: "Con Dê" },
  { id: 3, q: "Sheep", a: "Con Cừu" },
  { id: 4, q: "Tiger", a: "Con Hổ" },
  { id: 5, q: "Lion", a: "Con Sư tử" },
  { id: 6, q: "Elephant", a: "Con Voi" },
  { id: 7, q: "Bear", a: "Con Gấu" },
  { id: 8, q: "Monkey", a: "Con Khỉ" },
  { id: 9, q: "Giraffe", a: "Con Hươu cao cổ" },
  { id: 10, q: "Rabbit", a: "Con Thỏ" },
];

function App() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);

    const handleNext = () => {
        if (currentIndex < FLASHCARDS.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleAnswerCheck = (value) => {
        setAnswers({ ...answers, [currentIndex]: value });
    };
    const handleReset = () => {
        setAnswers({});
        setCurrentIndex(0);
        setShowResult(false);
    };

    const correctCount = Object.values(answers).filter(v => v === 'yes').length;

    const renderCard = (index) => {
        const card = FLASHCARDS[index];
        if (!card) return null;

        return (
        <Flashcard
            key={card.id}
            question={
            <>
                <span>Question {index + 1} </span>
                <br />
                {card.q}
            </>
            }
            answer={card.a}
        />
        );
    };

  return (
    <div className="app-container">
      <h1>FlashCards App</h1>
      <h2>Learn New Words About Different Animals</h2>
      <h3>Try to get the meaning of the word</h3>
      
      {!showResult ? (
        <>
          <div className="progress">
            Card {currentIndex + 1} of {FLASHCARDS.length}
          </div>

          <div className="flashcards">
            {renderCard(currentIndex)}
          </div>

          <div className="button-group">
            <button onClick={handlePrev} disabled={currentIndex === 0}>
              Prev
            </button>
            <button onClick={handleNext} disabled={currentIndex === FLASHCARDS.length - 1}>
              Next
            </button>
          </div>

          <AnswerCheck
            currentAnswer={answers[currentIndex]}
            onAnswerChange={handleAnswerCheck}
          />

          {currentIndex === FLASHCARDS.length - 1 && (
            <button className="finish-button" onClick={() => setShowResult(true)}>
              Finish
            </button>
          )}
        </>
      ) : (
        <ResultScreen
          correctCount={correctCount}
          total={FLASHCARDS.length}
          onReset={handleReset}
        />
      )}

    </div>
  );
}

export default App;