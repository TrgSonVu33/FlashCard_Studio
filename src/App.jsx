import { Flashcard, AnswerCheck, ResultScreen, CategorySelect } from './components';
import { CATEGORIES, FLASHCARDS } from './data/flashcardData';
import { useFlashcards } from './hooks/useFlashcards';
import { useHistory } from './hooks/useHistory';
import './App.css';

function App() {
  const {
    currentIndex,
    answers,
    showResult,
    showBegin,
    selectedCategory,
    cards,
    currentCard,
    correctCount,
    handleNext,
    handlePrev,
    handleAnswerCheck,
    handleCategorySelect,
    handleFinish,
    resetSession,
    beginSession,
    goBack,
  } = useFlashcards();

  const {
    history,
    loadingHistory,
    page,
    showHistory,
    PAGE_SIZE,
    fetchHistory,
    saveResult,
    toggleHistory,
    loadMore,
    showLess,
    resetPagination,
  } = useHistory();

  const categoryInfo = selectedCategory
    ? CATEGORIES.find(c => c.key === selectedCategory)
    : null;

  const onCategorySelect = (categoryKey) => {
    handleCategorySelect(categoryKey);
    resetPagination();
    fetchHistory(0, categoryKey);
  };

  const onFinish = () => {
    handleFinish();
    saveResult(selectedCategory, correctCount, cards.length);
  };

  const onReset = () => {
    resetSession();
    resetPagination();
    fetchHistory(0);
  };

  const onQuit = () => {
    resetSession();
    resetPagination();
    fetchHistory(0);
  };

  return (
    <div className="app-container">
      <h1>FlashCards App</h1>

      {!showBegin ? (
        <>
          <h2>Learn New Vocabulary Words</h2>
          <h3>Choose a category and test your knowledge</h3>

          <div className="welcome-container">
            <button className="begin-button" onClick={beginSession}>
              Begin
            </button>
            
            <button 
              className="history-toggle-button" 
              onClick={toggleHistory}
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

                        const catInfo = CATEGORIES.find(c => c.key === item.categories);
                        
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
                          onClick={showLess}
                        >
                          Show Less
                        </button>
                      )}
                      {history.length >= (page + 1) * PAGE_SIZE && (
                        <button 
                          className="show-more-button" 
                          onClick={loadMore}
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
            onSelect={onCategorySelect}
          />

          <button className="quit-button" onClick={goBack}>
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
            <button className="finish-button" onClick={onFinish}>
              Finish
            </button>
          )}

          <button className="quit-button" onClick={onQuit}>
            ✕ Quit
          </button>
        </>
      ) : (
        <ResultScreen
          correctCount={correctCount}
          total={cards.length}
          onReset={onReset}
        />
      )}
    </div>
  );
}

export default App;