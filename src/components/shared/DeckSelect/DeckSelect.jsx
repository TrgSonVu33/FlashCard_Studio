import { useState } from 'react';
import './DeckSelect.css';

export default function DeckSelect({ decks, onSelect, onCreateDeck, onEditDeck }) {
  const [activeTab, setActiveTab] = useState('system');

  const systemDecks = decks.filter((d) => d.is_system);
  const customDecks = decks.filter((d) => !d.is_system);

  const getDeckEmoji = (deck) => {
    if (deck.icon) return deck.icon;
    if (!deck.is_system) return '✨';
    const t = deck.title.toLowerCase();
    if (t.includes('animal')) return '🐾';
    if (t.includes('fruit')) return '🥭';
    if (t.includes('color')) return '🎨';
    if (t.includes('body')) return '🫀';
    if (t.includes('drink')) return '🥤';
    if (t.includes('school')) return '🏫';
    return '📚';
  };

  const visibleDecks = activeTab === 'system' ? systemDecks : customDecks;

  return (
    <div className="deck-select">
      {/* Tab Toggle */}
      <div className="deck-tabs">
        <button
          className={`deck-tab ${activeTab === 'system' ? 'deck-tab--active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System Decks
          <span className="deck-tab-count">{systemDecks.length}</span>
        </button>
        <button
          className={`deck-tab ${activeTab === 'custom' ? 'deck-tab--active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Decks
          <span className="deck-tab-count">{customDecks.length}</span>
        </button>
      </div>

      {/* Deck Grid */}
      {visibleDecks.length > 0 || activeTab === 'custom' ? (
        <div className="deck-grid">
          {activeTab === 'custom' && (
            <div className="deck-card-wrapper">
              <button
                className="deck-card"
                onClick={onCreateDeck}
                style={{ borderStyle: 'dashed', background: 'transparent' }}
              >
                <span className="deck-emoji">✚</span>
                <span className="deck-label">Create New Deck</span>
              </button>
            </div>
          )}
          {visibleDecks.map((deck) => (
            <div key={deck.id} className="deck-card-wrapper">
              <button
                className="deck-card"
                onClick={() => onSelect(deck)}
              >
                <span className="deck-emoji">{getDeckEmoji(deck)}</span>
                <span className="deck-label">{deck.title}</span>
              </button>
              {activeTab === 'custom' && (
                <button
                  className="deck-edit-btn"
                  onClick={(e) => { e.stopPropagation(); onEditDeck?.(deck); }}
                  title="Edit Deck Settings"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="deck-empty">
          <span className="deck-empty-icon">📚</span>
          <p className="deck-empty-title">No system decks found</p>
          <p className="deck-empty-desc">System decks will appear once added to the database.</p>
        </div>
      )}
    </div>
  );
}
