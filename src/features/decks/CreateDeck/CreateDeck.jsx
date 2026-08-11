import { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { supabase } from '../../../services/supabase';
import './CreateDeck.css';

export default function CreateDeck({ isOpen, onClose, onDeckCreated }) {
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [showPicker, setShowPicker] = useState(false);
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const addCard = () => {
    setCards(prev => [...prev, { front: '', back: '' }]);
  };

  const removeCard = (index) => {
    if (cards.length <= 1) return;
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const updateCard = (index, field, value) => {
    setCards(prev => prev.map((card, i) =>
      i === index ? { ...card, [field]: value } : card
    ));
  };

  const handleSave = async () => {
    // Validation
    if (!deckName.trim()) {
      setError('Please enter a deck name.');
      return;
    }

    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError('Please add at least one card with both front and back content.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      // Insert deck
      const deckPayload = {
        title: deckName.trim(),
        description: description.trim() || null,
        is_system: false,
        icon: selectedIcon,
      };

      let { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert([deckPayload])
        .select()
        .single();

      // Graceful fallback if the user hasn't run the migration yet
      if (deckError && (deckError.code === '42703' || deckError.code === 'PGRST204' || deckError.message?.includes('icon'))) {
        console.warn('Icon column not found, falling back to legacy insert.');
        const fallbackPayload = { ...deckPayload };
        delete fallbackPayload.icon;
        const fallbackRes = await supabase.from('decks').insert([fallbackPayload]).select().single();
        deckData = fallbackRes.data;
        deckError = fallbackRes.error;
      }

      if (deckError) throw deckError;

      // Insert cards
      const cardRows = validCards.map(c => ({
        deck_id: deckData.id,
        front: c.front.trim(),
        back: c.back.trim(),
      }));

      const { error: cardsError } = await supabase
        .from('cards')
        .insert(cardRows);

      if (cardsError) throw cardsError;

      // Reset form and close
      setDeckName('');
      setDescription('');
      setSelectedIcon('📁');
      setCards([{ front: '', back: '' }]);
      onDeckCreated?.(deckData);
      onClose();
    } catch (err) {
      console.error('Error saving deck:', err);
      setError(err.message || 'Failed to save deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="create-deck-overlay" onClick={handleOverlayClick}>
      <div className="create-deck-modal" role="dialog" aria-labelledby="create-deck-title">
        {/* Header */}
        <div className="create-deck-header">
          <h2 id="create-deck-title" className="create-deck-title">Create New Deck</h2>
          <button className="create-deck-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="create-deck-body">
          {error && (
            <div className="create-deck-error" role="alert">{error}</div>
          )}

          {/* Deck Info */}
          <div className="create-deck-field">
            <label className="create-deck-label">Deck Icon</label>
            <div className="create-deck-icon-picker-container">
              <button
                className="create-deck-icon-trigger"
                onClick={() => setShowPicker(!showPicker)}
                title="Choose an icon"
              >
                {selectedIcon}
              </button>
              {showPicker && (
                <div className="create-deck-emoji-popover">
                  <div className="create-deck-emoji-overlay" onClick={() => setShowPicker(false)} />
                  <div className="create-deck-picker-wrapper">
                    <Picker 
                      data={data} 
                      native={true}
                      onEmojiSelect={(emoji) => {
                        setSelectedIcon(emoji.native);
                        setShowPicker(false);
                      }} 
                      theme="light"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="create-deck-field">
            <label htmlFor="deck-name" className="create-deck-label">Deck Name</label>
            <input
              id="deck-name"
              type="text"
              className="create-deck-input"
              placeholder="e.g. Japanese Vocabulary"
              value={deckName}
              onChange={e => setDeckName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="create-deck-field">
            <label htmlFor="deck-desc" className="create-deck-label">
              Description <span className="create-deck-optional">(optional)</span>
            </label>
            <textarea
              id="deck-desc"
              className="create-deck-textarea"
              placeholder="What is this deck about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Divider */}
          <div className="create-deck-divider">
            <span>Cards ({cards.length})</span>
          </div>

          {/* Card List */}
          <div className="create-deck-cards">
            {cards.map((card, index) => (
              <div key={index} className="create-deck-card-row">
                <div className="create-deck-card-number">{index + 1}</div>
                <div className="create-deck-card-fields">
                  <input
                    type="text"
                    className="create-deck-input"
                    placeholder="Front (Question)"
                    value={card.front}
                    onChange={e => updateCard(index, 'front', e.target.value)}
                  />
                  <input
                    type="text"
                    className="create-deck-input"
                    placeholder="Back (Answer)"
                    value={card.back}
                    onChange={e => updateCard(index, 'back', e.target.value)}
                  />
                </div>
                <button
                  className="create-deck-remove-card"
                  onClick={() => removeCard(index)}
                  disabled={cards.length <= 1}
                  aria-label={`Remove card ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button className="create-deck-add-card" onClick={addCard}>
            + Add Card
          </button>
        </div>

        {/* Footer */}
        <div className="create-deck-footer">
          <button
            className="create-deck-btn create-deck-btn--cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="create-deck-btn create-deck-btn--save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Deck'}
          </button>
        </div>
      </div>
    </div>
  );
}
