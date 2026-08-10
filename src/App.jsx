import { useState, useEffect } from 'react';
import { Flashcard, ResultScreen, CategorySelect, Navbar, StudySetsSelect, Footer, Contact } from './components';
import CreateDeck from './components/CreateDeck/CreateDeck';
import { useFlashcards } from './hooks/useFlashcards';
import { useHistory } from './hooks/useHistory';
import { supabase } from './services/supabase';
import './App.css';

function App() {
  const {
    currentIndex,
    showResult,
    selectedDeck,
    cards,
    currentCard,
    correctCount,
    dueCount,
    dueIndex,
    loadingCards,
    handleNext,
    handlePrev,
    handleSrsRating,
    handleCategorySelect,
    resetSession,
  } = useFlashcards();

  const {
    history,
    loadingHistory,
    page,
    PAGE_SIZE,
    fetchHistory,
    loadMore,
    showLess,
    resetPagination,
  } = useHistory();

  const [currentView, setCurrentView] = useState('home');
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [allDecks, setAllDecks] = useState([]);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    fetchDecks();
  }, []);

  useEffect(() => {
    if (currentView === 'history') {
      resetPagination();
      fetchHistory(0);
    }
  }, [currentView, fetchHistory, resetPagination]);

  const fetchDecks = async () => {
    const { data: decksData, error } = await supabase
      .from('decks')
      .select('*, cards(count)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching decks:', error);
      return;
    }

    let tCards = 0;
    const formattedDecks = decksData.map(d => {
      const count = d.cards[0]?.count || 0;
      tCards += count;
      return { ...d, card_count: count };
    });

    setAllDecks(formattedDecks);
    setTotalCards(tCards);
  };

  const handleNavClick = (view) => {
    resetSession();
    setCurrentView(view);
  };

  const onCategorySelect = (deck) => {
    handleCategorySelect(deck);
    setCurrentView('study');
  };

  const onStudySetSelect = (mode) => {
    const defaultDecks = allDecks.filter(d => d.is_system);
    const shuffled = [...defaultDecks].sort(() => 0.5 - Math.random());

    let selectedDecks = [];
    if (mode === 'easy') selectedDecks = shuffled.slice(0, 2);
    if (mode === 'normal') selectedDecks = shuffled.slice(0, 4);
    if (mode === 'hard') selectedDecks = shuffled.slice(0, 6);

    handleCategorySelect(selectedDecks);
    setCurrentView('study');
  };

  const onReset = () => {
    resetSession();
    setCurrentView('deckSelect');
  };

  const onQuit = () => {
    resetSession();
    setCurrentView('home');
  };

  const handleDeckCreated = () => {
    fetchDecks();
    setCurrentView('deckSelect');
  };

  const systemDeckCount = allDecks.filter(d => d.is_system).length;
  const customDeckCount = allDecks.filter(d => !d.is_system).length;

  return (
    <div className="page-wrapper">
      <Navbar onNavClick={handleNavClick} currentView={currentView} />

      <main className="app-container">

        {/* ─── VIEW: HOME ─── */}
        {currentView === 'home' && (
          <div className="view-centered">
            <section className="hero-section">
              <h1 className="hero-title">
                Welcome to your <br /> Study Workspace
              </h1>
              <p className="hero-subtitle">
                Build decks, mix categories, and master new vocabulary with spaced repetition, all in one place.
              </p>
            </section>

            <div className="dashboard-grid">
              <button className="dashboard-card" onClick={() => setCurrentView('deckSelect')}>
                <div className="dashboard-card-icon">📚</div>
                <span className="dashboard-card-title">Browse Decks</span>
                <span className="dashboard-card-desc">
                  {systemDeckCount} default · {customDeckCount} custom
                </span>
              </button>

              <button className="dashboard-card" onClick={() => setCurrentView('studySets')}>
                <div className="dashboard-card-icon">🎯</div>
                <span className="dashboard-card-title">Study Sets</span>
                <span className="dashboard-card-desc">
                  Mix decks in Easy, Normal, or Hard mode
                </span>
              </button>

              <button className="dashboard-card" onClick={() => setShowCreateDeck(true)}>
                <div className="dashboard-card-icon">✚</div>
                <span className="dashboard-card-title">Create Deck</span>
                <span className="dashboard-card-desc">
                  Build a custom flashcard deck
                </span>
              </button>

              <button className="dashboard-card" onClick={() => setCurrentView('history')}>
                <div className="dashboard-card-icon">📊</div>
                <span className="dashboard-card-title">History</span>
                <span className="dashboard-card-desc">
                  Review your past study sessions
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW: HISTORY ─── */}
        {currentView === 'history' && (
          <div className="view-centered">
            <div className="history-page">
              <div className="history-page-header">
                <button className="quit-button header-back-btn" onClick={() => setCurrentView('home')}>
                  ← Back
                </button>
                <div className="history-page-title-container">
                  <h1 className="history-page-title">History</h1>
                  <p className="history-page-subtitle">Review your past study sessions</p>
                </div>
              </div>

              <div className="history-dashboard">
                {loadingHistory && page === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">⏳</span>
                    <p className="empty-state-title">Loading history...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">📭</span>
                    <p className="empty-state-title">No history yet</p>
                    <p className="empty-state-desc">Complete a study session to see your results here.</p>
                  </div>
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
                        const deckInfo = allDecks.find(
                          d => d.id === item.categories || d.title.toLowerCase() === item.categories
                        );
                        return (
                          <li key={item.id} className="history-item">
                            <div className="history-info">
                              <span className="history-id">{item.id}.&nbsp;</span>
                              <span className="history-date">{displayDate}</span>
                              {deckInfo && (
                                <span className="history-category">&nbsp;📚 {deckInfo.title}</span>
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
                        <button className="show-more-button" onClick={showLess}>Show Less</button>
                      )}
                      {history.length >= (page + 1) * PAGE_SIZE && (
                        <button className="show-more-button" onClick={loadMore} disabled={loadingHistory}>
                          {loadingHistory ? 'Loading...' : 'Show More'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW: DECK SELECT ─── */}
        {currentView === 'deckSelect' && (
          <div className="view-centered">
            <div className="study-header">
              <h2 className="study-title">Select a Deck</h2>
              <p className="study-subtitle">Pick a topic to practice</p>
            </div>
            <CategorySelect 
              decks={allDecks} 
              onSelect={onCategorySelect} 
              onCreateDeck={() => setShowCreateDeck(true)}
            />
            <button className="quit-button" onClick={() => setCurrentView('home')}>← Back</button>
          </div>
        )}

        {/* ─── VIEW: STUDY SETS ─── */}
        {currentView === 'studySets' && (
          <div className="view-centered">
            <StudySetsSelect onSelectMode={onStudySetSelect} />
            <button className="quit-button" onClick={() => setCurrentView('home')}>← Back</button>
          </div>
        )}

        {/* ─── VIEW: STUDY ─── */}
        {currentView === 'study' && (
          loadingCards ? (
            <div className="study-header">
              <h2 className="study-title">Loading cards...</h2>
            </div>
          ) : !showResult ? (
            <>
              <div className="study-header">
                <h2 className="study-title">{selectedDeck?.title}</h2>
                <p className="study-subtitle">Flip the card, then rate how well you knew it</p>
              </div>

              <div className="progress">
                {dueCount > 0
                  ? `Card ${dueIndex + 1} of ${dueCount} due`
                  : `Card ${currentIndex + 1} of ${cards.length}`
                }
              </div>

              <div className="flashcards">
                {currentCard && (
                  <Flashcard
                    key={`${selectedDeck?.id}-${currentCard.id}`}
                    question={
                      <>
                        <span>Question {(dueCount > 0 ? dueIndex : currentIndex) + 1} </span>
                        <br />
                        {currentCard.front}
                      </>
                    }
                    answer={currentCard.back}
                    showRating={true}
                    onSrsRating={handleSrsRating}
                  />
                )}
              </div>

              <div className="button-group">
                <button
                  className="prev-button"
                  onClick={handlePrev}
                  disabled={dueCount > 0 ? dueIndex === 0 : currentIndex === 0}
                >
                  Prev
                </button>
                <button
                  className="next-button"
                  onClick={handleNext}
                  disabled={dueCount > 0 ? dueIndex === dueCount - 1 : currentIndex === cards.length - 1}
                >
                  Next
                </button>
              </div>

              <button className="quit-button" onClick={onQuit}>✕ Quit</button>
            </>
          ) : (
            <ResultScreen
              correctCount={correctCount}
              total={dueCount > 0 ? dueCount : cards.length}
              onReset={onReset}
            />
          )
        )}

      </main>

      <CreateDeck
        isOpen={showCreateDeck}
        onClose={() => setShowCreateDeck(false)}
        onDeckCreated={handleDeckCreated}
      />

      <Footer showContact={currentView === 'home'} />
    </div>
  );
}

export default App;