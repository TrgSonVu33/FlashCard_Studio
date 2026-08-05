import { useState } from 'react';
import Flashcard from './components/Flashcard';
import './App.css';

const FLASHCARDS = [
  { id: 1, q: "What is a React Component?", a: "A reusable piece of UI that can have its own logic and state." },
  { id: 2, q: "What is JSX?", a: "A syntax extension for JavaScript that looks like HTML." },
  { id: 3, q: "What is the Virtual DOM?", a: "A lightweight copy of the actual DOM used for performance optimization." },
  { id: 4, q: "What are Props?", a: "Arguments passed into React components to give them data." },
  { id: 5, q: "What is State?", a: "An object that stores data that can change over the lifecycle of a component." },
  { id: 6, q: "What does useState do?", a: "It allows you to add state variables to functional components." },
  { id: 7, q: "What does useEffect do?", a: "It lets you perform side effects (like data fetching) in components." },
  { id: 8, q: "What is a Hook?", a: "A special function that lets you 'hook into' React features." },
  { id: 9, q: "Can a component mutate its own props?", a: "No, props are read-only." },
  { id: 10, q: "What is Conditional Rendering?", a: "Rendering different UI elements based on certain conditions or state." }
];

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const renderCard = (index) => {
    const card = FLASHCARDS[index];
    if (!card) return null;

    return (
      <Flashcard
        key={card.id}
        question={
          <>
            <span>Question {index + 1}:</span>
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
      
      <div className="progress">
        Card {currentIndex + 1} of {FLASHCARDS.length}
      </div>

      <div className="flashcards-wrapper">
        {renderCard(currentIndex)}
        {renderCard(currentIndex + 1)}
      </div>

      <div className="button-group">
        <button onClick={handlePrev} disabled={currentIndex === 0}>
          Prev
        </button>
        <button onClick={handleNext} disabled={currentIndex === FLASHCARDS.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;