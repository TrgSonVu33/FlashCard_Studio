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
  const [showHistory, setShowHistory] = useState(false);

  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchHistory(0);
  }, []);

  const fetchHistory = async (pageNum) => {
    setLoadingHistory(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('id', { ascending: false })
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

  const handleQuit = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setShowBegin(false);
    setPage(0);
    fetchHistory(0);
  };

  const saveResult = async (correct, totalAmount) => {
    console.log('Saving result:', { score: correct, total: totalAmount });

    // 1. Get the current count to generate a sequential ID (1, 2, 3...)
    const { count, error: countError } = await supabase
      .from('history')
      .select('*', { count: 'exact', head: true });
    
    const newId = countError ? 1 : (count || 0) + 1;

    // 2. Format the date as dd/mm/yyyy
    const dateObj = new Date();
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

    // 3. Insert the explicitly defined id and created_at
    const { data, error } = await supabase
      .from('history')
      .insert([{ 
        id: newId, 
        created_at: formattedDate,
        score: correct, 
        total: totalAmount 
      }])
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
          
          <button 
            className="history-toggle-button" 
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? '▲ Hide History' : '▼ History Dashboard'}
          </button>

          {showHistory && (
            <div className="history-dashboard">
              <h2>History Dashboard</h2>
              {loadingHistory && page === 0 ? (
                <p>Loading history...</p>
              ) : history.length === 0 ? (
                <p>No history yet. Play a game!</p>
              ) : (
                <>
                  <ul className="history-list">
                    {history.map((item) => {
                      let displayDate = item.created_at;
                      
                      // Format if it's an older ISO timestamp
                      if (typeof item.created_at === 'string' && item.created_at.includes('T')) {
                        const dateObj = new Date(item.created_at);
                        if (!isNaN(dateObj)) {
                          displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                        }
                      }
                      
                      return (
                        <li key={item.id} className="history-item">
                          <div className="history-info">
                            <span className="history-id">
                              {item.id}.&nbsp;
                            </span>
                            <span className="history-date">
                              {displayDate}
                            </span>
                          </div>
                          <span className="history-score">
                            Score: <strong>{item.score} / {item.total}</strong>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="history-buttons">
                    {history.length > PAGE_SIZE && (
                      <button 
                        className="show-more-button" 
                        onClick={() => {
                          setPage(0);
                          fetchHistory(0);
                        }}
                      >
                        Show Less
                      </button>
                    )}
                    {history.length >= (page + 1) * PAGE_SIZE && (
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
                  </div>
                </>
              )}
            </div>
          )}
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
            <button className="prev-button" onClick={handlePrev} disabled={currentIndex === 0}>
              Prev
            </button>
            <button className="next-button" onClick={handleNext} disabled={currentIndex === FLASHCARDS.length - 1}>
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

          <button className="quit-button" onClick={handleQuit}>
            ✕ Quit
          </button>
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