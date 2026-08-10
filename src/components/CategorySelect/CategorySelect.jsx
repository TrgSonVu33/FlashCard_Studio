import { useState } from 'react';
import './CategorySelect.css';

export default function CategorySelect({ decks, onSelect, onCreateDeck }) {
  const [activeTab, setActiveTab] = useState('system');

  const systemDecks = decks.filter((d) => d.is_system);
  const customDecks = decks.filter((d) => !d.is_system);

  const getDeckEmoji = (title, isSystem) => {
    if (!isSystem) return '✨';
    const t = title.toLowerCase();
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
    <div className="category-select">
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
          My Custom Decks
          <span className="deck-tab-count">{customDecks.length}</span>
        </button>
      </div>

      {/* Deck Grid */}
      {visibleDecks.length > 0 || activeTab === 'custom' ? (
        <div className="category-grid">
          {activeTab === 'custom' && (
            <button
              className="category-card"
              onClick={onCreateDeck}
              style={{ borderStyle: 'dashed', background: 'transparent' }}
            >
              <span className="category-emoji">✚</span>
              <span className="category-label">Create New Deck</span>
              <span className="category-count">Custom</span>
            </button>
          )}
          {visibleDecks.map((deck) => (
            <button
              key={deck.id}
              className="category-card"
              onClick={() => onSelect(deck)}
            >
              <span className="category-emoji">{getDeckEmoji(deck.title, deck.is_system)}</span>
              <span className="category-label">{deck.title}</span>
              <span className="category-count">{deck.card_count} cards</span>
            </button>
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
