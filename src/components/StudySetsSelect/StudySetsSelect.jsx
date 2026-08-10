import { useState } from 'react';
import './StudySetsSelect.css';

const MODES = [
  { key: 'easy', label: 'Easy', emoji: '🌱', desc: 'Mix 2 random default decks', color: '#16a34a' },
  { key: 'normal', label: 'Normal', emoji: '🔥', desc: 'Mix 4 random default decks', color: '#ea580c' },
  { key: 'hard', label: 'Hard', emoji: '⚡️', desc: 'Mix all 6 default decks', color: '#dc2626' },
];

export default function StudySetsSelect({ onSelectMode }) {
  const [selectedMode, setSelectedMode] = useState(null);

  const handleStart = () => {
    if (selectedMode) {
      onSelectMode(selectedMode);
    }
  };

  return (
    <div className="study-sets-select">
      <div className="study-sets-header">
        <h2 className="study-sets-title">Study Sets</h2>
        <p className="study-sets-subtitle">
          Challenge yourself by mixing cards from multiple default categories
        </p>
      </div>

      {/* Mode Segmented Control */}
      <div className="mode-selector">
        <p className="mode-selector-label">Choose Difficulty</p>
        <div className="mode-toggle">
          {MODES.map((mode) => (
            <button
              key={mode.key}
              className={`mode-toggle-btn ${selectedMode === mode.key ? 'mode-toggle-btn--active' : ''}`}
              onClick={() => setSelectedMode(mode.key)}
            >
              <span className="mode-toggle-emoji">{mode.emoji}</span>
              <span className="mode-toggle-label">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Description */}
      {selectedMode && (
        <div className="mode-info">
          <span className="mode-info-emoji">
            {MODES.find(m => m.key === selectedMode)?.emoji}
          </span>
          <span className="mode-info-text">
            {MODES.find(m => m.key === selectedMode)?.desc}
          </span>
        </div>
      )}

      {/* Start Session CTA */}
      <button
        className={`start-session-btn ${selectedMode ? '' : 'start-session-btn--disabled'}`}
        onClick={handleStart}
        disabled={!selectedMode}
      >
        Start Session →
      </button>
    </div>
  );
}
