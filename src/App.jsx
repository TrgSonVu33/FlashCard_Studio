import { useState, useEffect } from 'react';
import Flashcard from './components/Flashcard/Flashcard';
import AnswerCheck from './components/AnswerCheck/AnswerCheck';
import ResultScreen from './components/ResultScreen/ResultScreen';
import { supabase } from './supabaseClient';
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
  const [showBegin, setShowBegin] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchHistory(0);
  }, []);

  const fetchHistory = async (pageNum) => {
    setLoadingHistory(true);
    const from = pageNum * 10;
    const to = from + 9;
    
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      if (pageNum === 0) {
        setHistory(data || []);
      } else {
        setHistory(prev => [...prev, ...data]);
      }
    }
    setLoadingHistory(false);
  };

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
    setShowBegin(false);
    setPage(0);
    fetchHistory(0);
  };

  const saveResult = async (correct, totalAmount) => {
    console.log('Saving result:', { score: correct, total: totalAmount });
    const { data, error } = await supabase
      .from('history')
      .insert([{ score: correct, total: totalAmount }])
      .select();
    if (error) {
      console.error('Error saving result:', error);
    } else {
      console.log('Result saved successfully:', data);
    }
  };

  const handleFinish = () => {
    setShowResult(true);
    saveResult(correctCount, FLASHCARDS.length);
  };

  const correctCount = Object.values(answers).filter(v => v === 'yes').length;
  const currentCard = FLASHCARDS[currentIndex];

  return (
    <div className="app-container">
      <h1>FlashCards App</h1>
      <h2>Learn New Words About Different Animals</h2>
      <h3>Try to get the meaning of the word</h3>
      
      {!showBegin ? (
        <div className="welcome-container">
          <button className="begin-button" onClick={() => setShowBegin(true)}>
            Begin
          </button>
          
          <div className="history-dashboard">
            <h2>History Dashboard</h2>
            {loadingHistory && page === 0 ? (
              <p>Loading history...</p>
            ) : history.length === 0 ? (
              <p>No history yet. Play a game!</p>
            ) : (
              <>
                <ul className="history-list">
                  {history.map((item) => (
                    <li key={item.id} className="history-item">
                      <span className="history-date">
                        {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                      </span>
                      <span className="history-score">
                        Score: <strong>{item.score} / {item.total}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
                {history.length >= (page + 1) * 10 && (
                  <button 
                    className="show-more-button" 
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchHistory(nextPage);
                    }}
                    disabled={loadingHistory}
                  >
                    {loadingHistory ? 'Loading...' : 'Show More'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : !showResult ? (
        <>
          <div className="progress">
            Card {currentIndex + 1} of {FLASHCARDS.length}
          </div>

          <div className="flashcards">
            {currentCard && (
              <Flashcard
                key={currentCard.id}
                question={
                  <>
                    <span>Question {currentIndex + 1} </span>
                    <br />
                    {currentCard.q}
                  </>
                }
                answer={currentCard.a}
              />
            )}
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
            <button className="finish-button" onClick={handleFinish}>
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