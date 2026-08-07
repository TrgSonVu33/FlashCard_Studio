import { useState, useEffect } from 'react';
import Flashcard from './components/Flashcard/Flashcard';
import AnswerCheck from './components/AnswerCheck/AnswerCheck';
import ResultScreen from './components/ResultScreen/ResultScreen';
import CategorySelect from './components/CategorySelect/CategorySelect';
import { CATEGORIES, FLASHCARDS } from './flashcardData';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showBegin, setShowBegin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [page, setPage] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchHistory(0);
  }, []);

  const fetchHistory = async (pageNum, categoryKey) => {
    setLoadingHistory(true);
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    let query = supabase
      .from('history')
      .select('*')
      .order('id', { ascending: false });

    // Filter by category if provided
    if (categoryKey) {
      query = query.eq('category', categoryKey);
    }

    const { data, error } = await query.range(from, to);

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
    const cards = FLASHCARDS[selectedCategory];
    if (currentIndex < cards.length - 1) {
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

  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setAnswers({});
    setCurrentIndex(0);
    setPage(0);
    fetchHistory(0, categoryKey);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setSelectedCategory(null);
    setPage(0);
    fetchHistory(0);
  };

  const handleQuit = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setSelectedCategory(null);
    setPage(0);
    fetchHistory(0);
  };

  const saveResult = async (correct, totalAmount) => {
    console.log('Saving result:', { score: correct, total: totalAmount, category: selectedCategory });

    // 1. Get the current count to generate a sequential ID (1, 2, 3...)
    const { count, error: countError } = await supabase
      .from('history')
      .select('*', { count: 'exact', head: true });
    
    const newId = countError ? 1 : (count || 0) + 1;

    // 2. Format the date as dd/mm/yyyy
    const dateObj = new Date();
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

    // 3. Insert with id, created_at, category, score, total
    const { data, error } = await supabase
      .from('history')
      .insert([{ 
        id: newId, 
        created_at: formattedDate,
        category: selectedCategory,
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
    const cards = FLASHCARDS[selectedCategory];
    setShowResult(true);
    saveResult(correctCount, cards.length);
  };

  const correctCount = Object.values(answers).filter(v => v === 'yes').length;
  const cards = selectedCategory ? FLASHCARDS[selectedCategory] : [];
  const currentCard = cards[currentIndex];
  const categoryInfo = selectedCategory
    ? CATEGORIES.find(c => c.key === selectedCategory)
    : null;

  return (
    <div className="app-container">
      <h1>FlashCards App</h1>

      {!showBegin ? (
        <>
          <h2>Learn New Vocabulary Words</h2>
          <h3>Choose a category and test your knowledge</h3>

          <div className="welcome-container">
            <button className="begin-button" onClick={() => setShowBegin(true)}>
              Begin
            </button>
            
            <button 
              className="history-toggle-button" 
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) {
                  setPage(0);
                  fetchHistory(0);
                }
              }}
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
                        
                        if (typeof item.created_at === 'string' && item.created_at.includes('T')) {
                          const dateObj = new Date(item.created_at);
                          if (!isNaN(dateObj)) {
                            displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
                          }
                        }

                        const catInfo = CATEGORIES.find(c => c.key === item.category);
                        
                        return (
                          <li key={item.id} className="history-item">
                            <div className="history-info">
                              <span className="history-id">
                                {item.id}.&nbsp;
                              </span>
                              <span className="history-date">
                                {displayDate}
                              </span>
                              {catInfo && (
                                <span className="history-category">
                                  &nbsp;{catInfo.emoji} {catInfo.label}
                                </span>
                              )}
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
        </>
      ) : !selectedCategory ? (
        <>
          <h2>Select a Category</h2>
          <h3>Pick a topic to practice</h3>

          <CategorySelect
            categories={CATEGORIES}
            flashcards={FLASHCARDS}
            onSelect={handleCategorySelect}
          />

          <button className="quit-button" onClick={() => setShowBegin(false)}>
            ← Back
          </button>
        </>
      ) : !showResult ? (
        <>
          <h2>Learn New Words About {categoryInfo?.label}</h2>
          <h3>Try to get the meaning of the word</h3>

          <div className="progress">
            Card {currentIndex + 1} of {cards.length}
          </div>

          <div className="flashcards">
            {currentCard && (
              <Flashcard
                key={`${selectedCategory}-${currentCard.id}`}
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
            <button className="next-button" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
              Next
            </button>
          </div>

          <AnswerCheck
            currentAnswer={answers[currentIndex]}
            onAnswerChange={handleAnswerCheck}
          />

          {currentIndex === cards.length - 1 && (
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
          total={cards.length}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;